const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Header se token nikalo (Bearer xyz...)
      token = req.headers.authorization.split(' ')[1];

      // Token ko verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User ki info database se nikalo (bina password ke)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Sab theek hai, agle step par jao
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };