import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container } from '@mui/material';
import './App.css';

// Import page components
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';

function App() {
  return (
    <Router>
      {/* Navigation bar at the top */}
      <AppBar position="static" sx={{ marginBottom: 3 }}>
        <Toolbar>
          {/* App title */}
          <div style={{ flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h2 style={{ margin: 0, color: 'white' }}>Mini Social Feed</h2>
            </Link>
          </div>

          {/* Navigation links */}
          <Button color="inherit" component={Link} to="/feed">
            Feed
          </Button>
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
          <Button color="inherit" component={Link} to="/signup">
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main content area - Routes are rendered here */}
      <Container>
        <Routes>
          {/* Route for login page */}
          <Route path="/login" element={<Login />} />

          {/* Route for signup page */}
          <Route path="/signup" element={<Signup />} />

          {/* Route for feed page */}
          <Route path="/feed" element={<Feed />} />

          {/* Default route - redirect to feed */}
          <Route path="/" element={<Feed />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
