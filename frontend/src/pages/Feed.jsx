import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, Typography, Container, Box, Alert, TextField, Button, AppBar, Toolbar, Avatar, Divider } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LogoutIcon from '@mui/icons-material/Logout';
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from '@mui/icons-material/Share';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
const API_URL = "https://mini-social-feed-backend-9zrh.onrender.com";

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

  // State for image URL input - stores the image URL user types
  const [selectedImage, setSelectedImage] = useState(null);

  // Function to fetch posts from the backend - extracted so we can call it again after creating a post
  const fetchPosts = async () => {
    try {
      // Send GET request to fetch all posts
      const response = await axios.get(`${API_URL}/api/posts`);

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

    // Validate that at least text or image URL is provided
    if (!newPost.trim() && !selectedImage) {
      setCreatePostError('Please add text or an image URL');
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
      const formData = new FormData();

formData.append('text', newPost);

if (selectedImage) {
  formData.append('image', selectedImage);
}

const response = await axios.post(
  `${API_URL}/api/posts/create`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  }
);

      // Show success message
      setSuccessMessage('Post created successfully!');

      // Clear the text and image URL input fields
      setNewPost('');
      setSelectedImage(null);

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
        `${API_URL}/api/posts/${postId}/like`,
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
  [postId]: false
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
        `${API_URL}/api/posts/${postId}/comment`,
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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* === HEADER WITH "SOCIAL" TITLE AND USER PROFILE === */}
      <AppBar 
        position="sticky" 
        sx={{ 
          backgroundColor: '#fff',
          color: '#000',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          marginBottom: 2
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', paddingY: 2 }}>
          {/* Large "Social" title on the left */}
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              color: '#000',
              fontSize: '2rem'
            }}
          >
            Social
          </Typography>

          {/* Right side: user profile and logout button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Display logged-in username */}
            {username && (
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: '600', color: '#000' }}>
                  {username}
                </Typography>
              </Box>
            )}

            {/* User avatar circle */}
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                backgroundColor: '#1976d2',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </Avatar>

            {/* Logout button - clears localStorage and redirects to login */}
            <Button
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ textTransform: 'none', fontSize: '0.9rem' }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

<Container
  maxWidth="lg"
  sx={{
    paddingBottom: 4,
  }}
>        {/* === CREATE POST SECTION === */}
        <Card
          sx={{
            marginBottom: 4,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            backgroundColor: '#fff',
          }}
        >
          <CardContent sx={{ padding: 3 }}>
            {/* "Create Post" heading */}
            <Typography
              variant="h5"
              component="div"
              sx={{ marginBottom: 3, fontWeight: '700', color: '#000' }}
            >
              Create Post
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

            {/* Large textarea for user to type post */}
<TextField
  fullWidth
  multiline
  rows={5}
  placeholder="What's on your mind?"
  value={newPost}
  onChange={(e) => setNewPost(e.target.value)}
  disabled={creatingPost}
  sx={{
    marginBottom: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
      backgroundColor: '#f8f9fa',
      fontSize: '1rem',
    },
  }}
/>

{/* Image upload field */}
<Box sx={{ marginBottom: 3 }}>
  <Button
    component="label"
    sx={{
      minWidth: 55,
      width: 55,
      height: 55,
      borderRadius: '12px',
      backgroundColor: '#f5f5f5',
      border: '1px solid #ddd',
      color: '#1976d2',
    }}
  >
    <PhotoCameraIcon />

    <input
      hidden
      type="file"
      accept="image/*"
      onChange={(e) => setSelectedImage(e.target.files[0])}
      disabled={creatingPost}
    />
  </Button>

  {selectedImage && (
    <Box
      component="img"
      src={URL.createObjectURL(selectedImage)}
      alt="preview"
      sx={{
        width: '100%',
        maxHeight: 250,
        objectFit: 'cover',
        borderRadius: 2,
        mt: 2,
      }}
    />
  )}
</Box>

            {/* Create Post button - positioned on the right */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreatePost}
                disabled={creatingPost}
                sx={{
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  padding: '12px 32px',
                  borderRadius: 1,
                }}
              >
                {creatingPost ? 'Creating...' : 'Post'}
              </Button>
            </Box>
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center',
              padding: 4,
              backgroundColor: '#fff',
            }}
          >
            <Typography variant="body1" color="textSecondary">
              No posts available yet. Be the first to share!
            </Typography>
          </Card>
        )}

        {/* Display each post in a Card component */}
        {posts.map((post) => (
          <Card
            key={post._id}
            sx={{
              marginBottom: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              backgroundColor: '#fff',
              transition: 'box-shadow 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              },
            }}
          >
            <CardContent sx={{ padding: 3 }}>
              {/* === USER INFO ROW: Avatar, Username, Timestamp === */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, marginBottom: 2 }}>
                {/* User avatar circle */}
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: '#1976d2',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                  }}
                >
                  {post.username ? post.username.charAt(0).toUpperCase() : 'U'}
                </Avatar>

                {/* Username and timestamp column */}
                <Box sx={{ flex: 1 }}>
                  {/* Username - bold */}
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: '700',
                      color: '#000',
                      marginBottom: 0.5,
                    }}
                  >
                    {post.username}
                  </Typography>

                  {/* Timestamp - small gray */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#999',
                      fontSize: '0.75rem',
                    }}
                  >
                    {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>

              {/* === POST CONTENT === */}
              <Typography
                variant="body1"
                sx={{
                  marginBottom: 2,
                  lineHeight: 1.6,
                  color: '#333',
                  fontSize: '1rem',
                }}
              >
                {post.text}
              </Typography>

              {/* === POST IMAGE === */}
              {post.imageUrl && (
                <Box
                  component="img"
                  src={post.imageUrl}
                  alt="Post image"
                  sx={{
                    width: '100%',
                    borderRadius: 1,
                    marginBottom: 2,
                    maxHeight: '450px',
                    objectFit: 'cover',
                    backgroundColor: '#f0f0f0',
                  }}
                />
              )}

              {/* === STATS ROW: Likes and Comments Count === */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  marginBottom: 2,
                  paddingY: 1.5,
                  borderBottom: '1px solid #eee',
                }}
              >
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.9rem' }}>
                  ❤️ {post.likesCount || 0} {post.likesCount === 1 ? 'Like' : 'Likes'}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.9rem' }}>
                  💬 {post.commentsCount || 0} {post.commentsCount === 1 ? 'Comment' : 'Comments'}
                </Typography>
              </Box>

              {/* === ACTION BUTTONS ROW: Like, Comment, Share === */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  marginBottom: 2,
                  justifyContent: 'space-around',
                }}
              >
                {/* Like Button */}
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
                    flex: 1,
                    color: likedPosts.has(post._id) ? '#e53935' : '#666',
                    textTransform: 'none',
                    fontWeight: '500',
                    '&:hover': {
                      backgroundColor: 'rgba(229, 57, 53, 0.08)',
                    },
                  }}
                >
                  {loadingLikes[post._id] ? 'Liking...' : 'Like'}
                </Button>

                {/* Comment Button */}
                <Button
                  startIcon={<CommentIcon  />}
                  disabled={loadingComments[post._id]}
                  size="small"
                  sx={{
                    flex: 1,
                    color: '#666',
                    textTransform: 'none',
                    fontWeight: '500',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  Comment
                </Button>

                {/* Share Button */}
                <Button
                  startIcon={<ShareIcon />}
                  size="small"
                  sx={{
                    flex: 1,
                    color: '#666',
                    textTransform: 'none',
                    fontWeight: '500',
                    '&:hover': {
                      backgroundColor: 'rgba(100, 100, 100, 0.08)',
                    },
                  }}
                >
                  Share
                </Button>
              </Box>

              {/* === COMMENTS SECTION === */}
              {post.comments && post.comments.length > 0 && (
                <Box
                  sx={{
                    marginTop: 2,
                    paddingTop: 2,
                    borderTop: '1px solid #eee',
                    backgroundColor: '#f8f9fa',
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
                    Comments ({post.comments.length})
                  </Typography>

                  {/* Display each comment */}
                  {post.comments.map((comment, index) => (
                    <Box
                      key={index}
                      sx={{
                        marginBottom: 1.5,
                        paddingBottom: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: '600',
                          color: '#1976d2',
                          fontSize: '0.9rem',
                          marginBottom: 0.3,
                        }}
                      >
                        {comment.username}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#333', fontSize: '0.9rem' }}>
                        {comment.comment}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* === ADD COMMENT SECTION === */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  marginTop: 2,
                  padding: 2,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 1,
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
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
                      fontSize: '0.9rem',
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
                    minWidth: { xs: '100%', sm: '120px' },
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