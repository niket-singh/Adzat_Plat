import express from 'express';
import { body } from 'express-validator';
import { createOrder, getOrders, getOrder, updateOrderStatus, deliverOrder } from '../controllers/orderController.js';
import { auth } from '../middleware/auth.js';
import { validateInput } from '../middleware/inputValidation.js';

const router = express.Router();

router.post('/', auth, [
  body('gigId').notEmpty().withMessage('Gig ID is required'),
  body('requirements').notEmpty().withMessage('Requirements are required'),
], validateInput, createOrder);

router.get('/', auth, getOrders);
router.get('/:id', auth, getOrder);
router.put('/:id/status', auth, updateOrderStatus);
router.put('/:id/deliver', auth, deliverOrder);

export default router;
