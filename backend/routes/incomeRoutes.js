const express = require('express');
const incomeController = require('../controllers/incomeController');
const userAuth = require('../middleware/auth');

const router = express.Router();

router.post('/add-income', userAuth.authenticate, incomeController.addIncome);
router.get('/get-incomes', userAuth.authenticate, incomeController.getIncomes);
router.delete('/delete-income/:id', userAuth.authenticate, incomeController.deleteIncome);
router.put('/update-income/:id', userAuth.authenticate, incomeController.updateIncome);

module.exports = router;
