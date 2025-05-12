import React, { useState } from 'react'
import './index.css'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from './firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa'

const SignUpForm = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    
    const validatePassword = () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return false
        }
        
        if (password.length < 6) {
            setError('Password must be at least 6 characters long')
            return false
        }
        
        return true
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        
        if (!validatePassword()) return
        
        setLoading(true)
        try {
            await createUserWithEmailAndPassword(auth, email, password)
            console.log("Account Created Successfully")
            navigate('/login')
        } catch (err) {
            console.log(err)
            setError(err.message || 'Failed to create account. Please try again.')
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className='signup-container'>
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
                
                <label htmlFor="email">
                    Email Address
                    <div style={{ position: 'relative' }}>
                        <FaEnvelope style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            color: 'var(--neutral-light)' 
                        }} />
                        <input 
                            type="email" 
                            id="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
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
                    type='submit'
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? 'Creating Account...' : (
                        <>
                            Sign Up <FaUserPlus style={{ marginLeft: '8px' }} />
                        </>
                    )}
                </button>
                
                <p>Already have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    )
}

export default SignUpForm