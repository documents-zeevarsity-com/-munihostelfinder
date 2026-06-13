const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testUsers = [
  { firstName: 'John', lastName: 'Student', email: 'student@test.com', password: 'Student123', role: 'user' },
  { firstName: 'Jane', lastName: 'Admin', email: 'admin@test.com', password: 'Admin123', role: 'hostel_admin' },
  { firstName: 'Bob', lastName: 'SuperAdmin', email: 'superadmin@test.com', password: 'SuperAdmin123', role: 'super_admin' }
];

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    console.log('Creating database...');
    await connection.query('CREATE DATABASE IF NOT EXISTS munihostelfinder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    
    console.log('Switching to database...');
    await connection.query('USE munihostelfinder');
    
    console.log('Creating users table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        firstName VARCHAR(128) NOT NULL,
        lastName VARCHAR(128) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(64) DEFAULT NULL,
        passwordHash VARCHAR(255) NOT NULL,
        role ENUM('user','hostel_admin','super_admin') NOT NULL DEFAULT 'user',
        status ENUM('active','pending','disabled') NOT NULL DEFAULT 'active',
        hostelAssigned INT UNSIGNED DEFAULT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    console.log('Creating hostels table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hostels (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        price VARCHAR(64) NOT NULL,
        location VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        phone VARCHAR(64) DEFAULT NULL,
        email VARCHAR(255) DEFAULT NULL,
        capacity INT UNSIGNED NOT NULL,
        description TEXT DEFAULT NULL,
        features JSON DEFAULT NULL,
        image VARCHAR(1024) DEFAULT NULL,
        photos JSON DEFAULT NULL,
        status ENUM('active','pending','inactive') NOT NULL DEFAULT 'active',
        ownerId INT UNSIGNED DEFAULT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        PRIMARY KEY (id),
        INDEX idx_ownerId (ownerId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    console.log('Creating bookings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        userId INT UNSIGNED NOT NULL,
        hostelId INT UNSIGNED NOT NULL,
        hostelName VARCHAR(255) NOT NULL,
        checkIn DATE NOT NULL,
        checkOut DATE NOT NULL,
        amount VARCHAR(128) NOT NULL,
        status ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        PRIMARY KEY (id),
        INDEX idx_userId (userId),
        INDEX idx_hostelId (hostelId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('Creating test users...');
    for (const user of testUsers) {
      const passwordHash = await bcrypt.hash(user.password, 12);
      try {
        await connection.query(
          'INSERT INTO users (firstName, lastName, email, passwordHash, role, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [user.firstName, user.lastName, user.email, passwordHash, user.role, 'active']
        );
        console.log(`✓ Created user: ${user.email} (${user.role})`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⊘ User already exists: ${user.email}`);
        } else {
          throw err;
        }
      }
    }

    console.log('\n✓ Database setup complete!');
    console.log('\nTest Credentials:');
    console.log('┌─────────────────┬─────────────────────┬─────────────────┐');
    console.log('│ Role            │ Email               │ Password        │');
    console.log('├─────────────────┼─────────────────────┼─────────────────┤');
    testUsers.forEach(u => {
      console.log(`│ ${u.role.padEnd(15)} │ ${u.email.padEnd(19)} │ ${u.password.padEnd(15)} │`);
    });
    console.log('└─────────────────┴─────────────────────┴─────────────────┘');

  } catch (error) {
    console.error('Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setupDatabase();
