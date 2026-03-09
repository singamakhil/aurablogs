const express = require('express');
const { getBlogs, getFreeBlogById, getPremiumBlogById } = require('../controllers/blog.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of blogs returned
 */
router.get('/', getBlogs);                          // Public — list (no full content for premium)

/**
 * @swagger
 * /api/blogs/free/{id}:
 *   get:
 *     summary: Get free blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Blog content returned
 *       404:
 *         description: Blog not found
 */
router.get('/free/:id', getFreeBlogById);           // Public — full free article

/**
 * @swagger
 * /api/blogs/premium/{id}:
 *   get:
 *     summary: Get premium blog by ID
 *     tags: [Blogs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Premium blog content returned
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog not found
 */
router.get('/premium/:id', protect, getPremiumBlogById); // Protected — full premium article


module.exports = router;
