const { query, queryOne } = require('../db/database');

// GET /api/blogs — Public
// Returns all blogs but strips full content from premium posts
const getBlogs = async (req, res) => {
    try {
        const blogs = await query('SELECT id, title, excerpt, type, category, reading_time, date FROM blogs ORDER BY id ASC');
        res.status(200).json(blogs);
    } catch (error) {
        console.error('getBlogs error:', error);
        res.status(500).json({ message: 'Error fetching blogs' });
    }
};

// GET /api/blogs/free/:id — Public
const getFreeBlogById = async (req, res) => {
    try {
        const blog = await queryOne(
            'SELECT * FROM blogs WHERE id = ? AND type = ?',
            [req.params.id, 'free']
        );
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blog' });
    }
};

// GET /api/blogs/premium/:id — Protected (requires auth middleware)
const getPremiumBlogById = async (req, res) => {
    try {
        const blog = await queryOne(
            'SELECT * FROM blogs WHERE id = ? AND type = ?',
            [req.params.id, 'premium']
        );
        if (!blog) {
            return res.status(404).json({ message: 'Premium article not found' });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching premium blog' });
    }
};

module.exports = { getBlogs, getFreeBlogById, getPremiumBlogById };
