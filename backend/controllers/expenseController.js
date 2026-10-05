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
    const expenses = await expenseService.getExpenses(userId);
    res.status(200).json({ allExpenses: expenses });
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
