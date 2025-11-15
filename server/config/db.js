import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false
  }
  //ssl: false -- For local setup comment above line
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database:", process.env.PGDATABASE);
});

export default pool;
