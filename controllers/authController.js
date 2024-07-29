import User from '../models/User.js';
import { generateToken } from '../utils/tokenUtils.js';
import { sendOtpService, verifyOtpService } from '../utils/otpService.js';
import logger from '../config/logger.js';
import { processEscrowPayment } from '../utils/paymentUtils.js';
import Referral from '../models/Referral.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, password, userType, governmentId, referralCode } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if ((userType === 'freelancer' || userType === 'agency') && !phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required for freelancers and agencies' });
    }

    if ((userType === 'freelancer' || userType === 'agency') && !governmentId) {
      return res.status(400).json({ message: 'Government ID is required for freelancers and agencies' });
    }

    if (userType === 'agency') {
      const paymentResult = await processEscrowPayment(req.body.paymentMethodId, process.env.AGENCY_REGISTRATION_FEE);
      if (!paymentResult.success) {
        return res.status(400).json({ message: 'Agency registration fee payment failed' });
      }
    }

    const newReferralCode = Math.random().toString(36).substring(7).toUpperCase();
    let user = new User({ name, email, phoneNumber, password, userType, governmentId, referralCode: newReferralCode });

    await user.save();
    user.disburseInitialTokens();
    await user.save();

    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        const newReferral = new Referral({
          referrer: referrer._id,
          referred: user._id,
        });
        await newReferral.save();
        referrer.tokens += 10; // Bonus tokens for referral
        await referrer.save();
      }
    }

    const token = generateToken(user);
    logger.info(`New user registered: ${user.email}`);
    res.status(201).json({ user, token });
  } catch (error) {
    logger.error('Error in user registration:', error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.userType !== 'client' && !user.isVerified) {
      return res.status(401).json({ message: 'Account not verified. Please verify your phone number.' });
    }
    const token = generateToken(user);
    logger.info(`User logged in: ${user.email}`);
    res.status(200).json({ user, token });
  } catch (error) {
    logger.error('Error in user login:', error);
    next(error);
  }
};

export const sendOtp = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const result = await sendOtpService(phoneNumber);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in sending OTP:', error);
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const result = await sendOtpService(phoneNumber);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in resending OTP:', error);
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;
    const result = await verifyOtpService(phoneNumber, otp);
    if (result.type === 'success') {
      const user = await User.findOne({ phoneNumber });
      if (user) {
        user.isVerified = true;
        await user.save();
        const token = generateToken(user);
        res.status(200).json({ message: 'OTP verified', token });
      } else {
        res.status(200).json({ message: 'OTP verified, user not found' });
      }
    } else {
      res.status(400).json({ message: 'OTP verification failed' });
    }
  } catch (error) {
    logger.error('Error in verifying OTP:', error);
    next(error);
  }
};
