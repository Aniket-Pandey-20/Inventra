import kafka from '../config/kafka.js';
import pool from '../config/db.js';
import { createInventory, getStockByProduct, updateBatchQuantity, createSaleEntry } from "../constants/sql/inventoryQueries.js";

const consumer = kafka.consumer({ groupId: 'inventory-group' });

//Start the consumer service
export async function startConsumer(io) {
  await consumer.connect();
  console.log('Kafka consumer connected');

  // Subscribe to topics
  await consumer.subscribe({ topic: 'inventory.purchase', fromBeginning: true });
  await consumer.subscribe({ topic: 'inventory.sale', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const payload = JSON.parse(message.value.toString());

      try {
        if (topic === 'inventory.purchase') {
          await handlePurchase(payload);

          // Emit real-time event to frontend
          io.emit('ledgerUpdate', {
            type: 'purchase',
            product_id: payload.product_id,
            quantity: payload.quantity,
            unit_price: payload.unit_price,
            timestamp: payload.timestamp,
          });
        } else if (topic === 'inventory.sale') {
          await handleSale(payload);

          // Emit real-time event to frontend
          io.emit('ledgerUpdate', {
            type: 'sale',
            product_id: payload.product_id,
            quantity: payload.quantity,
            cogs: payload.cogs, // if you calculate and attach in handleSale
            timestamp: payload.timestamp,
          });
        }
      } catch (err) {
        console.error(`Error processing message from ${topic}:`, err.message);
      }
    }
  });
}


// --------------------
// Handle Purchase
async function handlePurchase(event) {
  const { event_id, product_id, quantity, unit_price, timestamp } = event;

  await pool.query(createInventory, [event_id, product_id, quantity, unit_price, timestamp]);
  console.log(`Purchase recorded: ${event_id}`);
}

// --------------------
// Handle Sale with FIFO
async function handleSale(event) {
  const { event_id, product_id, quantity, timestamp } = event;
  let remainingQty = quantity;
  let totalCost = 0;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: batches } = await client.query(
      getStockByProduct,
      [product_id]
    );

    const consumedBatches = [];

    for (const batch of batches) {
      if (remainingQty <= 0) break;

      const qtyUsed = Math.min(batch.quantity_remaining, remainingQty);
      const cost = qtyUsed * parseFloat(batch.unit_price);

      consumedBatches.push({
        batch_id: batch.batch_id,
        qty_used: qtyUsed,
        rate: batch.unit_price
      });

      totalCost += cost;
      remainingQty -= qtyUsed;

      await client.query(
        updateBatchQuantity,
        [qtyUsed, batch.batch_id]
      );
    }

    if (remainingQty > 0) {
      throw new Error(`Not enough inventory for product ${product_id}`);
    }

    await client.query(
      createSaleEntry,
      [event_id, product_id, quantity, totalCost, timestamp]
    );

    await client.query('COMMIT');
    console.log(`Sale processed: ${event_id} | Total COGS: ${totalCost}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Sale processing failed:', err.message);
  } finally {
    client.release();
  }
}
