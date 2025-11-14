import kafka from '../config/kafka.js';
import pool from '../config/db.js';
import {
  createInventoryQuery,
  getStockByProductQuery,
  updateBatchQuantityQuery,
  createSaleEntryQuery
} from "../constants/sql/inventoryQueries.js";

const consumer = kafka.consumer({ groupId: 'inventory-group' });

//Start Kafka Consumer
export async function startConsumer(io) {
  try {
    await consumer.connect();
    console.log("Kafka consumer connected");

    await consumer.subscribe({ topic: 'inventory.purchase', fromBeginning: true });
    await consumer.subscribe({ topic: 'inventory.sale', fromBeginning: true });

    // Start message consumption
    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const payload = JSON.parse(message.value.toString());

        try {
          if (topic === "inventory.purchase") {
            await processPurchase(payload, io);

          } else if (topic === "inventory.sale") {
            await processSale(payload, io);
          }

        } catch (err) {
          console.error(`Error processing message from ${topic}:`, err.message);
        }
      }
    });

  } catch (err) {
    console.error("Consumer failed:", err.message);
  }
}


//PROCESS PURCHASE (INSERT NEW BATCH)
async function processPurchase(event, io) {
  const { event_id, product_id, quantity, unit_price, timestamp } = event;

  await pool.query(createInventoryQuery, [
    event_id, product_id, quantity, unit_price, timestamp,
  ]);

  console.log(`Purchase recorded → Batch: ${event_id}`);

  // Emit real-time ledger update
  io.emit("ledgerUpdate", {
    type: "purchase",
    product_id,
    quantity,
    unit_price,
    timestamp,
  });
}


//PROCESS SALE (FIFO DEDUCTION)
async function processSale(event, io) {
  const { event_id, product_id, quantity, timestamp } = event;

  let remainingQty = quantity;
  let totalCost = 0;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Fetch FIFO batches (locked)
    const { rows: batches } = await client.query(
      getStockByProductQuery,
      [product_id]
    );

    if (batches.length === 0) throw new Error(`No stock available for product ${product_id}`);

    // FIFO consumption
    for (const batch of batches) {
      if (remainingQty <= 0) break;

      const qtyUsed = Math.min(batch.quantity_remaining, remainingQty);
      const cost = qtyUsed * parseFloat(batch.unit_price);

      totalCost += cost;
      remainingQty -= qtyUsed;

      // Reduce or delete batch
      await client.query(updateBatchQuantityQuery, [
        qtyUsed,
        batch.batch_id
      ]);
    }

    if (remainingQty > 0) throw new Error(`Not enough inventory for product ${product_id}`);

    // Insert sale record
    await client.query(createSaleEntryQuery, [
      event_id,
      product_id,
      quantity,
      totalCost,
      timestamp,
    ]);

    await client.query("COMMIT");

    console.log(`Sale processed → ${event_id} | COGS: ${totalCost}`);

    // Emit real-time update
    io.emit("ledgerUpdate", {
      type: "sale",
      product_id,
      quantity,
      cogs: totalCost,
      timestamp,
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Sale processing failed:", err.message);
  } finally {
    client.release();
  }
}

//SHUTDOWN HANDLER
export async function shutdown() {
  console.log("Shutting down Kafka consumer...");
  try {
    await consumer.disconnect();
    console.log("Kafka consumer disconnected.");
  } catch (err) {
    console.error("Error during consumer shutdown:", err.message);
  }
}

// Attach system signal handlers
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
