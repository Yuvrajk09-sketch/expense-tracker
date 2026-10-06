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

exports.getDashboardData = async (userId) => {
    const { Transaction, MonthlySummary } = require('../models');
    
    // Fetch all transactions and monthly summaries concurrently
    const [transactions, monthlySummaries] = await Promise.all([
        Transaction.findAll({ where: { userId }, order: [['createdAt', 'DESC']] }),
        MonthlySummary.findAll({ where: { userId } })
    ]);
    
    const dailyBreakdownMap = {};
    
    // Process Transactions
    transactions.forEach(txn => {
        const dateObj = new Date(txn.createdAt);
        const dateStr = dateObj.toLocaleDateString();
        
        // Daily
        const dailyKey = `${dateStr}_${txn.description}_${txn.category}_${txn.type}`;
        if (!dailyBreakdownMap[dailyKey]) {
            dailyBreakdownMap[dailyKey] = {
                date: dateStr,
                description: txn.description,
                category: txn.category,
                income: 0,
                expense: 0,
                createdAt: txn.createdAt
            };
        }
        
        if (txn.type === 'income') {
            dailyBreakdownMap[dailyKey].income += txn.amount;
        } else {
            dailyBreakdownMap[dailyKey].expense += txn.amount;
        }
    });
    
    const dailyBreakdown = Object.values(dailyBreakdownMap).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Process Monthly from Summary Table
    const monthlyBreakdown = monthlySummaries.map(summary => ({
        month: summary.month,
        income: summary.income,
        expense: summary.expense,
        savings: summary.income - summary.expense
    }));
    
    return { dailyBreakdown, monthlyBreakdown };
};

exports.getUserExpenses = async (userId) => {
    const { Transaction } = require('../models');
    const transactions = await Transaction.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
    
    const combined = transactions.map(txn => ({
        date: new Date(txn.createdAt).toLocaleDateString(),
        description: txn.description,
        category: txn.category,
        income: txn.type === 'income' ? txn.amount : 0,
        expense: txn.type === 'expense' ? txn.amount : 0,
        createdAt: txn.createdAt
    }));
    
    return combined;
};
