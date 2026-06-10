const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const ApiError = require('../utils/ApiError');

const verifyOTP = (email, otp, cache) => {
  const cached = cache.get(email.toLowerCase());
  if (!cached) throw new ApiError(400, 'No verification code sent');
  if (cached.expires < Date.now()) throw new ApiError(400, 'Code expired');
  if (cached.otp !== otp) throw new ApiError(400, 'Invalid verification code');
  cache.delete(email.toLowerCase());
};

const register = async (userData) => {
  const { firstName, lastName, email, password, phone, role } = userData;
  
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing.length) throw new ApiError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, 12);
  
  const [result] = await pool.query(
    'INSERT INTO users (firstName, lastName, email, phone, passwordHash, role, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
    [firstName, lastName, email.toLowerCase(), phone || null, passwordHash, role || 'user', 'active']
  );

  const userId = result.insertId;
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '8h' });

  return {
    user: { id: userId, firstName, lastName, email: email.toLowerCase(), role: role || 'user' },
    token
  };
};

const login = async (email, password) => {
  const [rows] = await pool.query(
    'SELECT id, firstName, lastName, email, passwordHash, role, status FROM users WHERE email = ?',
    [email.toLowerCase()]
  );
  
  if (!rows.length) throw new ApiError(401, 'Invalid credentials');
  
  const user = rows[0];
  if (user.status !== 'active') throw new ApiError(403, `Account ${user.status}`);

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '8h' });
  
  delete user.passwordHash;
  return { user, token };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const [rows] = await pool.query('SELECT passwordHash FROM users WHERE id = ?', [userId]);
  if (!rows.length) throw new ApiError(404, 'User not found');

  const isMatch = await bcrypt.compare(currentPassword, rows[0].passwordHash);
  if (!isMatch) throw new ApiError(401, 'Current password incorrect');

  const newHash = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET passwordHash = ?, updatedAt = NOW() WHERE id = ?', [
    newHash,
    userId
  ]);
};

module.exports = {
  register,
  login,
  changePassword,
  verifyOTP
};