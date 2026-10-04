const { Expense, User } = require('../models');
const sequelize = require('../util/database');

exports.addExpense = async (expenseData) => {
  const t = await sequelize.transaction();
  try {
    const expense = await Expense.create(expenseData, { transaction: t });
    await User.increment('totalExpenses', { 
      by: expenseData.amount, 
      where: { id: expenseData.userId }, 
      transaction: t 
    });
    await t.commit();
    return expense;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

exports.getExpenses = (userId) => {
  return Expense.findAll({ where: { userId } });
};

exports.deleteExpense = async (id, userId) => {
  const t = await sequelize.transaction();
  try {
    const expense = await Expense.findOne({ where: { id, userId }, transaction: t });
    if (expense) {
      await User.decrement('totalExpenses', { 
        by: expense.amount, 
        where: { id: userId }, 
        transaction: t 
      });
      await expense.destroy({ transaction: t });
    }
    await t.commit();
    return true;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

exports.updateExpense = async (id, expenseData, userId) => {
  const t = await sequelize.transaction();
  try {
    const expense = await Expense.findOne({ where: { id, userId }, transaction: t });
    if (expense) {
      const difference = Number(expenseData.amount) - Number(expense.amount);
      await User.increment('totalExpenses', { 
        by: difference, 
        where: { id: userId }, 
        transaction: t 
      });
      await expense.update(expenseData, { transaction: t });
    }
    await t.commit();
    return true;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

