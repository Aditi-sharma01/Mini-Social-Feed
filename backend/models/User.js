// Import Mongoose library
const mongoose = require('mongoose');

// ==================== USER SCHEMA ====================

// Define the structure of a User document
const userSchema = new mongoose.Schema(
  {
    // Username field - required and must be a string
    username: {
      type: String,
      required: true,
      trim: true, // Remove whitespace from both ends
    },

    // Email field - required, unique (no two users can have same email), and must be a string
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Store email in lowercase
      trim: true,
    },

    // Password field - required and must be a string
    password: {
      type: String,
      required: true,
    },
  },
  {
    // Enable timestamps: Mongoose will automatically add createdAt and updatedAt fields
    timestamps: true,
  }
);

// ==================== CREATE AND EXPORT MODEL ====================

// Create a User model based on the schema
// 'User' is the name of the model (MongoDB collection will be 'users' in lowercase)
const User = mongoose.model('User', userSchema);

// Export the User model so it can be used in other files
module.exports = User;
