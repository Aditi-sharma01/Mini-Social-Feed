// Import required packages and models
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ==================== SETUP ====================

// Create a router instance for authentication routes
const router = express.Router();

// ==================== POST /signup - USER REGISTRATION ====================

router.post('/signup', async (req, res) => {
  try {
    // Step 1: Get data from the request body
    const { username, email, password } = req.body;

    // Step 2: Validate that all required fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Please provide username, email, and password',
      });
    }

    // Step 3: Check if a user with this email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // User already exists, return 400 error
      return res.status(400).json({
        error: 'Email already registered. Please use a different email or login.',
      });
    }

    // Step 4: Hash the password for security
    // saltRounds = 10 means 10 rounds of hashing (higher = more secure but slower)
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // Step 5: Create a new user object with the hashed password
    const newUser = new User({
      username,
      email,
      password: hashedPassword, // Store the hashed password, NOT the plain text
    });

    // Step 6: Save the user to MongoDB
    await newUser.save();

    // Step 7: Return success response
    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    // Handle any errors that occur during the signup process
    console.error('Signup error:', error.message);
    res.status(500).json({
      error: 'An error occurred during signup. Please try again.',
      details: error.message, // Only for development - remove in production
    });
  }
});

// ==================== POST /login - USER LOGIN ====================

router.post('/login', async (req, res) => {
  try {
    // Step 1: Get email and password from the request body
    const { email, password } = req.body;

    // Step 2: Validate that both email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        error: 'Please provide email and password',
      });
    }

    // Step 3: Check if a user with this email exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      // User does not exist, return 400 error
      return res.status(400).json({
        error: 'Invalid email or password',
      });
    }

    // Step 4: Compare the entered password with the hashed password in the database
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
      // Password is incorrect, return 400 error
      return res.status(400).json({
        error: 'Invalid email or password',
      });
    }

    // Step 5: Password is correct! Generate a JWT token
    // The token contains the user's id and username
    // It expires in 7 days
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET, // Secret key from .env file
      {
        expiresIn: '7d', // Token validity period - 7 days
      }
    );

    // Step 6: Return success response with token and user information
    res.status(200).json({
      message: 'Login successful!',
      token, // Send the JWT token to the client
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    // Handle any errors that occur during the login process
    console.error('Login error:', error.message);
    res.status(500).json({
      error: 'An error occurred during login. Please try again.',
      details: error.message, // Only for development - remove in production
    });
  }
});

// ==================== EXPORT ROUTER ====================

// Export the router so it can be used in server.js
module.exports = router;
