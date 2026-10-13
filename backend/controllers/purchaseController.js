const Order = require('../models/order');
const User = require('../models/user');
const sequelize = require('../util/database');
const axios = require('axios');

exports.purchasePremium = async (req, res) => {
  try {
    const userEntity = await User.findByPk(req.user.id);
    if (!userEntity) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Idempotency check: prevent duplicate purchase if user is already a premium member
    if (userEntity.ispremiumuser) {
      return res.status(400).json({ message: 'User is already a premium member' });
    }

    const amount = 2500;
    
    // Generate a unique order id 
    const orderId = `order_${req.user.id}_${Date.now()}`;
    
    const requestData = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: `user_${req.user.id}`,
        customer_phone: "9999999999",
        customer_name: userEntity.username || "Customer"
      }
    };
    
    const config = {
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
        'x-idempotency-key': orderId,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const response = await axios.post('https://sandbox.cashfree.com/pg/orders', requestData, config);
    
    // ACID Transaction: atomically record the pending order in the database
    const t = await sequelize.transaction();
    try {
      await userEntity.createOrder({ orderid: orderId, status: 'PENDING' }, { transaction: t });
      await t.commit();
    } catch (dbErr) {
      await t.rollback();
      throw dbErr;
    }
    
    return res.status(201).json({ payment_session_id: response.data.payment_session_id, order_id: orderId });

  } catch (err) {
    console.error(err.response ? err.response.data : err);
    res.status(500).json({ message: 'Something went wrong while initiating purchase', error: err.message || err });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { order_id } = req.body;
    if (!order_id) {
      return res.status(400).json({ message: 'order_id is required' });
    }
    
    const order = await Order.findOne({ where: { orderid: order_id } });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify order belongs to the authenticated user
    if (order.userId && order.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access to this order" });
    }

    // 1. IDEMPOTENCY GUARD:
    // If the transaction has already been verified and marked SUCCESSFUL,
    // return early without re-querying Cashfree or performing duplicate DB updates.
    if (order.status === 'SUCCESSFUL') {
      return res.status(200).json({ 
        success: true, 
        message: "Transaction already processed successfully",
        alreadyProcessed: true 
      });
    }

    const config = {
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
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
      
      // 2. ACID TRANSACTION: Atomically mark the order as SUCCESSFUL and grant the user premium status
      const t = await sequelize.transaction();
      try {
        await order.update({ paymentid: paymentId, status: 'SUCCESSFUL' }, { transaction: t });
        await User.update({ ispremiumuser: true }, { where: { id: req.user.id }, transaction: t });
        await t.commit(); // Atomic commit ensures both tables reflect the state simultaneously
      } catch (dbErr) {
        await t.rollback(); // Rollback guarantees all-or-nothing atomicity on failure
        console.error("Database transaction rollback on payment update:", dbErr);
        return res.status(500).json({ success: false, message: 'Database transaction failed during status update', error: dbErr.message || dbErr });
      }

      return res.status(202).json({ success: true, message: "Transaction Successful" });
    } else {
      // If status is not PAID, update to FAILED (if not already failed)
      if (order.status !== 'FAILED') {
        await order.update({ paymentid: "FAILED", status: 'FAILED' });
      }
      return res.status(400).json({ success: false, message: "Transaction Failed" });
    }
  } catch (err) {
    console.error(err.response ? err.response.data : err);
    res.status(500).json({ error: err.message || err, message: 'Something went wrong' });
  }
};
