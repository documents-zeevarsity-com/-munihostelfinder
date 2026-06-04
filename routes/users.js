const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize(['super_admin']), async (req, res) => {
  const [rows] = await pool.query('SELECT id, firstName, lastName, email, phone, role, status, hostelAssigned, createdAt, updatedAt FROM users ORDER BY createdAt DESC');
  res.json({ users: rows });
});

router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
