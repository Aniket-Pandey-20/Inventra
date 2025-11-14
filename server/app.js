import express from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { startConsumer } from "./kafka/kafkaConsumer.js";

dotenv.config();

const app = express();
app.use(express.json());

//Health Check
pool.query("SELECT NOW()", (err, res) => {
  if (err) console.error("Database connection failed", err);
  else console.log("🕒 Database time:", res.rows[0].now);
});

//Socket setup
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

// Make io accessible in services
app.set('io', io);


//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/inventory', inventoryRoutes);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});

// Start Kafka Consumer
startConsumer(io); // pass io to consumer for real-time updates
