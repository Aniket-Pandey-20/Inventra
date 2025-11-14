/**
 * simulator.service.js
 * -----------------------------------------------------
 * This service generates 7–10 realistic inventory events
 * (purchase + sale) and publishes them to Kafka.
 *
 * It is designed to be triggered from an API endpoint,
 * NOT as a standalone script.
 *
 * Used by: POST /api/simulateTransactions
 * -----------------------------------------------------
 */

import kafka from "../config/kafka.js";
import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const producer = kafka.producer();

/* ----------------------------------------------------
   1. Fetch all products
---------------------------------------------------- */
async function fetchProducts() {
  const { rows } = await pool.query("SELECT product_id, name FROM products");
  return rows;
}

/* ----------------------------------------------------
   2. Get inventory stock for a product
---------------------------------------------------- */
async function getAvailableStock(productId) {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(quantity_remaining), 0) AS stock
     FROM inventory_batches
     WHERE product_id = $1`,
    [productId]
  );

  return parseInt(rows[0].stock, 10);
}

/* ----------------------------------------------------
   3. Build Purchase Event
---------------------------------------------------- */
function buildPurchaseEvent(product) {
  return {
    event_id: uuidv4(),
    batch_id: uuidv4().slice(0, 8),
    product_id: product.product_id,
    quantity: Math.floor(Math.random() * 20) + 5, // 5–25 units
    unit_price: parseFloat((Math.random() * 200 + 50).toFixed(2)),
    timestamp: new Date().toISOString()
  };
}

/* ----------------------------------------------------
   4. Build Sale Event (valid only if stock > 0)
---------------------------------------------------- */
async function buildSaleEvent(product) {
  const stock = await getAvailableStock(product.product_id);

  if (stock <= 0) return null; // Skip sale if no inventory

  return {
    event_id: uuidv4(),
    product_id: product.product_id,
    quantity: Math.floor(Math.random() * stock) + 1, // 1 → available stock
    timestamp: new Date().toISOString()
  };
}

/* ----------------------------------------------------
   5. Publish event to Kafka
---------------------------------------------------- */
async function publishEvent(topic, event) {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(event) }]
  });

  console.log(`Sent ${topic}:`, event);
}

/* ----------------------------------------------------
   6. Main Simulation Logic (API-compatible)
---------------------------------------------------- */
export async function runTransactionSimulation() {
  console.log("Starting transaction simulation...");

  await producer.connect();

  const products = await fetchProducts();
  if (!products.length) throw new Error("No products found in the database");

  const totalEvents = Math.floor(Math.random() * 4) + 7; // 7–10 events
  const emittedEvents = [];

  for (let i = 0; i < totalEvents; i++) {
    const product = products[Math.floor(Math.random() * products.length)];

    const isPurchase = Math.random() < 0.6; // 60% purchase chance

    if (isPurchase) {
      const event = buildPurchaseEvent(product);
      await publishEvent("inventory.purchase", event);
      emittedEvents.push({ ...event, type: "purchase" });

    } else {
      const event = await buildSaleEvent(product);

      if (event) {
        await publishEvent("inventory.sale", event);
        emittedEvents.push({ ...event, type: "sale" });
      } else {
        console.log(`Sale skipped — no stock for ${product.name}`);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 800)); // Delay for realism
  }

  await producer.disconnect();

  console.log("Simulation complete.");
  
  //Return to controller
  return emittedEvents;
}
