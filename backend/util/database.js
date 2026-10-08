const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    logging: false
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
