const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

router.post('/subscribe', auth, subscriptionController.subscribeUser);
router.post('/cancel-subscription', auth, subscriptionController.cancelSubscription);

module.exports = router;