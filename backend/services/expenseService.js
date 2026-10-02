const { Expense } = require('../models');

exports.addExpense = (expenseData) => {
  return Expense.create(expenseData);
};

exports.getExpenses = (userId) => {
  return Expense.findAll({ where: { userId } });
};

exports.deleteExpense = (id, userId) => {
  return Expense.destroy({ where: { id, userId } });
};

exports.updateExpense = (id, expenseData, userId) => {
  return Expense.update(expenseData, { where: { id, userId } });
};

