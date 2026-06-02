import { Card, CardContent, Typography, Container, Box } from '@mui/material';

// Signup page component - displays a simple signup card
function Signup() {
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
              Sign Up
            </Typography>

            {/* Placeholder content */}
            <Typography variant="body1" color="textSecondary">
              Create a new account to join our social feed community.
            </Typography>

            <Typography variant="body2" sx={{ marginTop: 2, color: '#999' }}>
              [Signup form will be added here]
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Signup;
