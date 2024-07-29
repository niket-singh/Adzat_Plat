import express from 'express';
import { body } from 'express-validator';
import { register, login, sendOtp, resendOtp, verifyOtp } from '../controllers/authController.js';
import { validateInput } from '../middleware/inputValidation.js';

const router = express.Router();

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('userType').isIn(['client', 'freelancer', 'agency']).withMessage('Invalid user type'),
  body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('governmentId').optional().isString().withMessage('Invalid government ID'),
], validateInput, register);

router.post('/login', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
], validateInput, login);

router.post('/send-otp', [
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
], validateInput, sendOtp);

router.post('/resend-otp', [
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
], validateInput, resendOtp);

router.post('/verify-otp', [
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
  body('otp').isLength({ min: 4, max: 6 }).withMessage('Invalid OTP'),
], validateInput, verifyOtp);

export default router;