import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from './UserContext';
import '../styles/Login.css';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Add timeout to prevent long waiting
  timeout: 5000,
  // Enable credentials for CORS
  withCredentials: true
});

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting to connect to:', api.defaults.baseURL);
      const res = await api.post('/api/v1/login', {
        email,
        password,
      });

      console.log('Login response:', res.data);
      const userData = res.data;
      const token = res.data.token || 'dummy-token';

      // Store the token in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);

      // Set the default authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
      navigate('/home');
    } catch (err) {
      console.error('❌ Login error:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Connection timed out. Please check if the backend server is running.');
      } else if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', err.response.data);
        setError(err.response.data.message || 'Login failed. Please check your credentials.');
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError(`Unable to connect to the server at ${api.defaults.baseURL}. Please check if the backend is running.`);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', err.message);
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Top Navigation */}
      

      {/* Main Container */}
      <div className="login-wrapper">
        <div className="login-left">
        
        <h1 className="app-title">
            <span className="y-letter">Y</span>ummly
          </h1>
          <h3 className="app-subtitle">Where Your Love for Food Meets the Community!</h3>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Login'}
            </button>
          </form>
            {/* Signup Prompt */}
            <p className="signup-link">
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')} className="signup-button">
              Sign Up
            </span>
          </p>
        </div>
        
      </div>
    </div>
  );
}


export default Login;
