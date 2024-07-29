import Stripe from 'stripe';
import Order from '../models/Order.js';
import logger from '../config/logger.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.price * 100, // Stripe expects amount in cents
      currency: 'usd',
      metadata: { orderId: order._id.toString() }
    });

    return paymentIntent.client_secret;
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    throw error;
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    // ... handle other event types
    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

async function handleSuccessfulPayment(paymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    const order = await Order.findById(orderId);
    if (order) {
      order.status = 'in_progress';
      await order.save();
      logger.info(`Payment successful for order: ${orderId}`);
    } else {
      logger.error(`Order not found for successful payment: ${orderId}`);
    }
  }
  