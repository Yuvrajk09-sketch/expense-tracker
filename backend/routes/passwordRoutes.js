const express = require('express');
const passwordController = require('../controllers/passwordController');

const router = express.Router();

router.post('/forgotpassword', passwordController.forgotpassword);
router.get('/resetpassword/:id', passwordController.resetpassword);
router.post('/updatepassword/:resetId', passwordController.updatepassword);

module.exports = router;
