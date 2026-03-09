import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import './Login.css';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!token) {
        return (
            <div className="login-container">
                <div className="login-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔗</div>
                    <h1 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '12px' }}>Invalid Link</h1>
                    <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                        This reset link is missing its token. Please request a new one.
                    </p>
                    <Link to="/forgot-password" className="submit-btn"
                        style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 28px' }}>
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="login-container">
                <div className="login-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔓</div>
                    <h1 style={{
                        fontSize: '1.75rem', fontWeight: 800, marginBottom: '12px',
                        background: 'linear-gradient(to right, #10b981, #38bdf8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>Password Updated!</h1>
                    <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                        Your password has been reset successfully. You can now log in with your new password.
                    </p>
                    <Link to="/login" className="submit-btn"
                        style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center', padding: '14px 32px' }}>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirm) return setError('Passwords do not match');
        if (newPassword.length < 6) return setError('Password must be at least 6 characters');

        setIsLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Reset failed');

            setSuccess(true);
            // Auto-redirect after 3 seconds
            setTimeout(() => navigate('/login'), 3000);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Set New Password</h1>
                    <p>Choose a strong password for your account</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '10px',
                        borderRadius: '8px', marginBottom: '15px',
                        border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.9rem', textAlign: 'center'
                    }}>
                        {error}
                        {error.includes('expired') && (
                            <div style={{ marginTop: '8px' }}>
                                <Link to="/forgot-password" style={{ color: '#a855f7', fontWeight: 600 }}>
                                    Request a new link →
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input type="password" id="newPassword" placeholder="At least 6 characters"
                            value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm">Confirm Password</label>
                        <input type="password" id="confirm" placeholder="Repeat new password"
                            value={confirm} onChange={e => setConfirm(e.target.value)} required />
                    </div>
                    <button type="submit" className="submit-btn"
                        style={{ opacity: isLoading ? 0.7 : 1 }}
                        disabled={isLoading}>
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="signup-link">
                    <Link to="/login">← Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
