const express = require('express');
const incomeController = require('../controllers/incomeController');
const userAuth = require('../middleware/auth');

const router = express.Router();

router.post('/add-income', userAuth.authenticate, incomeController.addIncome);
router.get('/get-incomes', userAuth.authenticate, incomeController.getIncomes);
router.delete('/delete-income/:id', userAuth.authenticate, incomeController.deleteIncome);

module.exports = router;
