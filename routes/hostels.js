const express = require('express');
const Joi = require('joi');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../validation');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const hostelService = require('../services/hostelService');

const router = express.Router();

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Helper: parse hostel row (JSON columns)
// ---------------------------------------------------------------------------
function parseHostel(row) {
  if (!row) return null;
  return {
    ...row,
    features: row.features ? (typeof row.features === 'string' ? JSON.parse(row.features) : row.features) : {},
    photos: row.photos ? (typeof row.photos === 'string' ? JSON.parse(row.photos) : row.photos) : [],
  };
}

// ---------------------------------------------------------------------------
// GET /api/hostels — public, with pagination & search/filter
// Query params:
//   page, limit, location, minPrice, maxPrice, wifi
// ---------------------------------------------------------------------------
router.get('/', validate(schemas.hostel.search, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, location, minPrice, maxPrice, wifi } = req.query;
  const offset = (page - 1) * limit;

  const where = [];
  const params = [];

  // Default: Public only sees active hostels
  where.push('status = ?');
  params.push('active');

  // Generic Search (name, location, address)
  if (req.query.search) {
    const searchTerm = `%${req.query.search.trim()}%`;
    where.push('(name LIKE ? OR location LIKE ? OR address LIKE ?)');
    params.push(searchTerm, searchTerm, searchTerm);
  }

  // Filter by Location
  if (location) {
    where.push('location LIKE ?');
    params.push(`%${location}%`);
  }

  // Price range filters
  if (minPrice !== undefined) {
    where.push('CAST(price AS UNSIGNED) >= ?');
    params.push(minPrice);
  }
  if (maxPrice !== undefined) {
    where.push('CAST(price AS UNSIGNED) <= ?');
    params.push(maxPrice);
  }

  // Amenities filter (MySQL JSON search)
  if (wifi !== undefined) {
    where.push("JSON_EXTRACT(features, '$.wifi') = ?");
    params.push(wifi);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Count total
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(id) as total FROM hostels ${whereClause}`,
    params
  );

  // Fetch page
  const [rows] = await pool.query(
    `SELECT * FROM hostels ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), parseInt(offset)]
  );

  const hostels = rows.map(parseHostel);

  res.json({
    hostels,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}));

// ---------------------------------------------------------------------------
// GET /api/hostels/:id — public
// ---------------------------------------------------------------------------
router.get('/:id', asyncHandler(async (req, res) => {
  const hostel = await hostelService.getHostelById(req.params.id);
  res.json({ hostel: parseHostel(hostel) });
}));

// ---------------------------------------------------------------------------
// POST /api/hostels — create (admin)
// ---------------------------------------------------------------------------
router.post(
  '/',
  authenticate,
  authorize(['super_admin', 'hostel_admin']),
  validate(schemas.hostel.create),
  asyncHandler(async (req, res) => {
    const ownerId = req.user.role === 'hostel_admin' ? req.user.id : null;
    const result = await hostelService.createHostel(req.body, ownerId);
    res.status(201).json(result);
  })
);

// ---------------------------------------------------------------------------
// PUT /api/hostels/:id — update (admin)
// ---------------------------------------------------------------------------
router.put(
  '/:id',
  authenticate,
  authorize(['super_admin', 'hostel_admin']),
  validate(schemas.hostel.update),
  asyncHandler(async (req, res) => {
    const [hostelRows] = await pool.query('SELECT * FROM hostels WHERE id = ?', [req.params.id]);
    if (!hostelRows.length) {
      throw new ApiError(404, 'Hostel not found');
    }

    const hostel = hostelRows[0];
    if (req.user.role === 'hostel_admin' && hostel.ownerId !== req.user.id) {
      throw new ApiError(403, 'Forbidden');
    }

    const updates = [];
    const params = [];
    const scalars = [
      'name', 'price', 'location', 'address', 'phone', 'email',
      'capacity', 'description', 'image', 'status',
    ];

    scalars.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(req.body[key]);
      }
    });

    if (req.body.features !== undefined) {
      updates.push('features = ?');
      params.push(JSON.stringify(req.body.features));
    }

    if (req.body.photos !== undefined) {
      updates.push('photos = ?');
      params.push(JSON.stringify(req.body.photos));
    }

    if (!updates.length) {
      throw new ApiError(400, 'No fields to update');
    }

    params.push(req.params.id);
    await pool.query(
      `UPDATE hostels SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`,
      params
    );

    res.json({ success: true });
  })
);

// ---------------------------------------------------------------------------
// DELETE /api/hostels/:id — delete (admin)
// ---------------------------------------------------------------------------
router.delete(
  '/:id',
  authenticate,
  authorize(['super_admin', 'hostel_admin']),
  asyncHandler(async (req, res) => {
    const [hostelRows] = await pool.query('SELECT * FROM hostels WHERE id = ?', [req.params.id]);
    if (!hostelRows.length) {
      throw new ApiError(404, 'Hostel not found');
    }

    const hostel = hostelRows[0];
    if (req.user.role === 'hostel_admin' && hostel.ownerId !== req.user.id) {
      throw new ApiError(403, 'Forbidden');
    }

    // Soft delete: keep the record but set status to inactive
    await pool.query('UPDATE hostels SET status = "inactive", updatedAt = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  })
);

module.exports = router;
