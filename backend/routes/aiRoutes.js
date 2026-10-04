const express = require('express');
const aiController = require('../controllers/aiController');
const userAuth = require('../middleware/auth');

const router = express.Router();

// Route: POST /ai/advisor
// Protected by authentication middleware
router.post('/advisor', userAuth.authenticate, aiController.getFinancialAdvice);

module.exports = router;
