const express = require('express');
const premiumController = require('../controllers/premiumController');
const userAuth = require('../middleware/auth');

const router = express.Router();

// Route: GET /premium/leaderboard
router.get('/leaderboard', userAuth.authenticate, premiumController.getLeaderboard);

module.exports = router;
