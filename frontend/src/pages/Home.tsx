import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import {
    Calendar,
    Clock,
    Tag,
    Lock,
    Unlock,
    ArrowRight,
    Sparkles,
    X
} from 'lucide-react';
import './Home.css';

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    type: 'free' | 'premium';
    category: string;
    reading_time: number;
    date: string;
    content?: string;
}

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = useMemo(() => {
        const cats = ['All', ...new Set(blogs.map(b => b.category))];
        return cats;
    }, [blogs]);

    const filteredBlogs = useMemo(() => {
        if (activeCategory === 'All') return blogs;
        return blogs.filter(b => b.category === activeCategory);
    }, [blogs, activeCategory]);

    // Fetch blog list from backend
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const res = await fetch(`${apiUrl}/api/blogs`);
                const data = await res.json();
                setBlogs(data);
            } catch (err) {
                console.error('Failed to load blogs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    const handleReadClick = async (e: React.MouseEvent, blog: BlogPost) => {
        e.preventDefault();

        if (blog.type === 'premium' && !isAuthenticated) {
            navigate('/login');
            return;
        }

        // Fetch the full article
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const endpoint = blog.type === 'premium'
            ? `${apiUrl}/api/blogs/premium/${blog.id}`
            : `${apiUrl}/api/blogs/free/${blog.id}`;

        try {
            const res = await fetch(endpoint, { credentials: 'include' });

            if (res.status === 401) {
                navigate('/login');
                return;
            }
            const data = await res.json();
            setSelectedBlog(data);
        } catch (err) {
            console.error('Failed to load article:', err);
        }
    };

    return (
        <div className="home-container">
            <Header />

            {/* Full Article Modal */}
            {selectedBlog && (
                <div className="article-overlay" onClick={() => setSelectedBlog(null)}>
                    <div className="article-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedBlog(null)}>
                            <X size={24} />
                        </button>
                        <div className="modal-badge-row">
                            <span className={`badge ${selectedBlog.type}`}>
                                {selectedBlog.type === 'premium' ? <Sparkles size={12} className="premium-sparkle" /> : null}
                                {selectedBlog.type === 'premium' ? 'Premium' : 'Free Access'}
                            </span>
                            <span className="blog-meta-item">
                                <Calendar size={14} />
                                {selectedBlog.date}
                            </span>
                        </div>
                        <h1 className="modal-title">{selectedBlog.title}</h1>
                        <p className="modal-content">{selectedBlog.content}</p>
                    </div>
                </div>
            )}

            <main className="content-wrapper">
                <section className="hero-section">
                    <div className="hero-badge">
                        <Sparkles size={14} />
                        <span>Discover the new era of content</span>
                    </div>
                    <h1 className="text-gradient">
                        Engineering Insights<br />
                        <span className="text-gradient-primary">For the Modern Web</span>
                    </h1>
                    <p className="hero-subtitle">
                        Elevate your frontend skills with cutting-edge tutorials, architectural teardowns, and deep dives into modern tooling.
                    </p>
                </section>

                <section className="feed-section">
                    <div className="section-header">
                        <div className="header-tabs">
                            <h2 className="section-title">Latest Publications</h2>
                            <div className="category-filters">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {loading || authLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <span>Scanning archives...</span>
                        </div>
                    ) : (
                        <div className="blogs-grid">
                            {filteredBlogs.map((blog) => (
                                <article key={blog.id} className="blog-card">
                                    <div className="blog-card-header">
                                        <div className="card-top-meta">
                                            <span className="category-tag">
                                                <Tag size={12} />
                                                {blog.category}
                                            </span>
                                            <span className={`badge ${blog.type}`}>
                                                {blog.type === 'premium' ? <Sparkles size={10} /> : null}
                                                {blog.type}
                                            </span>
                                        </div>
                                        <h2 className="blog-card-title">{blog.title}</h2>
                                        <p className="blog-card-excerpt">{blog.excerpt}</p>
                                    </div>

                                    <div className="blog-card-footer">
                                        <div className="footer-meta">
                                            <span className="blog-meta-item">
                                                <Calendar size={14} />
                                                {blog.date}
                                            </span>
                                            <span className="blog-meta-item">
                                                <Clock size={14} />
                                                {blog.reading_time} min
                                            </span>
                                        </div>
                                        <a
                                            href="#!"
                                            className={`read-btn ${blog.type} ${blog.type === 'premium' && !isAuthenticated
                                                ? 'premium-lock'
                                                : blog.type === 'premium' && isAuthenticated
                                                    ? 'premium-unlocked'
                                                    : ''
                                                }`}
                                            onClick={(e) => handleReadClick(e, blog)}
                                        >
                                            <span className="btn-text">
                                                {blog.type === 'premium' && !isAuthenticated
                                                    ? 'Login to Read'
                                                    : 'Read Article'}
                                            </span>
                                            <div className="btn-icon">
                                                {blog.type === 'premium' && !isAuthenticated ? (
                                                    <Lock size={16} />
                                                ) : blog.type === 'premium' && isAuthenticated ? (
                                                    <Unlock size={16} />
                                                ) : (
                                                    <ArrowRight size={16} />
                                                )}
                                            </div>
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Home;
