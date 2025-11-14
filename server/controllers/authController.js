import bcrypt from "bcryptjs";
import pool from "../config/db.js";

async function Login(req, res){
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Username and password are required" });

    const result = await pool.query(findUserByUsername, [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ message: "Login successful", userId: user.id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

export { Login }