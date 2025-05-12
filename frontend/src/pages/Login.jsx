import React, { useState, useContext } from 'react';
import './index.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(username, password);
      console.log('Login Successful');
      navigate('/Home');
    } catch (err) {
      console.error('Login Error:', err.message);
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        
        {error && (
          <div style={{ 
            color: 'var(--danger)', 
            backgroundColor: 'rgba(231, 76, 60, 0.1)', 
            padding: 'var(--space-sm)', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: 'var(--space-md)' 
          }}>
            {error}
          </div>
        )}
        
        <label htmlFor="username">
          Username
          <div style={{ position: 'relative' }}>
            <FaUser style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--neutral-light)' 
            }} />
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
        </label>
        
        <label htmlFor="password">
          Password
          <div style={{ position: 'relative' }}>
            <FaLock style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--neutral-light)' 
            }} />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
        </label>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Logging in...' : (
            <>
              Login <FaSignInAlt style={{ marginLeft: '8px' }} />
            </>
          )}
        </button>
        
        <p>
          Don't have an account? <Link to="/signup">Register Now</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;