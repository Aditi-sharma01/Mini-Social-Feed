// Import required packages and models
const express = require('express');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');

// ==================== SETUP ====================

// Create a router instance for post routes
const router = express.Router();

// ==================== POST /create - CREATE A NEW POST ====================

router.post('/create', async (req, res) => {
  try {
    // Step 1: Get token from the Authorization header
    // Expected format: "Bearer <token>"
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'No token provided. Please login first.',
      });
    }

    // Step 2: Verify the token using JWT_SECRET
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid or expired token. Please login again.',
      });
    }

    // Step 3: Get userId and username from the verified token
    const userId = decodedToken.userId;
    const username = decodedToken.username;

    // Step 4: Get text and imageUrl from the request body
    const { text, imageUrl } = req.body;

    // Step 5: Validate - at least one of text or imageUrl must be provided
    if (!text && !imageUrl) {
      return res.status(400).json({
        error: 'Please provide either text or imageUrl (or both)',
      });
    }

    // Step 6: Create a new Post object
    const newPost = new Post({
      userId,
      username,
      text: text || '', // Empty string if not provided
      imageUrl: imageUrl || '', // Empty string if not provided
      likes: [], // Initialize empty likes array
      comments: [], // Initialize empty comments array
    });

    // Step 7: Save the post to MongoDB
    await newPost.save();

    // Step 8: Return success response with the created post
    res.status(201).json({
      message: 'Post created successfully!',
      post: newPost,
    });
  } catch (error) {
    // Handle any errors that occur during post creation
    console.error('Post creation error:', error.message);
    res.status(500).json({
      error: 'An error occurred while creating the post. Please try again.',
      details: error.message, // Only for development - remove in production
    });
  }
});

// ==================== GET / - FETCH ALL POSTS ====================

router.get('/', async (req, res) => {
  try {
    // Step 1: Fetch all posts from MongoDB
    // Step 2: Sort by createdAt in descending order (newest first)
    // -1 means descending (newest), 1 would mean ascending (oldest)
    const posts = await Post.find().sort({ createdAt: -1 });

    // Step 3: Add likes and comments count to each post
    const postsWithCounts = posts.map((post) => {
      return {
        ...post.toObject(), // Convert Mongoose document to plain JavaScript object
        likesCount: post.likes.length, // Total number of likes
        commentsCount: post.comments.length, // Total number of comments
      };
    });

    // Step 4: Return success response with all posts
    res.status(200).json({
      message: 'Posts fetched successfully!',
      totalPosts: postsWithCounts.length,
      posts: postsWithCounts,
    });
  } catch (error) {
    // Handle any errors that occur during fetching posts
    console.error('Fetch posts error:', error.message);
    res.status(500).json({
      error: 'An error occurred while fetching posts. Please try again.',
      details: error.message, // Only for development - remove in production
    });
  }
});

// ==================== POST /:postId/like - LIKE A POST ====================

router.post('/:postId/like', async (req, res) => {
  try {
    // Step 1: Get token from the Authorization header
    // Expected format: "Bearer <token>"
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'No token provided. Please login first.',
      });
    }

    // Step 2: Verify the token using JWT_SECRET
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid or expired token. Please login again.',
      });
    }

    // Step 3: Get userId and username from the verified token
    const userId = decodedToken.userId;
    const username = decodedToken.username;

    // Get postId from the URL parameter
    const { postId } = req.params;

    // Step 4: Find the post using postId
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
      });
    }

    // Step 5: Check if the user has already liked this post
    // Some() returns true if at least one element in the array matches the condition
    const userAlreadyLiked = post.likes.some(
      (like) => like.userId.toString() === userId
    );

    if (userAlreadyLiked) {
      // Step 6: If user already liked, return error
      return res.status(400).json({
        error: 'You have already liked this post',
      });
    }

    // Step 7: User hasn't liked yet, so add userId and username to likes array
    post.likes.push({
      userId,
      username,
    });

    // Step 8: Save the updated post to MongoDB
    await post.save();

    // Step 9: Return success response
    res.status(200).json({
      message: 'Post liked successfully!',
      likesCount: post.likes.length,
      post,
    });
  } catch (error) {
    // Handle any errors that occur during the like operation
    console.error('Like post error:', error.message);
    res.status(500).json({
      error: 'An error occurred while liking the post. Please try again.',
      details: error.message, // Only for development - remove in production
    });
  }
});

// ==================== POST /:postId/comment - ADD A COMMENT ====================

router.post('/:postId/comment', async (req, res) => {
  try {
    // Step 1: Get token from the Authorization header
    // Expected format: "Bearer <token>"
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'No token provided. Please login first.',
      });
    }

    // Step 2: Verify the token using JWT_SECRET
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid or expired token. Please login again.',
      });
    }

    // Step 3: Get username from the verified token
    const username = decodedToken.username;

    // Get postId from the URL parameter
    const { postId } = req.params;

    // Step 4: Get comment from the request body
    const { comment } = req.body;

    // Step 5: Validate that comment is not empty
    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        error: 'Comment cannot be empty',
      });
    }

    // Step 6: Find the post using postId
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
      });
    }

    // Step 7: Add username and comment to the comments array
    post.comments.push({
      username,
      comment: comment.trim(), // Remove extra whitespace
    });

    // Step 8: Save the updated post to MongoDB
    await post.save();

    // Step 9: Return success response with comments count
    res.status(201).json({
      message: 'Comment added successfully!',
      commentsCount: post.comments.length,
      post,
    });
  } catch (error) {
    // Handle any errors that occur during the comment operation
    console.error('Add comment error:', error.message);
    res.status(500).json({
      error: 'An error occurred while adding the comment. Please try again.',
      details: error.message, // Only for development - remove in production
    });
  }
});

// ==================== EXPORT ROUTER ====================

// Export the router so it can be used in server.js
module.exports = router;
