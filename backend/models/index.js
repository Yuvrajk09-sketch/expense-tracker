const User = require('./user');
const Transaction = require('./transaction');
const Order = require('./order');
const ForgotPasswordRequests = require('./forgotpassword');
const MonthlySummary = require('./monthlySummary');

// Define associations here
User.hasMany(Transaction);
Transaction.belongsTo(User);

User.hasMany(MonthlySummary);
MonthlySummary.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User); 

User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User); 

module.exports = {
  User,
  Transaction,
  Order,
  ForgotPasswordRequests,
  MonthlySummary
};
