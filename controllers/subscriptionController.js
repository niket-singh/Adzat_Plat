const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const SUBSCRIPTION_PLANS = {
  basic: {
    price: 9.99,
    tokensPerMonth: 50
  },
  premium: {
    price: 19.99,
    tokensPerMonth: 100
  }
};

exports.subscribeUser = async (req, res) => {
  try {
    const { plan, paymentMethodId } = req.body;
    const user = await User.findById(req.user.id);

    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({ msg: 'Invalid subscription plan' });
    }

    // Create or update Stripe customer
    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId }
      });
      user.stripeCustomerId = customer.id;
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: SUBSCRIPTION_PLANS[plan].priceId }],
      expand: ['latest_invoice.payment_intent']
    });

    user.subscription = {
      plan,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };
    user.tokens += SUBSCRIPTION_PLANS[plan].tokensPerMonth;
    await user.save();

    res.json({ subscriptionId: subscription.id, clientSecret: subscription.latest_invoice.payment_intent.client_secret });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.subscription || user.subscription.plan === 'free') {
      return res.status(400).json({ msg: 'No active subscription' });
    }

    // Cancel Stripe subscription
    await stripe.subscriptions.del(user.subscription.stripeSubscriptionId);

    user.subscription = { plan: 'free' };
    await user.save();

    res.json({ msg: 'Subscription cancelled successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.checkAndRenewSubscription = async (userId) => {
  const user = await User.findById(userId);
  if (user.subscription.plan !== 'free' && user.subscription.expiresAt <= new Date()) {
    try {
      // Attempt to charge the user and renew the subscription
      await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
        proration_behavior: 'create_prorations',
        items: [{ id: user.subscription.stripeSubscriptionItemId }]
      });

      user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      user.tokens += SUBSCRIPTION_PLANS[user.subscription.plan].tokensPerMonth;
      await user.save();
    } catch (err) {
      console.error('Failed to renew subscription:', err);
      user.subscription = { plan: 'free' };
      await user.save();
      // Notify user about failed renewal
    }
  }
};