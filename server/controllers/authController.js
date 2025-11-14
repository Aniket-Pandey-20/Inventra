import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { findUserByUsernameQuery } from '../constants/sql/userQueries.js';

async function Login(req, res){
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ success: false, error: "Username and password are required" });

    const result = await pool.query(findUserByUsernameQuery, [email]);
    if (result.rows.length === 0) return res.status(401).json({ success: false, error: "Invalid credentials" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, error: "Invalid credentials" });

    res.json({ success: true, message: "Login successful", userId: user.id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export { Login }