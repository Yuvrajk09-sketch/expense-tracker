const User = require('./user');
const Expense = require('./expense');

// Define associations here
User.hasMany(Expense);
Expense.belongsTo(User);

module.exports = {
  User,
  Expense
};
