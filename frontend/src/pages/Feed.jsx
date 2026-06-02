import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, Typography, Container, Box, Alert, TextField, Button, AppBar, Toolbar } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LogoutIcon from '@mui/icons-material/Logout';

// Feed page component - displays posts from the backend API with improved UI
function Feed() {
  // Hook for navigation - used to redirect to login after logout
  const navigate = useNavigate();

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

  const [likedPosts, setLikedPosts] = useState(new Set());
  

  // State to store logged-in username from localStorage
  const [username, setUsername] = useState('');

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
  // This is where we fetch the posts from the backend and get username from localStorage
  useEffect(() => {
    // Get username from localStorage (stored during login)
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Call the fetchPosts function
    fetchPosts();
  }, []); // Empty array means this runs only once when component loads

  // Function to handle logout
  const handleLogout = () => {
  localStorage.clear();
  navigate('/login');
};

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
      setLoadingLikes(prev => ({
  ...prev,
  [postId]: true
}));
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

      // Add post to liked posts set for UI feedback (show filled heart)
     setLikedPosts(prev => {
  const updated = new Set(prev);
  updated.add(postId);
  return updated;
});

      // Fetch posts again to show updated like count
      await fetchPosts();

      // Log response for debugging
      console.log('Post liked:', response.data);
    } catch (err) {
      // Show error message if like fails
      alert(
  err.response?.data?.error ||
  err.response?.data?.message ||
  'Failed to like post'
);
      // Log error for debugging
      console.error('Error liking post:', err);
    } finally {
      // Stop loading for this post (enable like button)
      setLoadingLikes(prev => ({
  ...prev,
  [postId]: true
}));
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
      setLoadingComments(prev => ({
  ...prev,
  [postId]: true
}));

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
      setLoadingComments(prev => ({
  ...prev,
  [postId]: false
}));
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* === IMPROVED HEADER WITH USERNAME AND LOGOUT === */}
      {/* Navigation bar at the top with username display and logout button */}
      <AppBar position="sticky" sx={{ marginBottom: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* App title */}
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Social Feed
          </Typography>

          {/* Right side: username and logout button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Display logged-in username */}
            {username && (
              <Typography variant="body1" sx={{ fontWeight: '500' }}>
                Welcome, {username}!
              </Typography>
            )}

            {/* Logout button - clears localStorage and redirects to login */}
            <Button
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ textTransform: 'none', fontSize: '0.95rem' }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ paddingBottom: 4 }}>
        {/* === CREATE POST SECTION === */}
        {/* Card with improved styling - rounded corners, subtle shadow, better spacing */}
        <Card
          sx={{
            marginBottom: 4,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            backgroundColor: '#fff',
          }}
        >
          <CardContent sx={{ padding: 3 }}>
            {/* Section title */}
            <Typography
              variant="h6"
              component="div"
              sx={{ marginBottom: 3, fontWeight: '600', color: '#333' }}
            >
              What's on your mind?
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

            {/* Multiline text field for user to type post - improved styling */}
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Share your thoughts..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              disabled={creatingPost}
              sx={{
                marginBottom: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: '#fafafa',
                },
              }}
            />

            {/* Create Post button - improved styling */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreatePost}
              disabled={creatingPost}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                padding: '10px 24px',
                borderRadius: 1,
              }}
            >
              {creatingPost ? 'Creating...' : 'Post'}
            </Button>
          </CardContent>
        </Card>

        {/* === FEED SECTION === */}
        {/* Show loading message while fetching posts */}
        {loading && (
          <Alert severity="info" sx={{ marginBottom: 3 }}>
            Loading posts...
          </Alert>
        )}

        {/* Show error message if API call fails */}
        {error && (
          <Alert severity="error" sx={{ marginBottom: 3 }}>
            {error}
          </Alert>
        )}

        {/* Show "No posts available" if there are no posts */}
        {!loading && posts.length === 0 && !error && (
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              textAlign: 'center',
              padding: 4,
            }}
          >
            <Typography variant="body1" color="textSecondary">
              No posts available yet. Be the first to share!
            </Typography>
          </Card>
        )}

        {/* Display each post in a Card component - improved styling */}
        {posts.map((post) => (
          <Card
            key={post._id}
            sx={{
              marginBottom: 3,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              backgroundColor: '#fff',
              transition: 'box-shadow 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
              },
            }}
          >
            <CardContent sx={{ padding: 3 }}>
              {/* === HIGHLIGHTED USERNAME === */}
              {/* Username displayed prominently in bold */}
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: '700',
                  color: '#1976d2',
                  marginBottom: 1,
                }}
              >
                {post.username}
              </Typography>

              {/* === SMALLER GRAY TIMESTAMP === */}
              {/* Post date displayed smaller and in gray */}
              <Typography
                variant="caption"
                sx={{
                  color: '#999',
                  display: 'block',
                  marginBottom: 2,
                  fontSize: '0.75rem',
                }}
              >
                {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>

              {/* Display post text/content */}
              <Typography
                variant="body1"
                sx={{
                  marginBottom: 2,
                  lineHeight: 1.6,
                  color: '#333',
                }}
              >
                {post.text}
              </Typography>

              {/* === STATS ROW === */}
              {/* Display likes and comments count */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  marginBottom: 2,
                  paddingBottom: 2,
                  borderBottom: '1px solid #eee',
                }}
              >
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.9rem' }}>
                  ❤️ {post.likesCount || 0} Likes
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.9rem' }}>
                  💬 {post.commentsCount || 0} Comments
                </Typography>
              </Box>

              {/* === LIKE BUTTON - TURNS RED AFTER CLICKING === */}
              {/* Like button with visual feedback - shows filled red heart when liked */}
              <Box sx={{ marginBottom: 2 }}>
                <Button
                  startIcon={
                    likedPosts.has(post._id) ? (
                      <FavoriteIcon sx={{ color: '#e53935' }} />
                    ) : (
                      <FavoriteBorderIcon />
                    )
                  }
                  onClick={() => handleLike(post._id)}
                  disabled={loadingLikes[post._id]}
                  size="small"
                  sx={{
                    color: likedPosts.has(post._id) ? '#e53935' : '#666',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(229, 57, 53, 0.08)',
                    },
                  }}
                >
                  {loadingLikes[post._id] ? 'Liking...' : 'Like'}
                </Button>
              </Box>

              {/* === VISUALLY SEPARATED COMMENT SECTION === */}
              {/* Display existing comments if any */}
              {post.comments && post.comments.length > 0 && (
                <Box
                  sx={{
                    marginBottom: 2,
                    paddingTop: 2,
                    borderTop: '2px solid #f0f0f0',
                    backgroundColor: '#fafafa',
                    padding: 2,
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: '700',
                      marginBottom: 1.5,
                      color: '#333',
                      fontSize: '0.95rem',
                    }}
                  >
                    Comments ({post.comments.length}):
                  </Typography>

                  {/* Display each comment */}
                  {post.comments.map((comment, index) => (
                    <Box
                      key={index}
                      sx={{
                        marginBottom: 1.5,
                        paddingLeft: 1.5,
                        borderLeft: '3px solid #1976d2',
                        paddingBottom: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: '600',
                          color: '#1976d2',
                          fontSize: '0.9rem',
                        }}
                      >
                        {comment.username}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#333', marginTop: 0.5 }}>
                        {comment.comment}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* === ADD COMMENT SECTION - IMPROVED LAYOUT === */}
              {/* Visually separated comment input area */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  marginTop: 2,
                  padding: 2,
                  backgroundColor: '#fafafa',
                  borderRadius: 1,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                {/* Comment input field */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a comment..."
                  value={commentInputs[post._id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                  disabled={loadingComments[post._id]}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: '#fff',
                    },
                  }}
                />

                {/* Add Comment button */}
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleComment(post._id)}
                  disabled={loadingComments[post._id]}
                  sx={{
                    textTransform: 'none',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    minWidth: { xs: '100%', sm: '100px' },
                  }}
                >
                  {loadingComments[post._id] ? 'Adding...' : 'Comment'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Container>
    </Box>
  );
}


export default Feed;