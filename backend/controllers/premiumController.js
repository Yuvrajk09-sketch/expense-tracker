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

exports.getDashboard = async (req, res, next) => {
  try {
    const requestingUser = await User.findByPk(req.user.id);
    if (!requestingUser || !requestingUser.ispremiumuser) {
      return res.status(403).json({ message: 'Unauthorized: Premium membership required' });
    }
    const dashboardData = await premiumService.getDashboardData(req.user.id);
    res.status(200).json(dashboardData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.downloadExpenses = async (req, res, next) => {
  try {
    const requestingUser = await User.findByPk(req.user.id);
    if (!requestingUser || !requestingUser.ispremiumuser) {
      return res.status(403).json({ message: 'Unauthorized: Premium membership required' });
    }
    const expenses = await premiumService.getUserExpenses(req.user.id);
    
    // Generate CSV string
    let csvStr = 'Date,Description,Category,Income,Expense\n';
    expenses.forEach(item => {
      csvStr += `"${item.date}","${item.description}","${item.category}",${item.income},${item.expense}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
    res.status(200).send(csvStr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
