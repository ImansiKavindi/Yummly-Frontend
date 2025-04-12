import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from './UserContext';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:8080/api/v1/login', {
        email,
        password,
      });

      const userData = res.data;
      const token = 'dummy-token';

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);

      setUser(userData);
      navigate('/home');
    } catch (err) {
      console.error('❌ Login error:', err);
      alert('Login failed ❌');
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

        <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
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
