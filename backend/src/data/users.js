// In-memory mock database for users
const users = [
    // Pre-seed an admin user for testing
    // password is 'password123'
    {
        id: 1,
        email: 'admin@aurablogs.com',
        passwordHash: '$2a$10$XmY/.../L...' // We'll let registration handle proper hashes
    }
];

// Helper to find highest ID
const getNextId = () => {
    return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
};

module.exports = {
    users,
    getNextId
};
