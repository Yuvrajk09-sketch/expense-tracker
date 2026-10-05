const User = require('./user');
const Expense = require('./expense');
const Order = require('./order');
const ForgotPasswordRequests = require('./forgotpassword');
const Income = require('./income');
const MonthlySummary = require('./monthlySummary');

// Define associations here
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Income);
Income.belongsTo(User);

User.hasMany(MonthlySummary);
MonthlySummary.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User); 

User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User); 

module.exports = {
  User,
  Expense,
  Order,
  ForgotPasswordRequests,
  Income,
  MonthlySummary
};
