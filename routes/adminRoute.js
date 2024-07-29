import express from 'express';
import { getUsers, getUserStats, getGigStats, getOrderStats } from '../controllers/adminController.js';
import { auth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.use(auth, isAdmin);

router.get('/users', getUsers);
router.get('/user-stats', getUserStats);
router.get('/gig-stats', getGigStats);
router.get('/order-stats', getOrderStats);
router.get('/disputes', getDisputes);
router.post('/disputes/:disputeId/resolve', resolveDispute);

export default router;