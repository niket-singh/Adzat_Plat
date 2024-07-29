import express from 'express';
import { initiatePayment, verifyPayment } from '../controllers/paymentController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/initiate', auth, initiatePayment);
router.post('/verify', auth, verifyPayment);
router.post('/release-escrow/:orderId', auth, releaseEscrow);

export default router;