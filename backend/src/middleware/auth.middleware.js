const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user.model');
dotenv.config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization; // Get Authorization header

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token (remove "Bearer ")

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = decoded; // Attach user data to request object
    next(); // Proceed to the next middleware/route
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const requireRole = (role) => {
  // Define role hierarchy (from lowest to highest privileges)
  const roleHierarchy = ['guest', 'registered', 'verified', 'propertyOwner', 'admin'];

  return (req, res, next) => {
    // Get indexes of user role and required role in the hierarchy
    const userRoleIndex = roleHierarchy.indexOf(req.user.role);
    const requiredRoleIndex = roleHierarchy.indexOf(role);

    // Check if user's role is high enough in the hierarchy
    if (userRoleIndex < requiredRoleIndex) {
      console.log("User Role: " + req.user.role + " (level " + userRoleIndex + ")");
      console.log("Required Role: " + role + " (level " + requiredRoleIndex + ")");
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
}

const addUserToRequest = (req, res, next) => {
  try {
    if (!req.user.userId) {
      // try to get user id from token if not already set
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user.userId = decoded.user.userId; // add user id to request
    }

    User.findById(req.user.userId).then(user => {
      req.user = {
        userId: user._id, // for consistency
        ...user.toObject() // spread all user fields
      };
      next();
    }).catch(err => {
      req.user = { role: 'guest' }; // guest user in case of error
      next();
    });
  } catch (error) {
    req.user = { role: 'guest' }; // guest user
    return next();
  }
}

module.exports = { authMiddleware, requireRole, addUserToRequest };

