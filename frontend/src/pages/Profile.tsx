import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import './Profile.css';

const Profile: React.FC = () => {
    const { user, logout, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });
    const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user, authLoading, navigate]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage({ text: '', type: '' });
        setIsUpdatingProfile(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
                credentials: 'include'
            });
            const data = await res.json();

            if (res.ok) {
                setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
                // We might need to refresh the auth context here if we want the Header to update immediately
                // For now, let's assume the user object in context is updated or will be on next mount
            } else {
                setProfileMessage({ text: data.message || 'Update failed', type: 'error' });
            }
        } catch {
            setProfileMessage({ text: 'Server error', type: 'error' });
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ text: '', type: '' });

        if (newPassword !== confirmPassword) {
            return setPasswordMessage({ text: 'Passwords do not match', type: 'error' });
        }

        setIsUpdatingPassword(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/auth/update-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
                credentials: 'include'
            });
            const data = await res.json();

            if (res.ok) {
                setPasswordMessage({ text: 'Password updated successfully!', type: 'success' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordMessage({ text: data.message || 'Update failed', type: 'error' });
            }
        } catch {
            setPasswordMessage({ text: 'Server error', type: 'error' });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you absolutely sure? This action cannot be undone.')) return;

        setIsDeleting(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/auth/account`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                await logout();
                navigate('/');
            } else {
                alert('Failed to delete account');
            }
        } catch {
            alert('Server error');
        } finally {
            setIsDeleting(false);
        }
    };

    if (authLoading || !user) {
        return <div className="profile-loading">Loading...</div>;
    }

    return (
        <div className="profile-page">
            <Header />
            <main className="profile-content">
                <div className="profile-container">
                    <header className="profile-header">
                        <h1>Account Settings</h1>
                        <p>Manage your profile and security settings</p>
                    </header>

                    <div className="settings-grid">
                        {/* Profile Info Section */}
                        <section className="settings-section">
                            <h2>Profile Information</h2>
                            <form onSubmit={handleUpdateProfile}>
                                {profileMessage.text && (
                                    <div className={`message-banner ${profileMessage.type}`}>
                                        {profileMessage.text}
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Display Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" value={email} disabled className="disabled-input" />
                                    <span className="input-hint">Email cannot be changed after verification</span>
                                </div>
                                <button type="submit" className="save-btn" disabled={isUpdatingProfile}>
                                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </section>

                        {/* Password Section */}
                        <section className="settings-section">
                            <h2>Security</h2>
                            <form onSubmit={handleChangePassword}>
                                {passwordMessage.text && (
                                    <div className={`message-banner ${passwordMessage.type}`}>
                                        {passwordMessage.text}
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="save-btn" disabled={isUpdatingPassword}>
                                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </section>

                        {/* Danger Zone */}
                        <section className="settings-section danger-zone">
                            <h2>Danger Zone</h2>
                            <p>Deleting your account is permanent and will remove all your data.</p>
                            <button
                                onClick={handleDeleteAccount}
                                className="delete-btn"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
