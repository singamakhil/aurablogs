const { run } = require('./src/db/database');

async function resetBlogs() {
    try {
        await run('DELETE FROM blogs');
        console.log('🗑️ Blogs table cleared');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to clear blogs:', err);
        process.exit(1);
    }
}

resetBlogs();
