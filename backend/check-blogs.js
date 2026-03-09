const { queryOne } = require('./src/db/database');

async function check() {
    const row = await queryOne('SELECT COUNT(*) as count FROM blogs');
    console.log('📊 Blog count:', row.count);
    process.exit(0);
}
check();
