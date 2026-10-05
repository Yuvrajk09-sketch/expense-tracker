const { User } = require('../models');
const premiumService = require('../services/premiumService');

exports.getLeaderboard = async (req, res, next) => {
  try {
    // Fetch the requesting user from the database first
    const requestingUser = await User.findByPk(req.user.id);

    // Check if the requesting user is actually a premium user
    if (!requestingUser || !requestingUser.ispremiumuser) {
      return res.status(403).json({ message: 'Unauthorized: Premium membership required' });
    }

    const leaderboard = await premiumService.getLeaderboardData();

    res.status(200).json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
