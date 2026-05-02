const User = require('../models/User');
const { Team, TeamMember } = require('../models/Team');
const { Tournament, TournamentRegistration } = require('../models/Tournament');
const { Match, MatchResult } = require('../models/Match');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['otp', 'otp_expires'] },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get users', error: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ role });
    res.status(200).json({ message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update role', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalTeams, totalTournaments, totalMatches] = await Promise.all([
      User.count(),
      Team.count(),
      Tournament.count(),
      Match.count(),
    ]);

    res.status(200).json({
      stats: { totalUsers, totalTeams, totalTournaments, totalMatches },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get stats', error: error.message });
  }
};

module.exports = { getAllUsers, updateUserRole, deleteUser, getStats };
