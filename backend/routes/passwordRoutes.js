const express = require('express');
const createSlidingWindowLimiter = require('../middleware/slidingWindowLimiter');
const passwordController = require('../controllers/passwordController');

const router = express.Router();

// Sliding window limiter for forgot password requests (5 requests per rolling 15 minutes per IP)
const forgotPasswordLimiter = createSlidingWindowLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: 'Too many password reset requests. Please wait 15 minutes before trying again.' },
});

// Sliding window limiter for updating password (10 attempts per rolling 15 minutes per IP)
const updatePasswordLimiter = createSlidingWindowLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many password update attempts. Please try again later.' },
});

router.post('/forgotpassword', forgotPasswordLimiter, passwordController.forgotpassword);
router.get('/resetpassword/:id', passwordController.resetpassword);
router.post('/updatepassword/:resetId', updatePasswordLimiter, passwordController.updatepassword);

module.exports = router;
