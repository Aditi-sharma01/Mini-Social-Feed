import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Container, Box, TextField, Button, Alert } from '@mui/material';

// Signup page component - displays a signup form with input fields
function Signup() {
  // State for form inputs
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for showing success/error messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // State for tracking loading state (while request is being sent)
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSignup = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');

    // Validate inputs
    if (!username || !email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Send POST request to backend
      const response = await axios.post('https://mini-social-feed-backend-9zrh.onrender.com/api/auth/signup', {
        username,
        email,
        password,
      });

      // Show success message
      setSuccessMessage('Signup successful! You can now log in.');

      // Clear form fields
      setUsername('');
      setEmail('');
      setPassword('');

      // Log response for debugging
      console.log('Signup response:', response.data);
    } catch (error) {
      // Show error message
      if (error.response && error.response.data && error.response.data.error) {
  setErrorMessage(error.response.data.error);
}
 else {
        setErrorMessage('Signup failed. Please try again.');
      }

      // Log error for debugging
      console.error('Signup error:', error);
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
              Sign Up
            </Typography>

            {/* Description */}
            <Typography variant="body1" color="textSecondary" sx={{ marginBottom: 3 }}>
              Create a new account to join our social feed community.
            </Typography>

            {/* Success message - shown when signup is successful */}
            {successMessage && (
              <Alert severity="success" sx={{ marginBottom: 2 }}>
                {successMessage}
              </Alert>
            )}

            {/* Error message - shown when signup fails */}
            {errorMessage && (
              <Alert severity="error" sx={{ marginBottom: 2 }}>
                {errorMessage}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSignup}>
              {/* Username input field */}
              <TextField
                fullWidth
                label="Username"
                placeholder="Enter your username"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />

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

              {/* Sign Up button */}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ marginTop: 2 }}
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Signup;
