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
const multer = require('multer');
const path = require('path');

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

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Generate a unique filename
  }
});

const upload = multer({ storage });

// upload profile picture
router.post("/upload-profile-picture", upload.single('profilePicture'), authMiddleware, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path; // Path to the uploaded file
  const imageUrl = `http://localhost:3000/${filePath}`; // URL to access the file
  try {
    const user = await User.findById(req.user.userId);
    user.profilePicture = imageUrl;
    await user.save();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }

  res.json({ imageUrl });
});

//get view profile
router.get("/view-profile/:email", async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.params.email });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
);



module.exports = router;
