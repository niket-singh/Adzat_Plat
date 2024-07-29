import express from 'express';
import { body } from 'express-validator';
import { createReview, getReviews } from '../controllers/reviewController.js';
import { auth } from '../middleware/auth.js';
import { validateInput } from '../middleware/inputValidation.js';

const router = express.Router();

router.post('/', auth, [
  body('gigId').notEmpty().withMessage('Gig ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required'),
], validateInput, createReview);

router.get('/:gigId', getReviews);

export default router;