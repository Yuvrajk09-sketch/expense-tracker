const userService = require('../services/userService');

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const user = await userService.signup(username, email, password);
    
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "Error creating user", error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await userService.login(email, password);
    
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "Error logging in", error });
  }
};
