const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const ForgotPasswordRequests = sequelize.define('forgotpassword', {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = ForgotPasswordRequests;
