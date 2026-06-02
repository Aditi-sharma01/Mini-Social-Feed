// Import Mongoose library
const mongoose = require('mongoose');

// ==================== POST SCHEMA ====================

// Define the structure of a Post document
const postSchema = new mongoose.Schema(
  {
    // User ID - links the post to the user who created it (required)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },

    // Username - stores the username for quick access without database lookup
    username: {
      type: String,
      required: true,
    },

    // Post content - text of the post (optional)
    text: {
      type: String,
      trim: true, // Remove whitespace from both ends
    },

    // Image URL - link to an image posted by the user (optional)
    imageUrl: {
      type: String,
    },

    // Likes array - stores users who liked this post
    likes: [
      {
        // User ID of the person who liked the post
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        // Username of the person who liked the post
        username: {
          type: String,
        },
      },
    ],

    // Comments array - stores comments on this post
    comments: [
      {
        // Username of the person who commented
        username: {
          type: String,
        },
        // The comment text
        comment: {
          type: String,
        },
      },
    ],
  },
  {
    // Enable timestamps: Mongoose will automatically add createdAt and updatedAt fields
    timestamps: true,
  }
);

// ==================== CREATE AND EXPORT MODEL ====================

// Create a Post model based on the schema
const Post = mongoose.model('Post', postSchema);

// Export the Post model so it can be used in other files
module.exports = Post;
