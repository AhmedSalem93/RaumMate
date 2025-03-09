const express = require("express");
const router = express.Router();
const User = require("../models/user.model");

// Placeholder routes
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user (store password in plain text)
    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      role: "registered", // Default role
    });

    // Save the user to the database
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", (req, res) => {
  res.status(200).json({ message: "User login endpoint" });
});

router.post("/reset-password", (req, res) => {
  res.status(200).json({ message: "Password reset endpoint" });
});

module.exports = router;
