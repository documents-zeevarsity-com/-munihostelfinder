const pool = require('../db');
const ApiError = require('../utils/ApiError');

const getAllUsers = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  
  const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM users');
  
  const [rows] = await pool.query(
    'SELECT id, firstName, lastName, email, phone, role, status, hostelAssigned, createdAt, updatedAt FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );

  return {
    users: rows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const updateProfile = async (userId, updateData) => {
  const updates = [];
  const params = [];

  Object.keys(updateData).forEach(key => {
    updates.push(`${key} = ?`);
    params.push(updateData[key]);
  });

  params.push(userId);
  await pool.query(`UPDATE users SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`, params);
};

module.exports = { getAllUsers, updateProfile };