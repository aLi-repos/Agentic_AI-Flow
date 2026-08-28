const jwt = require('jsonwebtoken');
const env = require('../config/env');

const authenticate = (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      code: 'AUTH_REQUIRED',
      message: 'Authentication token is required to access this resource',
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      code: 'AUTH_EXPIRED',
      message: 'Session expired or invalid token. Please log in again.',
    });
  }
};

module.exports = {
  authenticate,
};
