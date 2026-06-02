import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Container, Box, Alert } from '@mui/material';

// Feed page component - displays posts from the backend API
function Feed() {
  // State to store all posts from the API
  const [posts, setPosts] = useState([]);

  // State to track if data is still loading
  const [loading, setLoading] = useState(true);

  // State to store error messages if API call fails
  const [error, setError] = useState('');

  // useEffect hook - runs once when component mounts (loads)
  // This is where we fetch the posts from the backend
  useEffect(() => {
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

    // Call the fetchPosts function
    fetchPosts();
  }, []); // Empty array means this runs only once when component loads

  return (
    <Container maxWidth="md">
      {/* Page title */}
      <Box sx={{ marginTop: 3, marginBottom: 3 }}>
        <Typography variant="h4" component="h1">
          Social Feed
        </Typography>
      </Box>

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
