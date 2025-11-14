// testRealTimeLedger.mjs
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import { sendInventoryEvent } from './kafka/kafkaProducer.js';
import { startConsumer } from './kafka/kafkaConsumer.js';
import pool from './config/db.js';
import { io as Client } from "socket.io-client";

// -------------------
// Step 1: Setup mock frontend listener
const socket = Client("http://localhost:5000"); // make sure server is running

socket.on("connect", () => console.log("✅ Connected to Socket.IO server"));
socket.on("ledgerUpdate", (event) => {
  console.log("📣 Real-time ledger event received:", event);
});

// -------------------
// Step 2: Start consumer
startConsumer(socket); // pass the socket instance for real-time emissions

// -------------------
// Step 3: Wait for consumer to connect
setTimeout(async () => {
  console.log("⏳ Sending test events...");

  const events = [
    { type: 'purchase', product_id: 'PRD001', quantity: 50, unit_price: 100 },
    { type: 'purchase', product_id: 'PRD002', quantity: 30, unit_price: 150 },
    { type: 'sale', product_id: 'PRD001', quantity: 20 },
    { type: 'sale', product_id: 'PRD002', quantity: 10 },
    { type: 'purchase', product_id: 'PRD001', quantity: 40, unit_price: 110 },
    { type: 'sale', product_id: 'PRD001', quantity: 30 }
  ];

  for (const evt of events) {
    const event_id = uuidv4();
    const payload = {
      event_id,
      product_id: evt.product_id,
      event_type: evt.type,
      quantity: evt.quantity,
      timestamp: new Date().toISOString()
    };
    if (evt.type === 'purchase') payload.unit_price = evt.unit_price;

    const topic = evt.type === 'purchase' ? 'inventory.purchase' : 'inventory.sale';
    await sendInventoryEvent(topic, payload);
  }

  console.log("✅ All test events sent");

  // Wait a few seconds for consumer to process events
  setTimeout(async () => {
    console.log("\n📦 Inventory Batches:");
    const batches = await pool.query('SELECT * FROM inventory_batches ORDER BY purchased_at ASC');
    console.table(batches.rows);

    console.log("\n💰 Sales Table:");
    const sales = await pool.query('SELECT * FROM sales ORDER BY sold_at ASC');
    console.table(sales.rows);

    console.log("✅ Test completed successfully");
    process.exit(0);
  }, 5000);

}, 3000);
