import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css'; // Reuse same styles as Login

function Signup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:8080/api/v1/adduser', {
        name,
        email,
        password,
      });

      alert('Signup successful! 🎉 Now log in!');
      navigate('/');
    } catch (err) {
      alert('Signup failed 😢');
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-left">
          <h1 className="app-title">
            <span className="y-letter">Y</span>ummly
          </h1>
          <h3 className="app-subtitle">Join the community and start sharing your flavor!</h3>

          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign Up</button>
          </form>

          {/* Login Prompt */}
          <p className="signup-link">
            Already have an account?{' '}
            <span onClick={() => navigate('/')} className="signup-button">
              Log In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
