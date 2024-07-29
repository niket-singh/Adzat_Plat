import express from 'express';
import { createContent, reviewContent } from '../controllers/contentController.js';
import { auth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.post('/', auth, createContent);
router.post('/review', auth, isAdmin, reviewContent);

export default router;