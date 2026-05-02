const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// @desc    Send OTP to phone number
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const otp = generateOTP();
    const otp_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await User.findOne({ where: { phone } });
    if (!user) {
      user = await User.create({ phone, otp, otp_expires });
    } else {
      await user.update({ otp, otp_expires });
    }

    // Twilio skipped for testing - OTP shown in console
    console.log(`============================`);
    console.log(`OTP for ${phone} is: ${otp}`);
    console.log(`============================`);

    res.status(200).json({ message: 'OTP sent successfully', otp }); // otp returned for testing
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// @desc    Verify OTP and login/register
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const user = await User.findOne({ where: { phone } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    await user.update({ otp: null, otp_expires: null });

    const token = generateToken(user.id);
    const isNewUser = !user.name;

    res.status(200).json({
      message: 'Login successful',
      token,
      isNewUser,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        ign: user.ign,
        ff_uid: user.ff_uid,
        profile_pic: user.profile_pic,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = { sendOTP, verifyOTP, getMe };
