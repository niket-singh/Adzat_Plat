import Dispute from '../models/Dispute.js';
import Order from '../models/Order.js';
import logger from '../config/logger.js';

export const createDispute = async (req, res, next) => {
  try {
    const { orderId, reason } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.id !== order.buyer.toString() && req.user.id !== order.seller.toString()) {
      return res.status(403).json({ message: 'Not authorized to create dispute for this order' });
    }

    const dispute = new Dispute({
      order: orderId,
      initiator: req.user.id,
      respondent: req.user.id === order.buyer.toString() ? order.seller : order.buyer,
      reason
    });

    await dispute.save();
    logger.info(`New dispute created for order: ${orderId}`);
    res.status(201).json(dispute);
  } catch (error) {
    logger.error('Error creating dispute:', error);
    next(error);
  }
};