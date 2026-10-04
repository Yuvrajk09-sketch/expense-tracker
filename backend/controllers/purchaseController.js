const Order = require('../models/order');
const User = require('../models/user');
const axios = require('axios');

exports.purchasePremium = async (req, res) => {
  try {
    const amount = 2500;
    
    // Generate a unique order id 
    const orderId = `order_${req.user.id}_${Date.now()}`;
    
    const requestData = {
      order_amount: 2500,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: `user_${req.user.id}`,
        customer_phone: "9999999999",
        customer_name: req.user.username || "Customer"
      }
    };
    
    const config = {
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const response = await axios.post('https://sandbox.cashfree.com/pg/orders', requestData, config);
    
    const userEntity = await User.findByPk(req.user.id);
    await userEntity.createOrder({ orderid: orderId, status: 'PENDING' });
    
    return res.status(201).json({ payment_session_id: response.data.payment_session_id, order_id: orderId });

  } catch (err) {
    console.log(err.response ? err.response.data : err);
    res.status(403).json({ message: 'Something went wrong', error: err });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { order_id } = req.body;
    
    const config = {
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const order = await Order.findOne({ where: { orderid: order_id } });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const userEntity = await User.findByPk(req.user.id);
    
    // Verify the payment directly with Cashfree servers
    const response = await axios.get(`https://sandbox.cashfree.com/pg/orders/${order_id}`, config);
    const orderStatus = response.data.order_status;
    
    if (orderStatus === 'PAID') {
      // Find the actual payment ID
      const payments = await axios.get(`https://sandbox.cashfree.com/pg/orders/${order_id}/payments`, config);
      let paymentId = "SUCCESS_VERIFIED";
      if (payments.data && payments.data.length > 0) {
        const successfulPayment = payments.data.find(p => p.payment_status === 'SUCCESS');
        if (successfulPayment) {
          paymentId = String(successfulPayment.cf_payment_id);
        }
      }
      
      await order.update({ paymentid: paymentId, status: 'SUCCESSFUL' });
      await userEntity.update({ ispremiumuser: true });
      return res.status(202).json({ success: true, message: "Transaction Successful" });
    } else {
      await order.update({ paymentid: "FAILED", status: 'FAILED' });
      return res.status(400).json({ success: false, message: "Transaction Failed" });
    }
  } catch (err) {
    console.log(err.response ? err.response.data : err);
    res.status(403).json({ error: err, message: 'Something went wrong' });
  }
};
