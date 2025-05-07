import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import { UserProvider } from './pages/UserContext'; 
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import Comments from './pages/Comments';

function App() {
  return (
    <UserProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/post/:postId/comments" element={<Comments />} />
      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
