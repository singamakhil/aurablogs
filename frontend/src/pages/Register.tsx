import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailPreview, setEmailPreview] = useState(''); // Dev: link to view the email
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirm) return setError('Passwords do not match');
        if (password.length < 6) return setError('Password must be at least 6 characters');

        setIsLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Registration failed');

            // Show the "check your email" success state
            setSubmitted(true);
            if (data.emailPreview) setEmailPreview(data.emailPreview);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Success state ────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📬</div>
                        <h1 style={{
                            fontSize: '1.75rem', fontWeight: 800, marginBottom: '12px',
                            background: 'linear-gradient(to right, #a855f7, #38bdf8)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>Check your inbox!</h1>
                        <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
                            We sent a verification link to <strong style={{ color: '#e2e8f0' }}>{email}</strong>.
                            Click the link to activate your account and start reading.
                        </p>

                        {emailPreview && (
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.08)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: '12px', padding: '14px',
                                marginBottom: '20px'
                            }}>
                                <p style={{ color: '#34d399', fontSize: '0.8rem', margin: '0 0 8px' }}>
                                    🛠️ <strong>Dev mode:</strong> No real email sent. Click to preview:
                                </p>
                                <a href={emailPreview} target="_blank" rel="noreferrer"
                                    style={{ color: '#38bdf8', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                                    View Email Preview →
                                </a>
                            </div>
                        )}

                        <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                            Didn't receive it?{' '}
                            <button onClick={() => setSubmitted(false)}
                                style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', fontSize: 'inherit', fontWeight: 600 }}>
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Form state ───────────────────────────────────────────────────────────
    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Create Account</h1>
                    <p>Join AuraBlogs and unlock premium content</p>
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
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" placeholder="John Doe"
                            value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" placeholder="name@example.com"
                            value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="At least 6 characters"
                            value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm">Confirm Password</label>
                        <input type="password" id="confirm" placeholder="Repeat password"
                            value={confirm} onChange={e => setConfirm(e.target.value)} required />
                    </div>
                    <button type="submit" className="submit-btn" disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1 }}>
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="signup-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
