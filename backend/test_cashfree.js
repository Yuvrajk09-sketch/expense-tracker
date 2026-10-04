require('dotenv').config(); 
const axios = require('axios');

async function test() {
  try {
    const orderId = `test_order_${Date.now()}`;
    const requestData = {
      order_amount: 2500,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: "user_1",
        customer_phone: "9999999999",
        customer_name: "Customer"
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
    console.log("Calling Cashfree...");
    const response = await axios.post('https://sandbox.cashfree.com/pg/orders', requestData, config);
    console.log("SUCCESS:", response.data);
  } catch (error) {
    console.log("ERROR:", error.response ? error.response.data : error.message);
  }
}

test();
