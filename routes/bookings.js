const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  if (req.user.role === 'super_admin') {
    const [rows] = await pool.query('SELECT * FROM bookings ORDER BY createdAt DESC');
    return res.json({ bookings: rows });
  }

  if (req.user.role === 'hostel_admin') {
    const [hostelRows] = await pool.query('SELECT id FROM hostels WHERE ownerId = ?', [req.user.id]);
    const hostelIds = hostelRows.map(row => row.id);
    if (!hostelIds.length) {
      return res.json({ bookings: [] });
    }
    const [rows] = await pool.query('SELECT * FROM bookings WHERE hostelId IN (?) ORDER BY createdAt DESC', [hostelIds]);
    return res.json({ bookings: rows });
  }

  const [rows] = await pool.query('SELECT * FROM bookings WHERE userId = ? ORDER BY createdAt DESC', [req.user.id]);
  res.json({ bookings: rows });
});

router.post('/', authenticate, async (req, res) => {
  const { hostelId, checkIn, checkOut, amount } = req.body;
  if (!hostelId || !checkIn || !checkOut || !amount) {
    return res.status(400).json({ error: 'hostelId, checkIn, checkOut, and amount are required' });
  }

  const [hostelRows] = await pool.query('SELECT id, name FROM hostels WHERE id = ?', [hostelId]);
  if (!hostelRows.length) {
    return res.status(404).json({ error: 'Hostel not found' });
  }

  const [result] = await pool.query(
    'INSERT INTO bookings (userId, hostelId, hostelName, checkIn, checkOut, amount, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
    [req.user.id, hostelId, hostelRows[0].name, checkIn, checkOut, amount, 'pending']
  );

  res.status(201).json({ bookingId: result.insertId });
});

router.put('/:id/status', authenticate, authorize(['super_admin', 'hostel_admin']), async (req, res) => {
  const { status } = req.body;
  if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'status must be one of pending, confirmed, cancelled' });
  }

  const [bookingRows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
  if (!bookingRows.length) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (req.user.role === 'hostel_admin') {
    const [hostelRows] = await pool.query('SELECT ownerId FROM hostels WHERE id = ?', [bookingRows[0].hostelId]);
    if (!hostelRows.length || hostelRows[0].ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  await pool.query('UPDATE bookings SET status = ?, updatedAt = NOW() WHERE id = ?', [status, req.params.id]);
  res.json({ success: true });
});

module.exports = router;
