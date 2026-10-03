const User = require('./user');
const Expense = require('./expense');
const Order = require('./order');

// Define associations here
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User); 

module.exports = {
  User,
  Expense,
  Order
};
