const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error('Only JPEG, PNG, and WebP images are allowed.');
      error.statusCode = 400;
      return callback(error);
    }
    return callback(null, true);
  }
});

function uploadAvatar(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: 'cortexcrew_avatars',
      resource_type: 'image',
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }, (error, result) => error ? reject(error) : resolve(result));
    stream.end(buffer);
  });
}

module.exports = { cloudinary, upload, uploadAvatar };
