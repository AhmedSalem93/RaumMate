const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { console } = require("inspector");
const User = require("../models/user.model");
const { authMiddleware } = require("../middleware/auth.middleware");

//get user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
);

//update user profile
router.put("/profile", async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//complete profile route
router.post("/complete-profile", authMiddleware, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId);
    user.city = req.body.city;
    user.country = req.body.country;
    user.postalCode = req.body.postalCode;
    user.address = req.body.address;
    user.phone = req.body.phone;
    user.bio = req.body.bio;
    user.preferences = req.body.preferences;
    user.interests = req.body.interests;
    user.dateofBirth = req.body.dateofBirth;
    user.profileCompleted = true;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
);



module.exports = router;
