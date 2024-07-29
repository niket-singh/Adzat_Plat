import Gig from '../models/Gig.js';
import logger from '../config/logger.js';

export const createGig = async (req, res, next) => {
  try {
    const { title, description, price, category, tags, deliveryTime, revisions } = req.body;
    
    if (req.user.userType !== 'freelancer' && req.user.userType !== 'agency') {
      return res.status(403).json({ message: 'Only freelancers and agencies can create gigs' });
    }

    if (req.user.tokens < 5) {
      return res.status(403).json({ message: 'Insufficient tokens to create a gig' });
    }

    const images = req.files ? req.files.map(file => file.location) : [];

    const gig = new Gig({
      user: req.user.id,
      title,
      description,
      price,
      category,
      tags,
      deliveryTime,
      revisions,
      images
    });

    await gig.save();

    req.user.tokens -= 5;
    await req.user.save();

    logger.info(`New gig created: ${gig._id} by user ${req.user.id}`);
    res.status(201).json(gig);
  } catch (error) {
    logger.error('Error in gig creation:', error);
    next(error);
  }
};

export const getGigs = async (req, res, next) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      deliveryTime,
      rating,
      tags,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (deliveryTime) query.deliveryTime = { $lte: Number(deliveryTime) };
    if (rating) query.rating = { $gte: Number(rating) };
    if (tags) query.tags = { $in: tags.split(',') };

    const sortOptions = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    }

    const skip = (page - 1) * limit;

    const gigs = await Gig.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name rating')
      .exec();

    const total = await Gig.countDocuments(query);

    res.status(200).json({
      gigs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalGigs: total
    });
  } catch (error) {
    logger.error('Error fetching gigs:', error);
    next(error);
  }
};

export const getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('user', 'name rating');
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    res.status(200).json(gig);
  } catch (error) {
    logger.error('Error in fetching gig:', error);
    next(error);
  }
};

export const updateGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    if (gig.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own gigs' });
    }

    const updates = req.body;
    if (req.files) {
      updates.images = req.files.map(file => file.location);
    }

    const updatedGig = await Gig.findByIdAndUpdate(req.params.id, updates, { new: true });
    logger.info(`Gig updated: ${updatedGig._id}`);
    res.status(200).json(updatedGig);
  } catch (error) {
    logger.error('Error in updating gig:', error);
    next(error);
  }
};

export const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    if (gig.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own gigs' });
    }

    await gig.remove();
    logger.info(`Gig deleted: ${gig._id}`);
    res.status(200).json({ message: 'Gig deleted successfully' });
  } catch (error) {
    logger.error('Error in deleting gig:', error);
    next(error);
  }
};