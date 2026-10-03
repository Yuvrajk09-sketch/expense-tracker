const express = require('express');
const expenseController = require('../controllers/expenseController');
const userAuth = require('../middleware/auth');

const router = express.Router();

router.post('/add-expense', userAuth.authenticate, expenseController.addExpense);
router.get('/get-expenses', userAuth.authenticate, expenseController.getExpenses);
router.delete('/delete-expense/:id', userAuth.authenticate, expenseController.deleteExpense);
router.put('/update-expense/:id', userAuth.authenticate, expenseController.updateExpense);

module.exports = router;
