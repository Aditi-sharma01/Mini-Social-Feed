import { Card, CardContent, Typography, Container, Box } from '@mui/material';

// Feed page component - displays the social feed
function Feed() {
  return (
    <Container maxWidth="md">
      {/* Page title */}
      <Box sx={{ marginTop: 3, marginBottom: 3 }}>
        <Typography variant="h4" component="h1">
          Social Feed
        </Typography>
      </Box>

      {/* Card component from Material UI */}
      <Card>
        <CardContent>
          {/* Placeholder content */}
          <Typography variant="body1" color="textSecondary">
            Welcome to your social feed! This is where you'll see posts from other users.
          </Typography>

          <Typography variant="body2" sx={{ marginTop: 2, color: '#999' }}>
            [Posts will be displayed here]
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Feed;
