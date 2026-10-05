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
    const { Expense, Income, MonthlySummary } = require('../models');
    
    // Fetch all expenses, incomes, and monthly summaries concurrently
    const [expenses, incomes, monthlySummaries] = await Promise.all([
        Expense.findAll({ where: { userId }, order: [['createdAt', 'DESC']] }),
        Income.findAll({ where: { userId }, order: [['createdAt', 'DESC']] }),
        MonthlySummary.findAll({ where: { userId } })
    ]);
    
    const dailyBreakdownMap = {};
    
    // Process Expenses
    expenses.forEach(exp => {
        const dateObj = new Date(exp.createdAt);
        const dateStr = dateObj.toLocaleDateString();
        const monthStr = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        // Daily
        const dailyKey = `${dateStr}_${exp.description}_${exp.category}_expense`;
        if (!dailyBreakdownMap[dailyKey]) {
            dailyBreakdownMap[dailyKey] = {
                date: dateStr,
                description: exp.description,
                category: exp.category,
                income: 0,
                expense: 0,
                createdAt: exp.createdAt
            };
        }
        dailyBreakdownMap[dailyKey].expense += exp.amount;
    });

    // Process Incomes
    incomes.forEach(inc => {
        const dateObj = new Date(inc.createdAt);
        const dateStr = dateObj.toLocaleDateString();
        const monthStr = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        // Daily
        const dailyKey = `${dateStr}_${inc.description}_${inc.category}_income`;
        if (!dailyBreakdownMap[dailyKey]) {
            dailyBreakdownMap[dailyKey] = {
                date: dateStr,
                description: inc.description,
                category: inc.category,
                income: 0,
                expense: 0,
                createdAt: inc.createdAt
            };
        }
        dailyBreakdownMap[dailyKey].income += inc.amount;
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
    const { Expense, Income } = require('../models');
    const [expenses, incomes] = await Promise.all([
        Expense.findAll({ where: { userId }, order: [['createdAt', 'DESC']] }),
        Income.findAll({ where: { userId }, order: [['createdAt', 'DESC']] })
    ]);
    
    const combined = [];
    
    expenses.forEach(exp => {
        combined.push({
            date: new Date(exp.createdAt).toLocaleDateString(),
            description: exp.description,
            category: exp.category,
            income: 0,
            expense: exp.amount,
            createdAt: exp.createdAt
        });
    });
    
    incomes.forEach(inc => {
        combined.push({
            date: new Date(inc.createdAt).toLocaleDateString(),
            description: inc.description,
            category: inc.category,
            income: inc.amount,
            expense: 0,
            createdAt: inc.createdAt
        });
    });
    
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return combined;
};
