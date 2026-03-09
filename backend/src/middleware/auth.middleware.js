const jwt = require('jsonwebtoken');
const { JWT_SECRET, COOKIE_NAME } = require('../controllers/auth.controller');

const protect = (req, res, next) => {
    // Read JWT from the HTTP-only cookie (not from the Authorization header)
    const token = req.cookies[COOKIE_NAME];

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated. Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { userId, email, iat, exp }
        next();
    } catch (error) {
        // Handle specific JWT errors with clear messages
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired. Please log in again.' });
        }
        return res.status(401).json({ message: 'Invalid session. Please log in.' });
    }
};

module.exports = { protect };
