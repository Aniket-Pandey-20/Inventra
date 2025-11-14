// app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import simulatorRoutes from "./routes/simulatorRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import { startConsumer } from "./kafka/kafkaConsumer.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// DB health-check
pool.query("SELECT NOW()", (err, res) => {
  if (err) console.error("Database connection failed", err);
  else console.log("🕒 Database time:", res.rows[0].now);
});

// Create HTTP server and attach Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

//make io accessible via app
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api", simulatorRoutes);

// Start HTTP server then start Kafka consumer passing io
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    // startConsumer should accept io and use it to emit ledger updates
    await startConsumer(io);
    console.log("Kafka consumer started");
  } catch (err) {
    console.error("Failed to start Kafka consumer", err);
  }
});

// Shutdown
const shutdown = async () => {
  console.log("Shutting down...");
  try {
    io.close();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown", err);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
