const pool = require('../db');
const ApiError = require('../utils/ApiError');
const { sendBookingEmail } = require('../routes/mailer');

const createBooking = async (userId, userEmail, bookingData) => {
  const { hostelId, checkIn, checkOut, amount } = bookingData;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const [hostelRows] = await connection.query(
      'SELECT id, name, capacity FROM hostels WHERE id = ? FOR UPDATE',
      [hostelId]
    );

    if (!hostelRows.length) throw new ApiError(404, 'Hostel not found');
    const hostel = hostelRows[0];

    const [occupancy] = await connection.query(
      'SELECT COUNT(*) as count FROM bookings WHERE hostelId = ? AND status != "cancelled" AND checkIn < ? AND checkOut > ?',
      [hostelId, checkOut, checkIn]
    );

    if (occupancy[0].count >= hostel.capacity) {
      throw new ApiError(409, 'Hostel is fully booked for these dates');
    }

    const [result] = await connection.query(
      `INSERT INTO bookings (userId, hostelId, hostelName, checkIn, checkOut, amount, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [userId, hostelId, hostel.name, checkIn, checkOut, amount]
    );

    await connection.commit();

    sendBookingEmail(userEmail, {
      hostelName: hostel.name,
      checkIn,
      amount
    }).catch(err => console.error('Email failed:', err));

    return { bookingId: result.insertId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const updateStatus = async (bookingId, status, user) => {
  const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  if (!rows.length) throw new ApiError(404, 'Booking not found');

  if (user.role === 'hostel_admin') {
    const [hostel] = await pool.query('SELECT ownerId FROM hostels WHERE id = ?', [rows[0].hostelId]);
    if (!hostel.length || hostel[0].ownerId !== user.id) throw new ApiError(403, 'Forbidden');
  }

  await pool.query('UPDATE bookings SET status = ?, updatedAt = NOW() WHERE id = ?', [status, bookingId]);
};

module.exports = { createBooking, updateStatus };