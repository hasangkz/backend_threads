const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const handleAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) return res.status(401).json({ message: 'Please Sign In!' });

    const decodedValue = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedValue.id).select('-password');

    // const user = await User.findById(decodedValue.userId).select('-password');

    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log('Error in handleAuth: ', error.message);
  }
};

module.exports = handleAuth;
