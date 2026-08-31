const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const protect = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');
const { avatarLimiter } = require('../middleware/rateLimit.middleware');
const { upload, uploadAvatar } = require('../utils/cloudinary');
const User = require('../models/User');
const sendResponse = require('../utils/response');

router.get('/', protect, adminOnly, userController.getAllUsers);
router.patch('/:id/status', protect, adminOnly, userController.updateUserStatus);

router.post('/upload-avatar', protect, avatarLimiter, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file?.buffer) return sendResponse(res, 400, false, 'A JPEG, PNG, or WebP avatar is required.', null);
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return sendResponse(res, 503, false, 'Avatar storage is not configured. Add the Cloudinary credentials to Backend/.env and restart the backend.', null);
    }
    const uploaded = await uploadAvatar(req.file.buffer);
    const avatarUrl = uploaded.secure_url || uploaded.url;
    if (!avatarUrl) return sendResponse(res, 502, false, 'Avatar storage did not return an image URL.', null);
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true, runValidators: true }
    ).select('avatar');
    if (!updatedUser) return sendResponse(res, 404, false, 'User not found.', null);
    return sendResponse(res, 200, true, 'Avatar uploaded successfully', { avatar: updatedUser.avatar, url: updatedUser.avatar });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
