import express from 'express';
import { getUserDashboard, getFreelancerDashboard } from '../controllers/dashboardController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/user', auth, getUserDashboard);
router.get('/freelancer', auth, getFreelancerDashboard);

export default router;