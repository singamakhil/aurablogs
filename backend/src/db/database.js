const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@libsql/client');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../aurablogs.db');
const USE_TURSO = process.env.TURSO_DB_URL && process.env.TURSO_DB_AUTH_TOKEN;

let db;
let client;

if (USE_TURSO) {
    console.log('☁️ Connecting to Turso (LibSQL)...');
    client = createClient({
        url: process.env.TURSO_DB_URL,
        authToken: process.env.TURSO_DB_AUTH_TOKEN,
    });
    // For LibSQL, we don't need a callback like sqlite3, but we should verify connection
} else {
    console.log('💾 Connecting to local SQLite database...');
    db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('❌ Error connecting to database:', err.message);
        } else {
            console.log('✅ Connected to local SQLite database');
            initializeDatabase();
        }
    });
}

// initialization is now handled by the caller (server.js)


async function initializeDatabase() {
    const schemas = [
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_verified INTEGER NOT NULL DEFAULT 0,
            verify_token TEXT,
            reset_token TEXT,
            reset_token_expires INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS blogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            excerpt TEXT NOT NULL,
            content TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'free',
            category TEXT NOT NULL DEFAULT 'General',
            reading_time INTEGER NOT NULL DEFAULT 5,
            date TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    ];

    try {
        for (const sql of schemas) {
            await run(sql);
        }

        // Migrations (handling errors if columns exist)
        const migrations = [
            "ALTER TABLE users ADD COLUMN is_verified INTEGER NOT NULL DEFAULT 0",
            "ALTER TABLE users ADD COLUMN verify_token TEXT",
            "ALTER TABLE users ADD COLUMN reset_token TEXT",
            "ALTER TABLE users ADD COLUMN reset_token_expires INTEGER",
            "ALTER TABLE blogs ADD COLUMN category TEXT NOT NULL DEFAULT 'General'",
            "ALTER TABLE blogs ADD COLUMN reading_time INTEGER NOT NULL DEFAULT 5"
        ];

        for (const sql of migrations) {
            try {
                await run(sql);
            } catch (err) {
                // Ignore duplicate column errors
                if (!err.message.includes('duplicate column')) {
                    console.error('Migration error:', err.message);
                }
            }
        }

        // Seed if empty
        const countRes = await queryOne('SELECT COUNT(*) as count FROM blogs');
        if (countRes.count === 0) {
            await seedBlogs();
        }
    } catch (err) {
        console.error('Database initialization failed:', err);
    }
}

async function seedBlogs() {
    const blogs = [
        {
            title: "Mastering React Server Components",
            excerpt: "Discover how to leverage RSCs for optimal performance and seamless data fetching in your next big application.",
            content: "React Server Components (RSC) represent a paradigm shift in how we build React applications. By rendering components exclusively on the server, we can significantly reduce the amount of JavaScript sent to the client — leading to faster Time to Interactive (TTI) and better SEO. This architecture allows developers to think about data fetching in a much more collocated way, fetching data directly inside the components that need it without the waterfall effects typical of client-side-only apps.",
            type: 'free',
            category: 'Development',
            reading_time: 8,
            date: "Oct 24, 2024"
        },
        {
            title: "Advanced Tailwind Architecture",
            excerpt: "Stop building messy styling structures. Learn the enterprise-grade patterns for managing complex Tailwind configurations.",
            content: "As your Tailwind CSS projects grow, the utility classes can become unmanageable. To solve this, enterprise teams use the CVA (Class Variance Authority) pattern combined with tailwind-merge to safely construct component APIs without style conflicts. This approach ensures that your design system remains consistent while allowing for the flexibility that utility-first CSS provides. In this deep dive, we explore how to build a robust design system that your entire team can rely on.",
            type: 'premium',
            category: 'Design',
            reading_time: 12,
            date: "Nov 02, 2024"
        },
        {
            title: "The Ultimate Guide to Turbopack",
            excerpt: "Speed up your build times by 10x. A comprehensive deep dive into the Rust-based bundler replacing Webpack.",
            content: "Turbopack is the successor to Webpack, rewritten from the ground up in Rust. It utilizes Incremental Computation to cache every function result, ensuring that your development server scales effortlessly regardless of how large your application gets. By leveraging a more efficient engine, Turbopack can handle massive codebases that would bring traditional bundlers to their knees. We look at the architectural decisions that make this performance possible.",
            type: 'free',
            category: 'Development',
            reading_time: 10,
            date: "Dec 15, 2024"
        },
        {
            title: "Security in the Age of Generative AI",
            excerpt: "How to protect your codebase from AI-generated vulnerabilities and stay ahead of automated exploit tools.",
            content: "Generative AI is a double-edged sword for developers. While it boosts productivity, it can also introduce subtle security flaws if not used carefully. From prompt injection to insecure code suggestions, the threat landscape is evolving rapidly. This article covers the essential security protocols every modern developer needs to implement when integrating AI tools into their daily workflow to ensure their production environments remain compromise-free.",
            type: 'premium',
            category: 'Security',
            reading_time: 15,
            date: "Jan 12, 2025"
        },
        {
            title: "Designing Intuitive User Journeys",
            excerpt: "Beyond pixels: how to craft experiences that users love using psychology and data-driven design patterns.",
            content: "Great design isn't just about how things look; it's about how they work in the context of the user's mind. By understanding cognitive load and behavioral psychology, designers can create paths through applications that feel natural and effortless. We analyze successful UI patterns from top-tier apps and explain why they work, giving you actionable insights for your next product launch.",
            type: 'free',
            category: 'UX/UI',
            reading_time: 7,
            date: "Feb 05, 2025"
        },
        {
            title: "Building Micro-frontends with Vite",
            excerpt: "Scaling frontend applications across multiple teams? Learn how Module Federation in Vite makes it seamless.",
            content: "Module Federation allows you to dynamically load code from another application at runtime. With the @originjs/vite-plugin-federation plugin, Vite users can now share dependencies and components seamlessly without having to use Webpack. This architecture is perfect for large organizations where independent squads need to ship features into a single shell application without being tethered to a monolithic build cycle.",
            type: 'premium',
            category: 'Development',
            reading_time: 14,
            date: "Feb 22, 2025"
        }

    ];

    console.log('🌱 Seeding database...');
    for (const b of blogs) {
        await run(
            'INSERT INTO blogs (title, excerpt, content, type, category, reading_time, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [b.title, b.excerpt, b.content, b.type, b.category, b.reading_time, b.date]
        );
    }
    console.log('✅ Blog data seeded');
}

// Unified query helpers
const query = async (sql, params = []) => {
    if (USE_TURSO) {
        const res = await client.execute({ sql, args: params });
        return res.rows;
    } else {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

const queryOne = async (sql, params = []) => {
    if (USE_TURSO) {
        const res = await client.execute({ sql, args: params });
        return res.rows[0];
    } else {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
};

const run = async (sql, params = []) => {
    if (USE_TURSO) {
        const res = await client.execute({ sql, args: params });
        return { lastID: res.lastInsertRowid, changes: res.rowsAffected };
    } else {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }
};

module.exports = { query, queryOne, run, initializeDatabase };


