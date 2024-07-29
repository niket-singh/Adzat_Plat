import express from 'express';
import { body } from 'express-validator';
import { createGig, getGigs, getGig, updateGig, deleteGig } from '../controllers/gigController.js';
import { auth } from '../middleware/auth.js';
import { validateInput } from '../middleware/inputValidation.js';
import { upload } from '../utils/fileUpload.js';

const router = express.Router();

router.post('/', auth, upload.array('images', 5), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('deliveryTime').isNumeric().withMessage('Delivery time must be a number'),
], validateInput, createGig);

router.get('/', getGigs);
router.get('/:id', getGig);
router.put('/:id', auth, upload.array('images', 5), updateGig);
router.delete('/:id', auth, deleteGig);

export default router;