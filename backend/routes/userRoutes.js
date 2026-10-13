const express = require('express');
const createSlidingWindowLimiter = require('../middleware/slidingWindowLimiter');
const router = express.Router();
const userController = require('../controllers/userController');

// Sliding window limiter for login: 10 attempts per rolling 15 minutes per IP
const loginLimiter = createSlidingWindowLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
});

// Sliding window limiter for signup: 10 registrations per rolling 1 hour per IP
const signupLimiter = createSlidingWindowLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { message: 'Too many accounts created from this IP. Please try again after an hour.' },
});

router.post('/signup', signupLimiter, userController.signup);
router.post('/login', loginLimiter, userController.login);

module.exports = router;
