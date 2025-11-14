import express from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user_routes.js";

dotenv.config();

const app = express();
app.use(express.json());

pool.query("SELECT NOW()", (err, res) => {
  if (err) console.error("❌ Database connection failed", err);
  else console.log("🕒 Database time:", res.rows[0].now);
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
