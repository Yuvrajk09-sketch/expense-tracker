const { User } = require('../models');

exports.getLeaderboard = async (req, res, next) => {
  try {
    // Fetch the requesting user from the database first
    const requestingUser = await User.findByPk(req.user.id);

    // Check if the requesting user is actually a premium user
    if (!requestingUser || !requestingUser.ispremiumuser) {
      return res.status(403).json({ message: 'Unauthorized: Premium membership required' });
    }

    // Query the database to get all users and their total expenses
    // Sort them in descending order (highest total expenses first)
    const leaderboard = await User.findAll({
      attributes: ['id', 'username', 'totalExpenses'], // Only fetch the fields we need to save bandwidth
      order: [['totalExpenses', 'DESC']]
    });

    res.status(200).json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
