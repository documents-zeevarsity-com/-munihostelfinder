const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../validation');
const { sendBookingEmail } = require('./mailer');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/bookings — role-filtered, with pagination
// Query params:
//   page    (default 1)
//   limit   (default 20, max 100)
// ---------------------------------------------------------------------------
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;

  let whereClause = '';
  const params = [];

  if (req.user.role === 'super_admin') {
    // No filter — all bookings
  } else if (req.user.role === 'hostel_admin') {
    const [hostelRows] = await pool.query('SELECT id FROM hostels WHERE ownerId = ?', [
      req.user.id,
    ]);
    const hostelIds = hostelRows.map((r) => r.id);
    if (!hostelIds.length) {
      return res.json({ bookings: [], pagination: { page, limit, total: 0, pages: 0 } });
    }
    whereClause = `WHERE hostelId IN (${hostelIds.map(() => '?').join(',')})`;
    params.push(...hostelIds);
  } else {
    whereClause = 'WHERE userId = ?';
    params.push(req.user.id);
  }

  // Count
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM bookings ${whereClause}`,
    params
  );

  // Fetch page
  const [rows] = await pool.query(
    `SELECT * FROM bookings ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    bookings: rows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}));

// ---------------------------------------------------------------------------
// POST /api/bookings — create booking (any authenticated user)
// ---------------------------------------------------------------------------
router.post('/', authenticate, validate(schemas.booking.create), async (req, res) => {
router.post('/', authenticate, validate(schemas.booking.create), asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { hostelId, checkIn, checkOut, amount } = req.body;

    await connection.beginTransaction();

    // 1. Get hostel details and lock the row for update to prevent race conditions
    const [hostelRows] = await connection.query(
      'SELECT id, name, capacity FROM hostels WHERE id = ? FOR UPDATE',
      [hostelId]
    );

    if (!hostelRows.length) {
      throw new ApiError(404, 'Hostel not found');
    }

    const hostel = hostelRows[0];

    // 2. Check current occupancy for the requested date range
    // Overlap logic: (StartA < EndB) AND (EndA > StartB)
    const [occupancyRows] = await connection.query(
      `SELECT COUNT(*) as currentOccupancy 
       FROM bookings 
       WHERE hostelId = ? 
       AND status != 'cancelled'
       AND checkIn < ? 
       AND checkOut > ?`,
      [hostelId, checkOut, checkIn]
    );

    const currentOccupancy = occupancyRows[0].currentOccupancy;

    if (currentOccupancy >= hostel.capacity) {
      throw new ApiError(409, 'Hostel is fully booked for the selected dates');
    }

    // 3. Create the booking
    const [result] = await connection.query(
      `INSERT INTO bookings (userId, hostelId, hostelName, checkIn, checkOut, amount, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [req.user.id, hostelId, hostel.name, checkIn, checkOut, amount]
    );

    await connection.commit();

    // Send notification email
    sendBookingEmail(req.user.email, {
      hostelName: hostel.name,
      checkIn: checkIn,
      amount: amount
    }).catch(err => console.error('Booking Notification Email Error:', err));

    res.status(201).json({ bookingId: result.insertId });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}));

// ---------------------------------------------------------------------------
// PUT /api/bookings/:id/status — update status (admin)
// ---------------------------------------------------------------------------
router.put(
  '/:id/status',
  authenticate,
  authorize(['super_admin', 'hostel_admin']),
  validate(schemas.booking.updateStatus),
  asyncHandler(async (req, res) => {
    const [bookingRows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [
      req.params.id,
    ]);
    if (!bookingRows.length) {
      throw new ApiError(404, 'Booking not found');
    }

    // hostel_admin can only update bookings for their own hostels
    if (req.user.role === 'hostel_admin') {
      const [hostelRows] = await pool.query('SELECT ownerId FROM hostels WHERE id = ?', [
        bookingRows[0].hostelId,
      ]);
      if (!hostelRows.length || hostelRows[0].ownerId !== req.user.id) {
        throw new ApiError(403, 'Forbidden');
      }
    }

    await pool.query('UPDATE bookings SET status = ?, updatedAt = NOW() WHERE id = ?', [
      req.body.status,
      req.params.id,
    ]);

    res.json({ success: true });
  })
);

module.exports = router;
