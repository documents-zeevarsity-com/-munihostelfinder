const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM hostels WHERE status = ? ORDER BY id DESC', ['active']);
  const hostels = rows.map(row => ({
    ...row,
    features: row.features ? JSON.parse(row.features) : {},
    photos: row.photos ? JSON.parse(row.photos) : []
  }));
  res.json({ hostels });
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM hostels WHERE id = ?', [req.params.id]);
  if (!rows.length) {
    return res.status(404).json({ error: 'Hostel not found' });
  }
  const hostel = rows[0];
  hostel.features = hostel.features ? JSON.parse(hostel.features) : {};
  hostel.photos = hostel.photos ? JSON.parse(hostel.photos) : [];
  res.json({ hostel });
});

router.post('/', authenticate, authorize(['super_admin', 'hostel_admin']), async (req, res) => {
  const { name, price, location, address, phone, email, capacity, description, features, image, status, photos } = req.body;
  if (!name || !price || !location || !address || !capacity) {
    return res.status(400).json({ error: 'Missing required hostel fields' });
  }

  // Validate photos - max 5
  const photoArray = Array.isArray(photos) ? photos.slice(0, 5) : [];

  const ownerId = req.user.role === 'hostel_admin' ? req.user.id : null;
  const featurePayload = features ? JSON.stringify(features) : JSON.stringify({});
  const photosPayload = photoArray.length > 0 ? JSON.stringify(photoArray) : JSON.stringify([]);

  const [result] = await pool.query(
    'INSERT INTO hostels (name, price, location, address, phone, email, capacity, description, features, image, photos, status, ownerId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
    [name, price, location, address, phone || null, email || null, capacity, description || null, featurePayload, image || null, photosPayload, status || 'active', ownerId]
  );

  res.status(201).json({ hostelId: result.insertId });
});

router.put('/:id', authenticate, authorize(['super_admin', 'hostel_admin']), async (req, res) => {
  const [hostelRows] = await pool.query('SELECT * FROM hostels WHERE id = ?', [req.params.id]);
  if (!hostelRows.length) {
    return res.status(404).json({ error: 'Hostel not found' });
  }

  const hostel = hostelRows[0];
  if (req.user.role === 'hostel_admin' && hostel.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const updates = [];
  const params = [];
  const allowed = ['name', 'price', 'location', 'address', 'phone', 'email', 'capacity', 'description', 'image', 'status'];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = ?`);
      params.push(req.body[key]);
    }
  });

  if (req.body.features) {
    updates.push('features = ?');
    params.push(JSON.stringify(req.body.features));
  }

  if (req.body.photos !== undefined) {
    const photoArray = Array.isArray(req.body.photos) ? req.body.photos.slice(0, 5) : [];
    updates.push('photos = ?');
    params.push(JSON.stringify(photoArray));
  }

  if (!updates.length) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  params.push(req.params.id);
  await pool.query(`UPDATE hostels SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`, params);
  res.json({ success: true });
});

router.delete('/:id', authenticate, authorize(['super_admin', 'hostel_admin']), async (req, res) => {
  const [hostelRows] = await pool.query('SELECT * FROM hostels WHERE id = ?', [req.params.id]);
  if (!hostelRows.length) {
    return res.status(404).json({ error: 'Hostel not found' });
  }
  const hostel = hostelRows[0];
  if (req.user.role === 'hostel_admin' && hostel.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await pool.query('DELETE FROM hostels WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
