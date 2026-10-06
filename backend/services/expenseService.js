const { Transaction, User, MonthlySummary } = require('../models');
const sequelize = require('../util/database');

exports.addExpense = async (expenseData) => {
  const t = await sequelize.transaction();
  try {
    expenseData.type = 'expense';
    const expense = await Transaction.create(expenseData, { transaction: t });
    await User.increment('totalExpenses', { 
      by: expenseData.amount, 
      where: { id: expenseData.userId }, 
      transaction: t 
    });

    const monthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const [summary] = await MonthlySummary.findOrCreate({
      where: { userId: expenseData.userId, month: monthStr },
      defaults: { income: 0, expense: 0 },
      transaction: t
    });
    await summary.increment('expense', { by: expenseData.amount, transaction: t });

    await t.commit();
    return expense;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

exports.getExpenses = async (userId, offset = 0, limit = 50) => {
  const { count, rows } = await Transaction.findAndCountAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
  return { count, rows };
};

exports.deleteExpense = async (id, userId) => {
  const t = await sequelize.transaction();
  try {
    const expense = await Transaction.findOne({ where: { id, userId, type: 'expense' }, transaction: t });
    if (expense) {
      await User.decrement('totalExpenses', { 
        by: expense.amount, 
        where: { id: userId }, 
        transaction: t 
      });

      const monthStr = new Date(expense.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      const summary = await MonthlySummary.findOne({
        where: { userId, month: monthStr },
        transaction: t
      });
      if (summary) {
        await summary.decrement('expense', { by: expense.amount, transaction: t });
      }

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
    const expense = await Transaction.findOne({ where: { id, userId, type: 'expense' }, transaction: t });
    if (expense) {
      const difference = Number(expenseData.amount) - Number(expense.amount);
      await User.increment('totalExpenses', { 
        by: difference, 
        where: { id: userId }, 
        transaction: t 
      });

      const monthStr = new Date(expense.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      const summary = await MonthlySummary.findOne({
        where: { userId, month: monthStr },
        transaction: t
      });
      if (summary) {
        await summary.increment('expense', { by: difference, transaction: t });
      }

      await expense.update(expenseData, { transaction: t });
    }
    await t.commit();
    return true;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};
