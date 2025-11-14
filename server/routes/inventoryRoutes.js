import express from 'express';
import { getStockOverview, getTransactionLedger } from '../controllers/inventoryController.js';
const router = express.Router();

router.get('/stock', getStockOverview);
router.get('/ledger', getTransactionLedger);

export default router;
