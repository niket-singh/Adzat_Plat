import axios from 'axios';
import logger from '../config/logger.js';

export const sendOtpService = async (phoneNumber) => {
  try {
    const response = await axios.post(process.env.OTP_SERVICE_URL, {
      phoneNumber,
      template: 'Your OTP is: {{otp}}'
    });
    return response.data;
  } catch (error) {
    logger.error('Error sending OTP:', error);
    throw error;
  }
};

export const verifyOtpService = async (phoneNumber, otp) => {
  try {
    const response = await axios.post(`${process.env.OTP_SERVICE_URL}/verify`, {
      phoneNumber,
      otp
    });
    return response.data;
  } catch (error) {
    logger.error('Error verifying OTP:', error);
    throw error;
  }
};