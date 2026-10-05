const { Income, User, MonthlySummary } = require('../models');
const sequelize = require('../util/database');

exports.addIncome = async (incomeData) => {
  const t = await sequelize.transaction();
  try {
    const income = await Income.create(incomeData, { transaction: t });
    // Update Monthly Summary
    const monthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const [summary] = await MonthlySummary.findOrCreate({
      where: { userId: incomeData.userId, month: monthStr },
      defaults: { income: 0, expense: 0 },
      transaction: t
    });
    await summary.increment('income', { by: incomeData.amount, transaction: t });

    await t.commit();
    return income;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

exports.getIncomes = (userId, offset = 0, limit = 50) => {
  return Income.findAndCountAll({ 
    where: { userId },
    offset,
    limit,
    order: [['createdAt', 'DESC']]
  });
};

exports.deleteIncome = async (id, userId) => {
  const t = await sequelize.transaction();
  try {
    const income = await Income.findOne({ where: { id, userId }, transaction: t });
    if (income) {
      const monthStr = new Date(income.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      const summary = await MonthlySummary.findOne({
        where: { userId, month: monthStr },
        transaction: t
      });
      if (summary) {
        await summary.decrement('income', { by: income.amount, transaction: t });
      }

      await income.destroy({ transaction: t });
    }
    await t.commit();
    return true;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

exports.updateIncome = async (id, incomeData, userId) => {
  const t = await sequelize.transaction();
  try {
    const income = await Income.findOne({ where: { id, userId }, transaction: t });
    if (income) {
      const difference = Number(incomeData.amount) - Number(income.amount);
      const monthStr = new Date(income.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      const summary = await MonthlySummary.findOne({
        where: { userId, month: monthStr },
        transaction: t
      });
      if (summary) {
        await summary.increment('income', { by: difference, transaction: t });
      }

      await income.update(incomeData, { transaction: t });
    }
    await t.commit();
    return true;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};
