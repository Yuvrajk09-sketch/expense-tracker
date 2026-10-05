const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const MonthlySummary = sequelize.define('monthlySummary', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  month: {
    type: DataTypes.STRING,
    allowNull: false
  },
  income: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  expense: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  }
});

module.exports = MonthlySummary;
