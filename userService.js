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

const updateUserRole = async (userId, role) => {
  const [result] = await pool.query(
    'UPDATE users SET role = ?, updatedAt = NOW() WHERE id = ?',
    [role, userId]
  );
  if (result.affectedRows === 0) throw new ApiError(404, 'User not found');
};

const updateUserStatus = async (userId, status) => {
  const [result] = await pool.query(
    'UPDATE users SET status = ?, updatedAt = NOW() WHERE id = ?',
    [status, userId]
  );
  if (result.affectedRows === 0) throw new ApiError(404, 'User not found');
};

const assignHostelToAdmin = async (userId, hostelId) => {
  const [result] = await pool.query(
    'UPDATE users SET hostelAssigned = ?, updatedAt = NOW() WHERE id = ?',
    [hostelId, userId]
  );
  if (result.affectedRows === 0) throw new ApiError(404, 'User not found');
};

module.exports = {
  getAllUsers,
  updateProfile,
  updateUserRole,
  updateUserStatus,
  assignHostelToAdmin
};