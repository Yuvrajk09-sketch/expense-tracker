const { Income, User } = require('../models');
const sequelize = require('../util/database');

exports.addIncome = async (incomeData) => {
  const t = await sequelize.transaction();
  try {
    const income = await Income.create(incomeData, { transaction: t });
    // If you wanted to track totalIncome, you could increment it here
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
      await income.destroy({ transaction: t });
    }
    await t.commit();
    return true;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};
