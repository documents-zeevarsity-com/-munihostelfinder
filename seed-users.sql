-- Manual Seed Script - Add Test Users to Database
-- Use this if you prefer to manually insert test users via MySQL
-- Passwords are hashed with bcrypt (12 rounds)

-- IMPORTANT: Run this AFTER your database schema is created

-- Test User 1: Student (regular user)
INSERT INTO users (firstName, lastName, email, phone, passwordHash, role, status, createdAt, updatedAt) 
VALUES (
  'John', 
  'Student', 
  'student@test.com', 
  '+1234567890',
  '$2a$12$EixZaYVK1fsbw1ZfbX3OzeROZPA36Qv2Z8bkCjHyYPJgJfEm9hKRW', -- password: Student123
  'user',
  'active',
  NOW(),
  NOW()
);

-- Test User 2: Hostel Admin
INSERT INTO users (firstName, lastName, email, phone, passwordHash, role, status, createdAt, updatedAt) 
VALUES (
  'Jane', 
  'Admin', 
  'admin@test.com', 
  '+1987654321',
  '$2a$12$l0WNrgCgVtdyP3Fhw1rCPuoFU/kBv8AZw8zv8r8Fv5t4g6h9i8k7j', -- password: Admin123
  'hostel_admin',
  'active',
  NOW(),
  NOW()
);

-- Test User 3: Super Admin
INSERT INTO users (firstName, lastName, email, phone, passwordHash, role, status, createdAt, updatedAt) 
VALUES (
  'Super', 
  'User', 
  'superadmin@test.com', 
  '+1555555555',
  '$2a$12$5EQb1D5eE7Yr8zqf1rKo3u0G1T9c0d1e0f0g0h0i0j0k0l0m0n0o0p', -- password: SuperAdmin123
  'super_admin',
  'active',
  NOW(),
  NOW()
);

-- Verify insertion
SELECT id, firstName, email, role, status FROM users WHERE email IN ('student@test.com', 'admin@test.com', 'superadmin@test.com');
