import React, { useState, useContext } from 'react';
import './index.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaUserPlus } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    
    try {
      await register(username, password);
      console.log('Registration Successful');
      navigate('/Home');
    } catch (err) {
      console.error('Registration Error:', err.message);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        
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
              placeholder="Choose a username"
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
              placeholder="Create a password"
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
        </label>

        <label htmlFor="confirmPassword">
          Confirm Password
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
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
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
          {loading ? 'Creating Account...' : (
            <>
              Register <FaUserPlus style={{ marginLeft: '8px' }} />
            </>
          )}
        </button>
        
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;