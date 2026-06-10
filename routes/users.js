const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../validation');
const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/userService');

const router = express.Router();

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(128).optional(),
  lastName: Joi.string().trim().min(1).max(128).optional(),
  phone: Joi.string().trim().max(64).allow('', null).optional(),
}).min(1); // at least one field required

// ---------------------------------------------------------------------------
// GET /api/users — admin only, list all users
// ---------------------------------------------------------------------------
router.get('/', authenticate, authorize(['super_admin']), asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await userService.getAllUsers(page, limit);
  res.json(result);
}));

// ---------------------------------------------------------------------------
// GET /api/users/me — current user profile
// ---------------------------------------------------------------------------
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// ---------------------------------------------------------------------------
// PUT /api/users/me — update current user profile
// ---------------------------------------------------------------------------
router.put(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const updates = [];
      const params = [];

      if (req.body.firstName !== undefined) {
        updates.push('firstName = ?');
        params.push(req.body.firstName);
      }
      if (req.body.lastName !== undefined) {
        updates.push('lastName = ?');
        params.push(req.body.lastName);
      }
      if (req.body.phone !== undefined) {
        updates.push('phone = ?');
        params.push(req.body.phone);
      }

      if (!updates.length) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      params.push(userId);
      await pool.query(
        `UPDATE users SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`,
        params
      );

      // Return updated user
      const [rows] = await pool.query(
        'SELECT id, firstName, lastName, email, phone, role, status, hostelAssigned, createdAt, updatedAt FROM users WHERE id = ?',
        [userId]
      );

      res.json({ user: rows[0] });
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: 'Profile update failed' });
    }
  }
);

module.exports = router;
