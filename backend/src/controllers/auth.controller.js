const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built-in Node.js module for secure random tokens
const { queryOne, run } = require('../db/database');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const JWT_SECRET = process.env.JWT_SECRET || 'aurablogs_jwt_super_secret_key_2025';
const COOKIE_NAME = 'aurablogs_token';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
    console.log('📝 Registration attempt for:', req.body.email);
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(password, salt);

        // Generate a secure random verification token
        const verify_token = crypto.randomBytes(32).toString('hex');

        const result = await run(
            'INSERT INTO users (name, email, password_hash, is_verified, verify_token) VALUES (?, ?, ?, 0, ?)',
            [name, email, password_hash, verify_token]
        );

        // Send verification email (non-blocking background process)
        console.log('📬 Starting email send flow in background...');
        sendVerificationEmail(email, name, verify_token)
            .then(previewUrl => {
                if (previewUrl) console.log('🏁 Email background process finished. Preview:', previewUrl);
            })
            .catch(emailErr => {
                console.error('Email background send failed:', emailErr.message);
            });


        res.status(201).json({
            message: 'Account created! Please check your email to verify your account.',
            // In development, return the preview URL so devs can see the email
            ...(process.env.NODE_ENV !== 'production' && { emailPreview: previewUrl })
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// ─── VERIFY EMAIL ──────────────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }

        const user = await queryOne('SELECT * FROM users WHERE verify_token = ?', [token]);

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification link' });
        }

        if (user.is_verified) {
            return res.status(200).json({ message: 'Email already verified. You can log in.' });
        }

        // Mark user as verified, clear the token
        await run(
            'UPDATE users SET is_verified = 1, verify_token = NULL WHERE id = ?',
            [user.id]
        );

        res.status(200).json({ message: 'Email verified successfully! You can now log in.' });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await queryOne('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Block login if not verified
        if (!user.is_verified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in. Check your inbox.',
                notVerified: true
            });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '24h'
        });

        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

        res.status(200).json({
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
const logout = (req, res) => {
    res.cookie(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 });
    res.status(200).json({ message: 'Logged out successfully' });
};

// ─── GET ME (Session Check) ────────────────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const user = await queryOne(
            'SELECT id, name, email, created_at FROM users WHERE id = ?',
            [req.user.userId]
        );
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ user });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await queryOne('SELECT * FROM users WHERE email = ?', [email]);

        // Always return success to prevent email enumeration attacks
        if (!user) {
            return res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' });
        }

        // Generate a cryptographically secure token, expires in 1 hour
        const reset_token = crypto.randomBytes(32).toString('hex');
        const reset_token_expires = Date.now() + 60 * 60 * 1000; // 1 hour from now

        await run(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [reset_token, reset_token_expires, user.id]
        );

        let previewUrl = null;
        try {
            previewUrl = await sendPasswordResetEmail(email, user.name, reset_token);
        } catch (emailErr) {
            console.error('Email send failed:', emailErr.message);
        }

        res.status(200).json({
            message: 'If this email is registered, a reset link has been sent.',
            ...(process.env.NODE_ENV !== 'production' && { emailPreview: previewUrl })
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await queryOne('SELECT * FROM users WHERE reset_token = ?', [token]);

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset link' });
        }

        // Check if token has expired
        if (Date.now() > user.reset_token_expires) {
            await run('UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [user.id]);
            return res.status(400).json({ message: 'This reset link has expired. Please request a new one.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(newPassword, salt);

        // Update password and clear the token
        await run(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
            [password_hash, user.id]
        );

        res.status(200).json({ message: 'Password reset successfully! You can now log in.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        await run(
            'UPDATE users SET name = ? WHERE id = ?',
            [name, req.user.userId]
        );

        res.status(200).json({
            message: 'Profile updated successfully',
            user: { id: req.user.userId, name, email: req.user.email }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
};

// ─── UPDATE PASSWORD ──────────────────────────────────────────────────────────
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await queryOne('SELECT password_hash FROM users WHERE id = ?', [req.user.userId]);

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(newPassword, salt);

        await run(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [password_hash, req.user.userId]
        );

        res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ message: 'Server error during password update' });
    }
};

// ─── DELETE ACCOUNT ───────────────────────────────────────────────────────────
const deleteAccount = async (req, res) => {
    try {
        await run('DELETE FROM users WHERE id = ?', [req.user.userId]);

        // Clear the cookie
        res.cookie(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 });

        res.status(200).json({ message: 'Account deleted successfully' });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Server error during account deletion' });
    }
};

module.exports = {
    register,
    verifyEmail,
    login,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    updateProfile,
    updatePassword,
    deleteAccount,
    JWT_SECRET,
    COOKIE_NAME
};
