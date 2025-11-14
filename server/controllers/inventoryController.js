import pool from '../config/db.js';
import { getStockOverview, getTransactionLedger } from '../constants/sql/inventoryQueries.js';

// GET /api/inventory/stock
async function getStockOverview(req, res) {
  try {
    const { rows } = await pool.query(getStockOverview);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stock overview' });
  }
}

// GET /api/inventory/ledger
async function getTransactionLedger(req, res) {
  try {
    // Combine purchases and sales in time-series order
    const { rows } = await pool.query(getTransactionLedger);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transaction ledger' });
  }
}

export { getStockOverview, getTransactionLedger };
