CREATE DATABASE IF NOT EXISTS munihostelfinder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE munihostelfinder;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert test users (passwords are bcrypt hashed in real scenario)
-- For now using bcrypt: Student123 = $2a$12$... etc
INSERT IGNORE INTO users (firstName, lastName, email, phone, passwordHash, role, status, createdAt, updatedAt) VALUES
('John', 'Student', 'student@test.com', '+1234567890', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmGEJmentions', 'user', 'active', NOW(), NOW()),
('Jane', 'Admin', 'admin@test.com', '+1987654321', '$2a$12$R9h/cIPz0gi.URNN3kh2OPST9/PgBkqquzi8Ss7KIUgO2t0jWMUga', 'hostel_admin', 'active', NOW(), NOW()),
('Super', 'User', 'superadmin@test.com', '+1555555555', '$2a$12$81o6hJhO50E0/bNOeJIaGuMg.VNzJJpJGU7Y0Z/LdOJW9HwKj4k7C', 'super_admin', 'active', NOW(), NOW());
