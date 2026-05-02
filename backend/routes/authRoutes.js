const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, getMe } = require('../controllers/authController');
const { updateProfile, getUserProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfilePic } = require('../middleware/uploadMiddleware');
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP requests, please try again after 10 minutes.' },
});

router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadProfilePic.single('profile_pic'), updateProfile);
router.get('/profile/:id', protect, getUserProfile);

module.exports = router;
