import { Router } from "express";
import { simulateTransactions } from "../controllers/simulatorController.js";

const router = Router();

router.post("/simulateTransactions", simulateTransactions);

export default router;