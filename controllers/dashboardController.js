import User from '../models/User.js';
import Order from '../models/Order.js';
import Gig from '../models/Gig.js';
import Payment from '../models/Payment.js';

export const getUserDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const orders = await Order.find({ client: req.user.id }).populate('gig');
    const totalSpent = await Payment.aggregate([
      { $match: { order: { $in: orders.map(o => o._id) } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      user,
      orders,
      totalSpent: totalSpent[0]?.total || 0
    });
  } catch (error) {
    next(error);
  }
};

export const getFreelancerDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const gigs = await Gig.find({ user: req.user.id });
    const orders = await Order.find({ freelancer: req.user.id }).populate('gig');
    const totalEarned = await Payment.aggregate([
      { $match: { order: { $in: orders.map(o => o._id) } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      user,
      gigs,
      orders,
      totalEarned: totalEarned[0]?.total || 0
    });
  } catch (error) {
    next(error);
  }
};