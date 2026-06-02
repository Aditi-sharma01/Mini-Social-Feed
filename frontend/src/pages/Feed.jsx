import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Container, Box, Alert, TextField, Button } from '@mui/material';

// Feed page component - displays posts from the backend API
function Feed() {
  // State to store all posts from the API
  const [posts, setPosts] = useState([]);

  // State to track if data is still loading
  const [loading, setLoading] = useState(true);

  // State to store error messages if API call fails
  const [error, setError] = useState('');

  // State for creating new post - stores the text user types
  const [newPost, setNewPost] = useState('');

  // State to track if post is being created (to disable button while sending)
  const [creatingPost, setCreatingPost] = useState(false);

  // State for success message when post is created
  const [successMessage, setSuccessMessage] = useState('');

  // State for error message when post creation fails
  const [createPostError, setCreatePostError] = useState('');

  // Function to fetch posts from the backend - extracted so we can call it again after creating a post
  const fetchPosts = async () => {
    try {
      // Send GET request to fetch all posts
      const response = await axios.get('http://localhost:5000/api/posts');

      // Store posts in state
      setPosts(response.data.posts);

      // Log response for debugging
      console.log('Posts fetched:', response.data);
    } catch (err) {
      // Show error message if API call fails
      setError('Failed to load posts. Please try again later.');

      // Log error for debugging
      console.error('Error fetching posts:', err);
    } finally {
      // Stop showing loading message regardless of success or failure
      setLoading(false);
    }
  };

  // useEffect hook - runs once when component mounts (loads)
  // This is where we fetch the posts from the backend
  useEffect(() => {
    // Call the fetchPosts function
    fetchPosts();
  }, []); // Empty array means this runs only once when component loads

  // Function to handle creating a new post
  const handleCreatePost = async () => {
    // Clear previous messages
    setSuccessMessage('');
    setCreatePostError('');

    // Validate that post text is not empty
    if (!newPost.trim()) {
      setCreatePostError('Post cannot be empty');
      return;
    }

    setCreatingPost(true);

    try {
      // Get JWT token from localStorage (stored during login)
      const token = localStorage.getItem('token');

      // Check if token exists
      if (!token) {
        setCreatePostError('Please log in first');
        setCreatingPost(false);
        return;
      }

      // Send POST request to create a new post
      // Include Authorization header with the JWT token
      const response = await axios.post(
        'http://localhost:5000/api/posts/create',
        {
          text: newPost, // Post text/content
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add JWT token to header
          },
        }
      );

      // Show success message
      setSuccessMessage('Post created successfully!');

      // Clear the text input field
      setNewPost('');

      // Fetch posts again to show the new post immediately
      await fetchPosts();

      // Log response for debugging
      console.log('Post created:', response.data);
    } catch (err) {
      // Show error message if post creation fails
      if (err.response && err.response.data && err.response.data.error) {
        setCreatePostError(err.response.data.error);
      } else {
        setCreatePostError('Failed to create post. Please try again.');
      }

      // Log error for debugging
      console.error('Error creating post:', err);
    } finally {
      // Stop showing loading state regardless of success or failure
      setCreatingPost(false);
    }
  };

  return (
    <Container maxWidth="md">
      {/* Page title */}
      <Box sx={{ marginTop: 3, marginBottom: 3 }}>
        <Typography variant="h4" component="h1">
          Social Feed
        </Typography>
      </Box>

      {/* === CREATE POST SECTION === */}
      {/* Card component to hold the create post form */}
      <Card sx={{ marginBottom: 3, padding: 2 }}>
        <CardContent>
          {/* Section title */}
          <Typography variant="h6" component="div" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
            Create a Post
          </Typography>

          {/* Success message - shown when post is created successfully */}
          {successMessage && (
            <Alert severity="success" sx={{ marginBottom: 2 }}>
              {successMessage}
            </Alert>
          )}

          {/* Error message - shown when post creation fails */}
          {createPostError && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {createPostError}
            </Alert>
          )}

          {/* Multiline text field for user to type post */}
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            disabled={creatingPost} // Disable input while post is being created
            sx={{ marginBottom: 2 }}
          />

          {/* Create Post button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreatePost}
            disabled={creatingPost} // Disable button while post is being created
          >
            {creatingPost ? 'Creating...' : 'Create Post'}
          </Button>
        </CardContent>
      </Card>

      {/* === FEED SECTION === */}
      {/* Show loading message while fetching posts */}
      {loading && (
        <Alert severity="info" sx={{ marginBottom: 2 }}>
          Loading posts...
        </Alert>
      )}

      {/* Show error message if API call fails */}
      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      {/* Show "No posts available" if there are no posts */}
      {!loading && posts.length === 0 && !error && (
        <Card>
          <CardContent>
            <Typography variant="body1" color="textSecondary">
              No posts available.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Display each post in a Card component */}
      {posts.map((post) => (
        <Card key={post._id} sx={{ marginBottom: 2 }}>
          <CardContent>
            {/* Display username */}
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {post.username}
            </Typography>

            {/* Display post text/content */}
            <Typography variant="body1" sx={{ marginTop: 1, marginBottom: 2 }}>
              {post.text}
            </Typography>

            {/* Display post date */}
            <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
              {new Date(post.createdAt).toLocaleDateString()} {new Date(post.createdAt).toLocaleTimeString()}
            </Typography>

            {/* Display likes and comments count in a row */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Likes: {post.likesCount || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Comments: {post.commentsCount || 0}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}

export default Feed;

  