import express from 'express';
import { getChats, sendMessage } from '../controllers/chatController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getChats);
router.post('/send', auth, sendMessage);

export default router;