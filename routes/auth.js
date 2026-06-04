const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'firstName, lastName, email and password are required' });
  }

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing.length) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const role = 'user';
  const status = 'active';
  const [result] = await pool.query(
    'INSERT INTO users (firstName, lastName, email, phone, passwordHash, role, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
    [firstName, lastName, email.toLowerCase(), phone || null, passwordHash, role, status]
  );

  const userId = result.insertId;
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
  res.status(201).json({ user: { id: userId, firstName, lastName, email: email.toLowerCase(), role, status }, token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const [rows] = await pool.query('SELECT id, firstName, lastName, email, passwordHash, role, status, hostelAssigned FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!rows.length) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = rows[0];
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
  delete user.passwordHash;
  res.json({ user, token });
});

router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
