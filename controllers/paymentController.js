import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

export const initiatePayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Implement payment gateway integration here
    // For this example, we'll just create a payment record
    const payment = new Payment({
      order: orderId,
      amount: order.amount,
      status: 'pending'
    });
    await payment.save();
    res.status(200).json({ paymentId: payment._id });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, status } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    payment.status = status;
    await payment.save();
    if (status === 'completed') {
      const order = await Order.findById(payment.order);
      order.paymentStatus = 'paid';
      await order.save();
    }
    res.status(200).json({ message: "Payment status updated" });
  } catch (error) {
    next(error);
  }
};

export const releaseEscrow = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.escrowStatus !== 'funds_held') {
      return res.status(400).json({ message: 'Funds are not in escrow' });
    }

    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to release funds' });
    }

    order.escrowStatus = 'funds_released';
    await order.save();

    const seller = await User.findById(order.seller);
    seller.earnings += order.price;
    await seller.save();

    logger.info(`Funds released for order: ${orderId}`);
    res.status(200).json({ message: 'Funds released to seller' });
  } catch (error) {
    logger.error('Error releasing escrow:', error);
    next(error);
  }
};