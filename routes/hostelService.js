const pool = require('../db');
const ApiError = require('../utils/ApiError');
const { uploadImage } = require('../utils/cloudinary');

const createHostel = async (hostelData, ownerId) => {
  const {
    name, price, location, address, phone, email,
    capacity, description, features, image, photos, status
  } = hostelData;

  // 1. Handle Primary Image Upload to Cloudinary
  let imageUrl = image;
  if (image && (image.startsWith('data:image') || !image.startsWith('http'))) {
    imageUrl = await uploadImage(image);
  }

  // 2. Handle Gallery Photos Upload
  const processedPhotos = [];
  if (photos && Array.isArray(photos)) {
    for (const photo of photos) {
      if (photo.type === 'base64' || (photo.src && !photo.src.startsWith('http'))) {
        const uploadedUrl = await uploadImage(photo.src);
        processedPhotos.push({ type: 'url', src: uploadedUrl });
      } else {
        processedPhotos.push(photo);
      }
    }
  }

  const featurePayload = JSON.stringify(features || {});
  const photosPayload = JSON.stringify(processedPhotos);

  const [result] = await pool.query(
    `INSERT INTO hostels
     (name, price, location, address, phone, email, capacity, description,
      features, image, photos, status, ownerId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      name, price, location, address, phone || null, email || null,
      capacity, description || null, featurePayload, imageUrl || null,
      photosPayload, status || 'active', ownerId
    ]
  );

  return { hostelId: result.insertId };
};

const getHostelById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM hostels WHERE id = ?', [id]);
  if (!rows.length) throw new ApiError(404, 'Hostel not found');
  return rows[0];
};

const updateHostel = async (id, updateData, user) => {
  const [rows] = await pool.query('SELECT * FROM hostels WHERE id = ?', [id]);
  if (!rows.length) throw new ApiError(404, 'Hostel not found');
  
  if (user.role === 'hostel_admin' && rows[0].ownerId !== user.id) {
    throw new ApiError(403, 'Forbidden');
  }

  // If new images provided, they should be uploaded to Cloudinary
  if (updateData.image && !updateData.image.startsWith('http')) {
    updateData.image = await uploadImage(updateData.image);
  }

  const updates = [];
  const params = [];
  Object.keys(updateData).forEach(key => {
    updates.push(`${key} = ?`);
    params.push(typeof updateData[key] === 'object' ? JSON.stringify(updateData[key]) : updateData[key]);
  });

  params.push(id);
  await pool.query(`UPDATE hostels SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`, params);
};

const deleteHostel = async (id, user) => {
  const [rows] = await pool.query('SELECT * FROM hostels WHERE id = ?', [id]);
  if (!rows.length) throw new ApiError(404, 'Hostel not found');
  if (user.role === 'hostel_admin' && rows[0].ownerId !== user.id) throw new ApiError(403, 'Forbidden');

  await pool.query('UPDATE hostels SET status = "inactive", updatedAt = NOW() WHERE id = ?', [id]);
};

module.exports = {
  createHostel,
  getHostelById,
  updateHostel,
  deleteHostel
};