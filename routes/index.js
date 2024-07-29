import express from 'express';
import authRoute from './authRoutes.js';
import userRoute from './userRoutes.js';
import gigRoute from './gigRoutes.js';
import orderRoute from './orderRoutes.js';
import reviewRoute from './reviewRoutes.js';
import chatRoute from './chatRoutes.js';
import adminRoute from './adminRoutes.js';
import paymentRoute from './paymentRoutes.js';
import dashboardRoute from './dashboardRoutes.js';
import disputeRoute from './disputeRoutes.js';
import modetationRoute from './modetationRoutes.js';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/gigs', gigRoute);
router.use('/orders', orderRoute);
router.use('/reviews', reviewRoute);
router.use('/chats', chatRoute);
router.use('/admin', adminRoute);
router.use('/payments', paymentRoute);
router.use('/dashboard', dashboardRoute);
router.use('/disputes', disputeRoute);
router.use('/moderation', modetationRoute);

export default router;