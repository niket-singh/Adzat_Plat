import { moderateContent } from '../utils/contentModeration.js';
import logger from '../config/logger.js';

export const createContent = async (req, res, next) => {
  try {
    const { content } = req.body;
    const isFlagged = await moderateContent(content);

    if (isFlagged) {
      // Queue for human review
      // This could be implemented as a new model/collection in your database
      await queueForReview(content, req.user.id);
      return res.status(202).json({ message: 'Content queued for review' });
    }

    // Publish content
    const publishedContent = await publishContent(content, req.user.id);
    res.status(201).json(publishedContent);
  } catch (error) {
    logger.error('Error in content creation:', error);
    next(error);
  }
};

export const reviewContent = async (req, res, next) => {
  try {
    const { contentId, approved } = req.body;
    const content = await getQueuedContent(contentId);

    if (approved) {
      const publishedContent = await publishContent(content.content, content.userId);
      res.status(200).json(publishedContent);
    } else {
      await notifyUser(content.userId, 'Your content was not approved');
      res.status(200).json({ message: 'Content rejected' });
    }
  } catch (error) {
    logger.error('Error in content review:', error);
    next(error);
  }
};