const express = require('express');
const rateLimit = require('express-rate-limit');
const purchaseController = require('../controllers/purchaseController');
const userAuth = require('../middleware/auth');

const router = express.Router();

// Rate limiter for initiating orders (5 requests per 15 minutes per user)
const purchaseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: 'Too many payment attempts. Please wait 15 minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `user_${req.user?.id || 'guest'}`,
  validate: { keyGeneratorIpFallback: false },
});

// Rate limiter for verification (15 requests per 15 minutes per user)
const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: { message: 'Too many verification attempts. Please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `user_${req.user?.id || 'guest'}`,
  validate: { keyGeneratorIpFallback: false },
});

router.get('/premiummembership', userAuth.authenticate, purchaseLimiter, purchaseController.purchasePremium);
router.post('/updatetransactionstatus', userAuth.authenticate, verificationLimiter, purchaseController.updateTransactionStatus);

module.exports = router;
