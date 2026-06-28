import express from 'express';
import { getLiveInventory, logTransaction } from '../controllers/inventoryController.js';
import {syncOpeningStock} from "../services/sheetService.js";

const router = express.Router();

// This matches: GET http://localhost:5000/api/inventory
router.get('/', getLiveInventory);

// This matches: POST http://localhost:5000/api/inventory
router.post('/', logTransaction);
router.post('/sync-opening', syncOpeningStock);
export default router;