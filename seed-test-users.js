/**
 * Seed Test Users Script
 * Creates 3 test accounts: Student, Hostel Admin, and Super Admin
 * 
 * Usage: node seed-test-users.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

const TEST_USERS = [
  {
    firstName: 'John',
    lastName: 'Student',
    email: 'student@test.com',
    password: 'Student123',
    phone: '+1234567890',
    role: 'user',
    status: 'active'
  },
  {
    firstName: 'Jane',
    lastName: 'Admin',
    email: 'admin@test.com',
    password: 'Admin123',
    phone: '+1987654321',
    role: 'hostel_admin',
    status: 'active'
  },
  {
    firstName: 'Super',
    lastName: 'User',
    email: 'superadmin@test.com',
    password: 'SuperAdmin123',
    phone: '+1555555555',
    role: 'super_admin',
    status: 'active'
  }
];

async function seedUsers() {
  try {
    console.log('🌱 Starting to seed test users...\n');

    for (const userData of TEST_USERS) {
      try {
        // Check if user already exists
        const [existing] = await pool.query(
          'SELECT id FROM users WHERE email = ?',
          [userData.email.toLowerCase()]
        );

        if (existing.length > 0) {
          console.log(`⏭️  User "${userData.email}" already exists, skipping...`);
          continue;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(userData.password, 12);

        // Insert user
        const [result] = await pool.query(
          'INSERT INTO users (firstName, lastName, email, phone, passwordHash, role, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [
            userData.firstName,
            userData.lastName,
            userData.email.toLowerCase(),
            userData.phone,
            passwordHash,
            userData.role,
            userData.status
          ]
        );

        console.log(`✅ Created ${userData.role.toUpperCase()}: ${userData.email}`);
        console.log(`   Password: ${userData.password}\n`);
      } catch (err) {
        console.error(`❌ Error creating user ${userData.email}:`, err.message);
      }
    }

    console.log('\n📋 Test Users Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    TEST_USERS.forEach(user => {
      console.log(`Role: ${user.role.padEnd(15)} | Email: ${user.email.padEnd(25)} | Password: ${user.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✨ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

seedUsers();
