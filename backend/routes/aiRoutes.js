const express = require('express');
const rateLimit = require('express-rate-limit');
const aiController = require('../controllers/aiController');
const userAuth = require('../middleware/auth');

const router = express.Router();

// Rate limiter for AI financial advice (15 requests per 1 hour per user)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: { message: 'You have reached your hourly limit for AI financial advice. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `user_${req.user?.id || 'guest'}`,
  validate: { keyGeneratorIpFallback: false },
});

// Route: POST /ai/advisor
// Protected by authentication middleware and rate limiter
router.post('/advisor', userAuth.authenticate, aiLimiter, aiController.getFinancialAdvice);

module.exports = router;
