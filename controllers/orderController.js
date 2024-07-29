import Order from '../models/Order.js';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import logger from '../config/logger.js';

export const createOrder = async (req, res, next) => {
  try {
    const { gigId, requirements } = req.body;
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    const order = new Order({
      gig: gig._id,
      buyer: req.user.id,
      seller: gig.user,
      price: gig.price,
      deliveryTime: gig.deliveryTime,
      requirements
    });

    await order.save();
    logger.info(`New order created: ${order._id}`);
    res.status(201).json(order);
  } catch (error) {
    logger.error('Error in order creation:', error);
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ $or: [{ buyer: req.user.id }, { seller: req.user.id }] })
      .populate('gig', 'title')
      .populate('buyer', 'name')
      .populate('seller', 'name');
    res.status(200).json(orders);
  } catch (error) {
    logger.error('Error in fetching orders:', error);
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('gig')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.buyer.toString() !== req.user.id && order.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only view your own orders' });
    }
    res.status(200).json(order);
  } catch (error) {
    logger.error('Error in fetching order:', error);
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own orders' });
    }

    order.status = status;
    await order.save();
    logger.info(`Order status updated: ${order._id}`);
    res.status(200).json(order);
  } catch (error) {
    logger.error('Error in updating order status:', error);
    next(error);
  }
};

export const deliverOrder = async (req, res, next) => {
  try {
    const { deliveredWork } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only deliver your own orders' });
    }

    order.deliveredWork = deliveredWork;
    order.status = 'completed';
    await order.save();

    // Update seller's stats
    const seller = await User.findById(order.seller);
    seller.completedJobs += 1;
    seller.earnings += order.price;
    await seller.save();

    logger.info(`Order delivered: ${order._id}`);
    res.status(200).json(order);
  } catch (error) {
    logger.error('Error in delivering order:', error);
    next(error);
  }
};