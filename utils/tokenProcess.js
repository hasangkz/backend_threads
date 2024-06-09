const jwt = require('jsonwebtoken');

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  if (token) {
    res.cookie('jwt', token, {
      httpOnly: true, // more secure
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return token;
  } else {
    throw new Error('Cookie process error!');
  }
};

module.exports = generateToken;
