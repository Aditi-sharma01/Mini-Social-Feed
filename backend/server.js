// Import required packages
require('dotenv').config();


const authRoutes = require('./routes/authRoutes');
const express = require('express');
const mongoose = require('mongoose');
const postRoutes = require('./routes/postRoutes');
const cors = require('cors');
 // Load environment variables from .env file

// Create an Express application
const app = express();

// ==================== MIDDLEWARE ====================

// Enable CORS - allows requests from different domains
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Parse incoming form data
app.use(express.urlencoded({ extended: true }));

// ==================== MONGODB CONNECTION ====================

// Connect to MongoDB using the URI from .env file
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1); // Stop the server if connection fails
  });

// ==================== ROUTES ====================

// Home route - shows server is running
app.get('/', (req, res) => {
  res.json({
    message: 'Server running',
    timestamp: new Date(),
  });
});

// Example route to test the API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Mini Social Feed API is healthy',
  });
});

// Handle 404 errors - if no route matches
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// ==================== START SERVER ====================

// Get port from .env or use 5000 as default
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Press Ctrl+C to stop the server\n`);
});
