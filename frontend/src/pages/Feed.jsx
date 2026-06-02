import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Container, Box, Alert, TextField, Button } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

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

  // State to store comment input for each post separately
  // Example: { "postId1": "comment text", "postId2": "comment text" }
  const [commentInputs, setCommentInputs] = useState({});

  // State to track which posts are being liked (to disable like button while sending)
  const [loadingLikes, setLoadingLikes] = useState({});

  // State to track which posts are having comments added (to disable comment button while sending)
  const [loadingComments, setLoadingComments] = useState({});

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

  // Function to handle liking a post
  const handleLike = async (postId) => {
    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');

      // Check if token exists
      if (!token) {
        alert('Please log in first');
        return;
      }

      // Mark this post as loading (disable like button)
      setLoadingLikes({ ...loadingLikes, [postId]: true });

      // Send POST request to like the post
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add JWT token to header
          },
        }
      );

      // Fetch posts again to show updated like count
      await fetchPosts();

      // Log response for debugging
      console.log('Post liked:', response.data);
    } catch (err) {
      // Show error message if like fails
      alert('You already liked this post');

      // Log error for debugging
      console.error('Error liking post:', err);
    } finally {
      // Stop loading for this post (enable like button)
      setLoadingLikes({ ...loadingLikes, [postId]: false });
    }
  };

  // Function to handle adding a comment to a post
  const handleComment = async (postId) => {
    // Get comment text from state for this specific post
    const commentText = commentInputs[postId] || '';

    // Validate that comment is not empty
    if (!commentText.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');

      // Check if token exists
      if (!token) {
        alert('Please log in first');
        return;
      }

      // Mark this post as loading (disable comment button)
      setLoadingComments({ ...loadingComments, [postId]: true });

      // Send POST request to add a comment to the post
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comment`,
        {
          comment: commentText, // Comment text
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add JWT token to header
          },
        }
      );

      // Clear the comment input for this post
      setCommentInputs({ ...commentInputs, [postId]: '' });

      // Fetch posts again to show new comment
      await fetchPosts();

      // Log response for debugging
      console.log('Comment added:', response.data);
    } catch (err) {
      // Show error message if comment fails
      alert('Failed to add comment');

      // Log error for debugging
      console.error('Error adding comment:', err);
    } finally {
      // Stop loading for this post (enable comment button)
      setLoadingComments({ ...loadingComments, [postId]: false });
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
            <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Likes: {post.likesCount || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Comments: {post.commentsCount || 0}
              </Typography>
            </Box>

            {/* === LIKE BUTTON === */}
            <Box sx={{ marginBottom: 2 }}>
              <Button
                startIcon={<FavoriteBorderIcon />}
                onClick={() => handleLike(post._id)}
                disabled={loadingLikes[post._id]}
                size="small"
              >
                {loadingLikes[post._id] ? 'Liking...' : 'Like'}
              </Button>
            </Box>

            {/* === DISPLAY EXISTING COMMENTS === */}
            {post.comments && post.comments.length > 0 && (
              <Box sx={{ marginBottom: 2, paddingTop: 2, borderTop: '1px solid #eee' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                  Comments ({post.comments.length}):
                </Typography>

                {/* Display each comment */}
                {post.comments.map((comment, index) => (
                  <Box key={index} sx={{ marginBottom: 1, paddingLeft: 2, borderLeft: '2px solid #ccc' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {comment.username}
                    </Typography>
                    <Typography variant="body2">{comment.comment}</Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* === ADD COMMENT SECTION === */}
            <Box sx={{ display: 'flex', gap: 1, marginTop: 2 }}>
              {/* Comment input field */}
              <TextField
                fullWidth
                size="small"
                placeholder="Add a comment..."
                value={commentInputs[post._id] || ''}
                onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                disabled={loadingComments[post._id]}
              />

              {/* Add Comment button */}
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleComment(post._id)}
                disabled={loadingComments[post._id]}
              >
                {loadingComments[post._id] ? 'Adding...' : 'Comment'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}


export default Feed;