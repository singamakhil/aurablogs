require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Initialize database (creates tables + seeds data)
require('./db/database');

const authRoutes = require('./routes/auth.routes');
const blogRoutes = require('./routes/blog.routes');

const app = express();

// CORS — allow the frontend and pass cookies through  
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true               // Allow cookies to be sent cross-origin
}));

app.use(express.json());
app.use(cookieParser()); // Parse cookie headers on incoming requests

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Setup Swagger Docs
const setupSwagger = require('./utils/swagger');
setupSwagger(app);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AuraBlogs API is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});