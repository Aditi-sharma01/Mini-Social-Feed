import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, Typography, Container, Box, TextField, Button, Alert } from '@mui/material';

// Login page component - displays a login form with email and password fields
function Login() {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for showing success/error messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // State for tracking loading state (while request is being sent)
  const [loading, setLoading] = useState(false);

  // Hook to navigate to different pages after successful login
  const navigate = useNavigate();

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');

    // Validate inputs
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Send POST request to backend login endpoint
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // Show success message
      setSuccessMessage('Login successful! Redirecting...');

      // Store JWT token in localStorage for authentication
      localStorage.setItem('token', response.data.token);

      // Store username in localStorage
      localStorage.setItem('username', response.data.user.username);

      // Log response for debugging
      console.log('Login response:', response.data);

      // Wait a moment before redirecting to show success message
      setTimeout(() => {
        // Redirect to feed page after successful login
        navigate('/feed');
      }, 1000);
    } catch (error) {
      // Show error message
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Login failed. Please try again.');
      }

      // Log error for debugging
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      {/* Centered container */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        {/* Card component */}
        <Card sx={{ width: '100%' }}>
          <CardContent>
            {/* Page title */}
            <Typography variant="h4" component="h1" gutterBottom>
              Login
            </Typography>

            {/* Description */}
            <Typography variant="body1" color="textSecondary" sx={{ marginBottom: 3 }}>
              Welcome back! Please log in to your account.
            </Typography>

            {/* Success message - shown when login is successful */}
            {successMessage && (
              <Alert severity="success" sx={{ marginBottom: 2 }}>
                {successMessage}
              </Alert>
            )}

            {/* Error message - shown when login fails */}
            {errorMessage && (
              <Alert severity="error" sx={{ marginBottom: 2 }}>
                {errorMessage}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleLogin}>
              {/* Email input field */}
              <TextField
                fullWidth
                label="Email"
                type="email"
                placeholder="Enter your email"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              {/* Password input field */}
              <TextField
                fullWidth
                label="Password"
                type="password"
                placeholder="Enter your password"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              {/* Login button */}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ marginTop: 2 }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Logging In...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Login;
