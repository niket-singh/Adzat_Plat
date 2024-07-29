import User from '../models/User.js';
import Gig from '../models/Gig.js';
import Order from '../models/Order.js';
import logger from '../config/logger.js';
import Dispute from '../models/Dispute.js';

export const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    next(error);
  }
};

export const getUserStats = async (_req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const userTypes = await User.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);
    res.status(200).json({ totalUsers, userTypes });
  } catch (error) {
    logger.error('Error fetching user stats:', error);
    next(error);
  }
};

export const getGigStats = async (_req, res, next) => {
  try {
    const totalGigs = await Gig.countDocuments();
    const gigsByCategory = await Gig.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.status(200).json({ totalGigs, gigsByCategory });
  } catch (error) {
    logger.error('Error fetching gig stats:', error);
    next(error);
  }
};

export const getOrderStats = async (_req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    res.status(200).json({ 
      totalOrders, 
      ordersByStatus, 
      totalRevenue: totalRevenue[0]?.total || 0 
    });
  } catch (error) {
    logger.error('Error fetching order stats:', error);
    next(error);
  }
};

export const getDisputes = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    
    const disputes = await Dispute.find(query)
      .populate('order')
      .populate('initiator', 'name email')
      .populate('respondent', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const total = await Dispute.countDocuments(query);
    
    res.status(200).json({
      disputes,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDisputes: total
    });
  } catch (error) {
    logger.error('Error fetching disputes:', error);
    next(error);
  }
};

export const resolveDispute = async (req, res, next) => {
  try {
    const { disputeId } = req.params;
    const { resolution, adminNotes, action } = req.body;
    
    const dispute = await Dispute.findById(disputeId).populate('order');
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    
    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.adminNotes = adminNotes;
    
    const order = dispute.order;
    
    if (action === 'refund') {
      order.status = 'cancelled';
      order.escrowStatus = 'funds_refunded';
      const buyer = await User.findById(order.buyer);
      buyer.tokens += order.price; // Assuming price is in tokens
      await buyer.save();
    } else if (action === 'release') {
      order.status = 'completed';
      order.escrowStatus = 'funds_released';
      const seller = await User.findById(order.seller);
      seller.earnings += order.price;
      await seller.save();
    }
    
    await order.save();
    await dispute.save();
    
    logger.info(`Dispute ${disputeId} resolved with action: ${action}`);
    res.status(200).json({ message: 'Dispute resolved', dispute });
  } catch (error) {
    logger.error('Error resolving dispute:', error);
    next(error);
  }
};