import { Card, CardContent, Typography, Container, Box } from '@mui/material';

// Login page component - displays a simple login card
function Login() {
  return (
    <Container maxWidth="sm">
      {/* Centered container with top margin */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        {/* Card component from Material UI */}
        <Card sx={{ width: '100%' }}>
          <CardContent>
            {/* Page title */}
            <Typography variant="h4" component="h1" gutterBottom>
              Login
            </Typography>

            {/* Placeholder content */}
            <Typography variant="body1" color="textSecondary">
              Welcome back! Please log in to your account to continue.
            </Typography>

            <Typography variant="body2" sx={{ marginTop: 2, color: '#999' }}>
              [Login form will be added here]
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Login;
