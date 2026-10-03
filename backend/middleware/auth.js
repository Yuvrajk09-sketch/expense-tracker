const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token is missing' });
    }
    
    // Decrypt token
    const user = jwt.verify(token, process.env.JWT_SECRET);  
    
    // Attach user id to the request object
    req.user = { id: user.userId }; 
    next();
  } catch (err) {
    console.log(err); 
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { authenticate };
