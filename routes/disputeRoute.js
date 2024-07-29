import express from 'express';
import { createDispute } from '../controllers/disputeController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createDispute);

export default router;