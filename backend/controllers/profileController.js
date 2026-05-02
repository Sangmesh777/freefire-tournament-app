const User = require('../models/User');
const { cloudinary } = require('../middleware/uploadMiddleware');

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, ign, ff_uid } = req.body;
    const user = req.user;

    const updateData = {};
    if (name) updateData.name = name;
    if (ign) updateData.ign = ign;
    if (ff_uid) updateData.ff_uid = ff_uid;
    if (req.file) updateData.profile_pic = req.file.path;

    await user.update(updateData);

    res.status(200).json({
      message: 'Profile updated successfully',
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
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/profile/:id
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['otp', 'otp_expires'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
};

module.exports = { updateProfile, getUserProfile };
