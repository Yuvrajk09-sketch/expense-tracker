const User = require('./user');
const Expense = require('./expense');
const Order = require('./order');
const ForgotPasswordRequests = require('./forgotpassword');

// Define associations here
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User); 

User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User); 

module.exports = {
  User,
  Expense,
  Order,
  ForgotPasswordRequests
};
