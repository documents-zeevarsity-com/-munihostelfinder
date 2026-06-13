const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'munihostelfinder'
    });

    console.log('Connected to database. Seeding users...');

    const testUsers = [
        {
            firstName: 'John',
            lastName: 'Student',
            email: 'student@test.com',
            phone: '256700000001',
            password: 'Student123',
            role: 'user'
        },
        {
            firstName: 'Hostel',
            lastName: 'Manager',
            email: 'admin@test.com',
            phone: '256700000002',
            password: 'Admin123',
            role: 'hostel_admin'
        },
        {
            firstName: 'Super',
            lastName: 'Admin',
            email: 'superadmin@test.com',
            phone: '256700000003',
            password: 'SuperAdmin123',
            role: 'super_admin'
        }
    ];

    try {
        for (const user of testUsers) {
            const passwordHash = await bcrypt.hash(user.password, 12);
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

            const [rows] = await connection.execute(
                'SELECT id FROM users WHERE email = ?',
                [user.email]
            );

            if (rows.length === 0) {
                await connection.execute(
                    `INSERT INTO users (firstName, lastName, email, phone, passwordHash, role, status, createdAt, updatedAt) 
                     VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
                    [user.firstName, user.lastName, user.email, user.phone, passwordHash, user.role, now, now]
                );
                console.log(`✅ Created user: ${user.email}`);
            } else {
                console.log(`ℹ️ User ${user.email} already exists, skipping.`);
            }
        }
        console.log('Seed completed successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await connection.end();
    }
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});