const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

exports.signup = async (username, email, password) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const error = new Error("You already have an account, please login");
    error.status = 409;
    throw error;
  }
  
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  const user = await User.create({ username, email, password: hashedPassword });
  
  const token = generateAccessToken(user.id); 
  // Return safe user object for auto-login
  return { id: user.id, username: user.username, email: user.email, token };
};

exports.login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    const error = new Error("Credentials are incorrect");
    error.status = 401;
    throw error;
  }
  const token = generateAccessToken(user.id);
  // Return safe user object
  return { id: user.id, username: user.username, email: user.email, token };
};
