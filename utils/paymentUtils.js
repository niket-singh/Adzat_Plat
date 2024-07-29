import stripe from 'stripe';
import Order from '../models/Order.js';
import User from '../models/User.js';
import logger from '../config/logger.js';

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

export const createEscrowPayment = async (orderId, tokenAmount) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const buyer = await User.findById(order.buyer);
    if (buyer.tokens < tokenAmount) {
      throw new Error('Insufficient tokens');
    }

    // Deduct tokens from buyer
    buyer.tokens -= tokenAmount;
    await buyer.save();

    // Update order status
    order.escrowStatus = 'funds_held';
    await order.save();

    logger.info(`Escrow payment created for order: ${orderId}`);
    return { success: true, message: 'Escrow payment created' };
  } catch (error) {
    logger.error('Error creating escrow payment:', error);
    throw error;
  }
};

export const releaseEscrowPayment = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order || order.escrowStatus !== 'funds_held') {
      throw new Error('Invalid order or funds not in escrow');
    }

    const seller = await User.findById(order.seller);

    // Release funds to seller
    seller.earnings += order.price;
    await seller.save();

    // Update order status
    order.escrowStatus = 'funds_released';
    order.status = 'completed';
    await order.save();

    logger.info(`Escrow payment released for order: ${orderId}`);
    return { success: true, message: 'Escrow payment released' };
  } catch (error) {
    logger.error('Error releasing escrow payment:', error);
    throw error;
  }
};

export const refundEscrowPayment = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order || order.escrowStatus !== 'funds_held') {
      throw new Error('Invalid order or funds not in escrow');
    }

    const buyer = await User.findById(order.buyer);

    // Refund tokens to buyer
    buyer.tokens += order.price;
    await buyer.save();

    // Update order status
    order.escrowStatus = 'funds_refunded';
    order.status = 'cancelled';
    await order.save();

    logger.info(`Escrow payment refunded for order: ${orderId}`);
    return { success: true, message: 'Escrow payment refunded' };
  } catch (error) {
    logger.error('Error refunding escrow payment:', error);
    throw error;
  }
};