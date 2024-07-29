import Review from 'Adzat_Plat\models\Review.js';
import Gig from '../models/Gig.js';
import Order from '../models/Order.js';
import logger from '../config/logger.js';

export const createReview = async (req, res, next) => {
  try {
    const { gigId, rating, comment } = req.body;

    // Check if the user has ordered and received the gig
    const order = await Order.findOne({ gig: gigId, buyer: req.user.id, status: 'completed' });
    if (!order) {
      return res.status(403).json({ message: 'You can only review gigs you have ordered and received' });
    }

    const review = new Review({
      gig: gigId,
      reviewer: req.user.id,
      rating,
      comment
    });

    await review.save();

    // Update gig's rating
    const gig = await Gig.findById(gigId);
    const reviews = await Review.find({ gig: gigId });
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    gig.rating = averageRating;
    await gig.save();

    logger.info(`New review created: ${review._id}`);
    res.status(201).json(review);
  } catch (error) {
    logger.error('Error in review creation:', error);
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ gig: req.params.gigId })
      .populate('reviewer', 'name');
    res.status(200).json(reviews);
  } catch (error) {
    logger.error('Error in fetching reviews:', error);
    next(error);
  }
};