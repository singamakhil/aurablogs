import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include' // Sends/receives the HTTP-only cookie
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.notVerified) {
                    // Special case: account registered but email not verified yet
                    setError('__NOT_VERIFIED__');
                } else {
                    throw new Error(data.message || 'Login failed');
                }
                return;
            }

            // No token is in the response body. The server set an HTTP-only cookie.
            // We just update React state with the returned user info.
            login(data.user);
            navigate('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to access premium content</p>
                </div>

                {error === '__NOT_VERIFIED__' ? (
                    <div style={{
                        background: 'rgba(234, 179, 8, 0.1)', color: '#fbbf24', padding: '14px 16px',
                        borderRadius: '10px', marginBottom: '15px',
                        border: '1px solid rgba(234, 179, 8, 0.25)', fontSize: '0.9rem', lineHeight: 1.5
                    }}>
                        <strong>📬 Please verify your email first.</strong>
                        <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                            Check your inbox for the verification link we sent when you signed up.
                            {' '}<a href="/register" style={{ color: '#fbbf24', fontWeight: 600 }}>Resend email →</a>
                        </p>
                    </div>
                ) : error ? (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px',
                        borderRadius: '8px', marginBottom: '15px',
                        border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem', textAlign: 'center'
                    }}>
                        {error}
                    </div>
                ) : null}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" placeholder="name@example.com"
                            value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="••••••••"
                            value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="forgot-password">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>
                    <button type="submit" className="submit-btn" disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1 }}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="signup-link">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
