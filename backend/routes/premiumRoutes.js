const express = require('express');
const premiumController = require('../controllers/premiumController');
const userAuth = require('../middleware/auth');

const router = express.Router();

// Route: GET /premium/leaderboard
router.get('/leaderboard', userAuth.authenticate, premiumController.getLeaderboard);

// Route: GET /premium/dashboard
router.get('/dashboard', userAuth.authenticate, premiumController.getDashboard);

// Route: GET /premium/download
router.get('/download', userAuth.authenticate, premiumController.downloadExpenses);

module.exports = router;
