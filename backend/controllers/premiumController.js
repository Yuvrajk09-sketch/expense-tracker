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

const PDFDocument = require('pdfkit');

exports.downloadExpenses = async (req, res, next) => {
  try {
    const requestingUser = await User.findByPk(req.user.id);
    if (!requestingUser || !requestingUser.ispremiumuser) {
      return res.status(403).json({ message: 'Unauthorized: Premium membership required' });
    }
    const expenses = await premiumService.getUserExpenses(req.user.id);
    
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    doc.pipe(res);
    
    doc.fontSize(20).text('Financial Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).font('Helvetica-Bold').text('Date                      Description                  Category           Income       Expense');
    doc.moveDown(0.5);
    
    doc.font('Helvetica');
    expenses.forEach(item => {
      const dateStr = String(item.date).padEnd(25, ' ');
      const descStr = String(item.description).substring(0, 25).padEnd(28, ' ');
      const catStr = String(item.category).substring(0, 15).padEnd(18, ' ');
      const incStr = String(item.income).padEnd(12, ' ');
      const expStr = String(item.expense);
      doc.fontSize(10).text(`${dateStr}${descStr}${catStr}${incStr}${expStr}`);
    });
    
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
