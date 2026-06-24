import express from 'express';
import { createOrder, getOrders, updateStatus } from '../controllers/salesController.js';

const router = express.Router(); // <-- This line must come before the routes!

router.post('/', createOrder);         // POST /api/create-order
router.get('/list', getOrders);        // GET /api/create-order/list
router.put('/status', updateStatus);   // PUT /api/create-order/status

export default router;