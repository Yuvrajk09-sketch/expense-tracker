const { User } = require('../models');

exports.getLeaderboardData = async () => {
    // Query the database to get all users and their total expenses
    // Sort them in descending order (highest total expenses first)
    const leaderboard = await User.findAll({
      attributes: ['id', 'username', 'totalExpenses'], // Only fetch the fields we need to save bandwidth
      order: [['totalExpenses', 'DESC']]
    });
    
    return leaderboard;
};
