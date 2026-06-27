// src/routes/transactionRoutes.js
import express from 'express';
import { getRecentTransactions, deleteTransaction } from '../controllers/transactionController.js';

const router = express.Router();

// Notice we just use '/' here, because we will define '/api/transactions' in server.js
router.get('/', getRecentTransactions);
router.delete('/:rowNumber', deleteTransaction);

export default router;