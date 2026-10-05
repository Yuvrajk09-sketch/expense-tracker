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

exports.getExpenses = async (userId, offset = 0, limit = 50) => {
  // Use raw query for UNION to combine and paginate both tables
  const countQuery = `
    SELECT COUNT(*) as total FROM (
      SELECT id FROM expenses WHERE userId = ?
      UNION ALL
      SELECT id FROM incomes WHERE userId = ?
    ) as transactions
  `;
  const countResult = await sequelize.query(countQuery, {
    replacements: [userId, userId],
    type: sequelize.QueryTypes.SELECT
  });
  
  const totalCount = countResult[0].total;

  const dataQuery = `
    SELECT id, amount, description, category, createdAt, 'expense' as type FROM expenses WHERE userId = ?
    UNION ALL
    SELECT id, amount, description, category, createdAt, 'income' as type FROM incomes WHERE userId = ?
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?
  `;
  const rows = await sequelize.query(dataQuery, {
    replacements: [userId, userId, limit, offset],
    type: sequelize.QueryTypes.SELECT
  });

  return { count: totalCount, rows };
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

