const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Transaction = sequelize.define('transaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false
  }
});

module.exports = Transaction;
