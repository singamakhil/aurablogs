require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Initialize database (creates tables + seeds data)
const { initializeDatabase } = require('./db/database');


const authRoutes = require('./routes/auth.routes');
const blogRoutes = require('./routes/blog.routes');

const app = express();

// CORS — allow the frontend and pass cookies through  
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : 'http://localhost:5173';
app.use(cors({
    origin: frontendUrl,
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

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AuraBlogs API is running' });
});

// Test Email Endpoint (Temporary debug helper)
app.get('/api/auth/test-email', async (req, res) => {
    const { sendVerificationEmail } = require('./utils/email');
    try {
        console.log('🧪 Triggering test email...');
        const preview = await sendVerificationEmail(process.env.SMTP_USER || 'test@example.com', 'Test User', 'test-token');
        res.json({ message: 'Test email triggered', preview });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        console.log('🔄 Initializing database...');
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
}

startServer();
