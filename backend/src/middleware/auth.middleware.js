const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user.model');
dotenv.config();

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      console.log("Role: " + req.user.role);
      console.log("Required Role: " + role
      );
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

const addUserToRequest = (req, res, next) => {
  try {
    if (!req.userId) {
      // try to get user id from token if not already set
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId; // add user id to request
    }

    User.findById(req.userId).then(user => {
      req.user = user;
      next();
    });
  } catch (error) {
    req.user = { role: 'guest' }; // guest user
    return next();
  }
}

module.exports = { authMiddleware, requireRole, addUserToRequest };

