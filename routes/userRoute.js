import express from 'express';
import { getUserProfile, updateUserProfile, uploadPastWork } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);
router.post('/past-work', auth, uploadPastWork);

export default router;