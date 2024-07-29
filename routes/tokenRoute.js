const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tokenController = require('../controllers/tokenController');

router.post('/job', auth, tokenController.postJob);
router.post('/comment', auth, tokenController.commentOnPost);
router.post('/message', auth, tokenController.sendMessage);


module.exports = router;