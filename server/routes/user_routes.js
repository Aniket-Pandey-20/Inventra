import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { userQueries } from '../constants/sql/userQueries.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post('/addUser', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Username and password required' });

    const userExists = await pool.query(userQueries.getUserByUsername, [username]);
    if (userExists.rows.length > 0)
      return res.status(409).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(userQueries.insertUser, [
      username,
      hashedPassword,
      email,
    ]);

    res.status(201).json({
      message: 'User created successfully',
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}); 

export default router;