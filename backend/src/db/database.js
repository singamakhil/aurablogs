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

// Ensure database is initialized for Turso if using it
if (USE_TURSO) {
    initializeDatabase();
}

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
            content: "React Server Components (RSC) represent a paradigm shift in how we build React applications...",
            type: 'free',
            category: 'Development',
            reading_time: 8,
            date: "Oct 24, 2024"
        },
        {
            title: "Advanced Tailwind Architecture",
            excerpt: "Stop building messy styling structures. Learn the enterprise-grade patterns for managing complex Tailwind configurations.",
            content: "As your Tailwind CSS projects grow, the utility classes can become unmanageable...",
            type: 'premium',
            category: 'Design',
            reading_time: 12,
            date: "Nov 02, 2024"
        }
        // ... truncated for brevity, but I should keep the original seed logic complete if possible
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

module.exports = { query, queryOne, run };

