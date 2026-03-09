import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './Login.css';

type State = 'loading' | 'success' | 'error' | 'already-verified';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [state, setState] = useState<State>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setState('error');
            setMessage('No verification token found in the link.');
            return;
        }

        const verify = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const res = await fetch(`${apiUrl}/api/auth/verify-email?token=${token}`);

                const data = await res.json();

                if (res.ok) {
                    setState(data.message.includes('already') ? 'already-verified' : 'success');
                    setMessage(data.message);
                } else {
                    setState('error');
                    setMessage(data.message || 'Verification failed');
                }
            } catch {
                setState('error');
                setMessage('Could not connect to the server. Please try again.');
            }
        };

        verify();
    }, [searchParams]);

    const config = {
        loading: { icon: '⏳', title: 'Verifying your email...', color: '#94a3b8', gradient: '#94a3b8, #94a3b8' },
        success: { icon: '✅', title: 'Email Verified!', color: '#10b981', gradient: '#10b981, #38bdf8' },
        'already-verified': { icon: '☑️', title: 'Already Verified', color: '#38bdf8', gradient: '#38bdf8, #8b5cf6' },
        error: { icon: '❌', title: 'Verification Failed', color: '#ef4444', gradient: '#ef4444, #f97316' },
    }[state];

    return (
        <div className="login-container">
            <div className="login-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{config.icon}</div>
                <h1 style={{
                    fontSize: '1.75rem', fontWeight: 800, marginBottom: '12px',
                    background: `linear-gradient(to right, ${config.gradient})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>{config.title}</h1>

                {state !== 'loading' && (
                    <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>{message}</p>
                )}

                {state === 'loading' && (
                    <p style={{ color: '#94a3b8' }}>Please wait while we verify your link...</p>
                )}

                {(state === 'success' || state === 'already-verified') && (
                    <Link to="/login" className="submit-btn"
                        style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center', padding: '14px 32px' }}>
                        Go to Login
                    </Link>
                )}

                {state === 'error' && (
                    <div>
                        <Link to="/register" className="submit-btn"
                            style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center', padding: '14px 32px', marginBottom: '12px' }}>
                            Register Again
                        </Link>
                        <div className="signup-link">
                            Already have an account? <Link to="/login">Sign in</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
