import pool from "../config/db.js";
import { findUserByUsernameQuery, createUserQuery } from '../constants/sql/userQueries.js';

async function createUser(req, res) {
  try {
    const {email, password} = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Username and password required' });

    const userExists = await pool.query(findUserByUsernameQuery, [email]);
    
    if (userExists.rows.length > 0) return res.status(409).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(createUserQuery, [
      email,
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

}

export {createUser};