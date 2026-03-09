import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className={`premium-header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                <Link to="/" className="logo-container">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 12C22 16.1 19.4 19.6 15.8 21.2L12 12L15.8 2.8C19.4 4.4 22 7.9 22 12Z" fill="url(#paint1_linear)" />
                            <path d="M2 12C2 7.9 4.6 4.4 8.2 2.8L12 12L8.2 21.2C4.6 19.6 2 16.1 2 12Z" fill="url(#paint2_linear)" />
                            <defs>
                                <linearGradient id="paint0_linear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#8b5cf6" /><stop offset="1" stopColor="#3b82f6" />
                                </linearGradient>
                                <linearGradient id="paint1_linear" x1="12" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#a855f7" stopOpacity="0.8" /><stop offset="1" stopColor="#3b82f6" stopOpacity="0.8" />
                                </linearGradient>
                                <linearGradient id="paint2_linear" x1="2" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#8b5cf6" stopOpacity="0.4" /><stop offset="1" stopColor="#2dd4bf" stopOpacity="0.4" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className="logo-text">AuraBlogs</span>
                </Link>

                <nav className="nav-links">
                    <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
                    <a href="#about">About</a>
                    <a href="#contact">Contact</a>
                </nav>

                <div className="header-actions">
                    {isAuthenticated ? (
                        <>
                            <div className="user-actions">
                                <span className="user-greeting">Hi, {user?.name?.split(' ')[0]}!</span>
                                <Link to="/profile" className="login-btn">Profile</Link>
                                <button onClick={handleLogout} className="logout-btn">Logout</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="login-btn">Login</Link>
                            <Link to="/register" className="signup-btn">Get Started</Link>
                        </>
                    )}
                </div>

                <button className="mobile-menu-btn" aria-label="Toggle menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
