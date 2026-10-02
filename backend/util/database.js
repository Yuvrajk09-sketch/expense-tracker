const Sequelize = require('sequelize');

const sequelize = new Sequelize('expense_tracker', 'root', 'Yuvraj@1171', {
  dialect: 'mysql',
  host: 'localhost',
  logging: false
});

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
