require('dotenv').config();
const sequelize = require('./util/database');
const { QueryTypes } = require('sequelize');

async function migrateData() {
  try {
    await sequelize.authenticate();
    console.log('Database connected for migration.');

    // Fetch old expenses
    let oldExpenses = [];
    try {
        oldExpenses = await sequelize.query("SELECT * FROM expenses", { type: QueryTypes.SELECT });
        console.log(`Found ${oldExpenses.length} expenses to migrate.`);
    } catch(err) {
        console.log("No expenses table found or error fetching expenses.");
    }

    // Fetch old incomes
    let oldIncomes = [];
    try {
        oldIncomes = await sequelize.query("SELECT * FROM incomes", { type: QueryTypes.SELECT });
        console.log(`Found ${oldIncomes.length} incomes to migrate.`);
    } catch(err) {
        console.log("No incomes table found or error fetching incomes.");
    }

    let count = 0;
    // Insert into transactions table
    for (const expense of oldExpenses) {
      await sequelize.query(
        "INSERT INTO transactions (amount, description, category, type, createdAt, updatedAt, userId) VALUES (?, ?, ?, 'expense', ?, ?, ?)",
        {
          replacements: [expense.amount, expense.description, expense.category, expense.createdAt, expense.updatedAt, expense.userId]
        }
      );
      count++;
    }

    for (const income of oldIncomes) {
      await sequelize.query(
        "INSERT INTO transactions (amount, description, category, type, createdAt, updatedAt, userId) VALUES (?, ?, ?, 'income', ?, ?, ?)",
        {
          replacements: [income.amount, income.description, income.category, income.createdAt, income.updatedAt, income.userId]
        }
      );
      count++;
    }

    console.log(`Migration complete! Successfully moved ${count} total records into the transactions table.`);
    process.exit(0);
  } catch (error) {
    console.error('Unable to migrate data:', error);
    process.exit(1);
  }
}

migrateData();
