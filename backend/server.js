require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const sequelize = require('./util/database');
const { User, Expense } = require('./models');

const expenseRoutes = require('./routes/expenseRoutes');
const userRoutes = require('./routes/userRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const premiumRoutes = require('./routes/premiumRoutes');
const aiRoutes = require('./routes/aiRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const incomeRoutes = require('./routes/incomeRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/expense', expenseRoutes);
app.use('/user', userRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/ai', aiRoutes);
app.use('/password', passwordRoutes);
app.use('/income', incomeRoutes);

sequelize.sync({ alter: true })
  .then((result) => { 
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.log(err);
  });
  