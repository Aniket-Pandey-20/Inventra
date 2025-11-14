import pool from '../config/db.js';
import { getStockOverviewQuery, getTransactionLedgerQuery, getBatchForProduct } from '../constants/sql/inventoryQueries.js';

// GET /api/inventory/stock
async function getStockOverview(req, res) {
  try {
    const products = await pool.query(getStockOverviewQuery);
    const batches  = await pool.query(getBatchForProduct);
    
    res.json({'products' : products.rows, 'batches' : batches.rows});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stock overview' });
  }
}

// GET /api/inventory/ledger
async function getTransactionLedger(req, res) {
  try {
    // Combine purchases and sales in time-series order
    const { rows } = await pool.query(getTransactionLedgerQuery);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transaction ledger' });
  }
}

export { getStockOverview, getTransactionLedger };
