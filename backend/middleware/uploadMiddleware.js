const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'freefire/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill' }],
  },
});

const teamLogoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'freefire/team-logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill' }],
  },
});

const uploadProfilePic = multer({ storage: profileStorage });
const uploadTeamLogo = multer({ storage: teamLogoStorage });

module.exports = { uploadProfilePic, uploadTeamLogo, cloudinary };
