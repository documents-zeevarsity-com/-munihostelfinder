const express = require('express');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../validation');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const authService = require('../services/authService');
const { sendOTPEmail } = require('./mailer');

const router = express.Router();

// Temporary store for OTPs (In production, use Redis or a DB table with expiry)
const otpCache = new Map();

// ---------------------------------------------------------------------------
// POST /api/auth/send-otp
// ---------------------------------------------------------------------------
router.post('/send-otp', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email is required');

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with 10-minute expiry
  otpCache.set(email.toLowerCase(), { otp, expires: Date.now() + 600000 });

  await sendOTPEmail(email, otp);

  res.json({ success: true, message: 'OTP sent successfully' });
}));

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
router.post('/register', validate(schemas.auth.register), asyncHandler(async (req, res) => {
  // Enforce OTP for hostel_admin
  if (req.body.role === 'hostel_admin') {
    if (!req.body.otp) throw new ApiError(400, 'OTP is required for hostel registration');
    authService.verifyOTP(req.body.email, req.body.otp, otpCache);
  }

  const result = await authService.register(req.body);
  res.status(201).json(result);
}));

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', validate(schemas.auth.login), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
}));

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// ---------------------------------------------------------------------------
// PUT /api/auth/password — change password
// ---------------------------------------------------------------------------
router.put(
  '/password',
  authenticate,
  validate(schemas.auth.changePassword),
  asyncHandler(async (req, res) => {
    await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    res.json({ success: true, message: 'Password changed' });
  })
);

module.exports = router;
