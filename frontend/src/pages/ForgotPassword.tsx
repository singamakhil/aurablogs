import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [emailPreview, setEmailPreview] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Something went wrong');

            setSubmitted(true);
            if (data.emailPreview) setEmailPreview(data.emailPreview);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="login-container">
                <div className="login-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📮</div>
                    <h1 style={{
                        fontSize: '1.75rem', fontWeight: 800, marginBottom: '12px',
                        background: 'linear-gradient(to right, #f97316, #ef4444)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>Check your inbox</h1>
                    <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
                        If <strong style={{ color: '#e2e8f0' }}>{email}</strong> is registered,
                        you'll receive a password reset link within a few minutes.
                        The link expires in <strong style={{ color: '#e2e8f0' }}>1 hour</strong>.
                    </p>

                    {emailPreview && (
                        <div style={{
                            background: 'rgba(16,185,129,0.08)',
                            border: '1px solid rgba(16,185,129,0.2)',
                            borderRadius: '12px', padding: '14px', marginBottom: '20px'
                        }}>
                            <p style={{ color: '#34d399', fontSize: '0.8rem', margin: '0 0 8px' }}>
                                🛠️ <strong>Dev mode:</strong> Click to preview the email:
                            </p>
                            <a href={emailPreview} target="_blank" rel="noreferrer"
                                style={{ color: '#38bdf8', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                                View Email Preview →
                            </a>
                        </div>
                    )}

                    <div className="signup-link">
                        <Link to="/login">← Back to Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Reset Password</h1>
                    <p>Enter your email and we'll send you a reset link</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '10px',
                        borderRadius: '8px', marginBottom: '15px',
                        border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.9rem', textAlign: 'center'
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" placeholder="name@example.com"
                            value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <button type="submit" className="submit-btn"
                        style={{ marginTop: '8px', opacity: isLoading ? 0.7 : 1 }}
                        disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="signup-link">
                    Remember your password? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
