const expenseService = require('../services/expenseService');

exports.addExpense = async (req, res, next) => {
  try {
    const { amount, description, category } = req.body;

    if (!amount || !description || !category) {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const userId = req.user.id;
    const newExpense = await expenseService.addExpense({ 
      amount,
      description,
      category,
      userId
    });
    res.status(201).json({ newExpenseDetail: newExpense });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);

    // Handle invalid negative numbers or NaN
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 5;

    // Excessive Limits
    const MAX_LIMIT = 50;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    let offset = (page - 1) * limit; 
    
    let { count, rows: expenses } = await expenseService.getExpenses(userId, offset, limit);

    // Out-of-bounds pages
    const totalPages = Math.ceil(count / limit);
    if (page > totalPages && totalPages > 0) {
        page = totalPages;
        offset = (page - 1) * limit;
        const result = await expenseService.getExpenses(userId, offset, limit);
        count = result.count;
        expenses = result.rows;
    }

    res.status(200).json({ 
      allExpenses: expenses,
      totalCount: count,
      currentPage: page,
      totalPages: totalPages
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user.id; 
    
    if (!expenseId) {
      return res.status(400).json({ message: 'Expense ID is missing' });
    }
    await expenseService.deleteExpense(expenseId, userId);
    res.status(200).json({ message: 'Expense successfully deleted' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user.id;
    const { amount, description, category } = req.body;
    
    if (!amount || !description || !category) {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    await expenseService.updateExpense(expenseId, { amount, description, category }, userId);
    res.status(200).json({ message: 'Expense successfully updated' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
