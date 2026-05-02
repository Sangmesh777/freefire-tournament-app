const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary and return the upload result.
 */
const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });

/**
 * Build an uploader object that mirrors the multer `.single()` interface.
 * After multer buffers the file in memory, the buffer is uploaded to
 * Cloudinary and `req.file.path` is set to the resulting secure URL so
 * downstream controllers stay unchanged.
 */
const createUploader = (cloudinaryOptions) => ({
  single: (fieldName) => (req, res, next) => {
    const upload = multer({ storage: multer.memoryStorage() }).single(fieldName);
    upload(req, res, async (err) => {
      if (err) return next(err);
      if (!req.file) return next();
      try {
        const result = await uploadToCloudinary(req.file.buffer, cloudinaryOptions);
        req.file.path = result.secure_url;
        next();
      } catch (uploadErr) {
        return res.status(500).json({ message: 'Image upload failed', error: uploadErr.message });
      }
    });
  },
});

const uploadProfilePic = createUploader({
  folder: 'freefire/profiles',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [{ width: 300, height: 300, crop: 'fill' }],
});

const uploadTeamLogo = createUploader({
  folder: 'freefire/team-logos',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [{ width: 200, height: 200, crop: 'fill' }],
});

module.exports = { uploadProfilePic, uploadTeamLogo, cloudinary, uploadToCloudinary };
