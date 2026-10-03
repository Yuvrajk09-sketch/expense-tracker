const express = require('express');
const purchaseController = require('../controllers/purchaseController');
const userAuth = require('../middleware/auth');

const router = express.Router();

router.get('/premiummembership', userAuth.authenticate, purchaseController.purchasePremium);
router.post('/updatetransactionstatus', userAuth.authenticate, purchaseController.updateTransactionStatus);

module.exports = router;
