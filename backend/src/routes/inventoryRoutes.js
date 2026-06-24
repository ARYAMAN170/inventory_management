import express from 'express';
import { getInventory, logTransaction } from '../controllers/inventoryController.js';

const router = express.Router();

// This matches: GET http://localhost:5000/api/inventory
router.get('/', getInventory);

// This matches: POST http://localhost:5000/api/inventory
router.post('/', logTransaction);

export default router;