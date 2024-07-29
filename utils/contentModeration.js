import axios from 'axios';
import logger from '../config/logger.js';

const CONTENT_MODERATION_API = process.env.CONTENT_MODERATION_API;

export const moderateContent = async (content) => {
  try {
    const response = await axios.post(CONTENT_MODERATION_API, { content });
    return response.data.isFlagged;
  } catch (error) {
    logger.error('Error in content moderation:', error);
    return true; // Flag content if moderation fails
  }
};