const { Team, TeamMember } = require('../models/Team');
const User = require('../models/User');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
const getTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      include: [
        { model: User, as: 'captain', attributes: ['id', 'name', 'ign', 'profile_pic'] },
        {
          model: TeamMember,
          as: 'members',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'ign', 'profile_pic'] }],
        },
      ],
    });

    res.status(200).json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Failed to get teams', error: error.message });
  }
};

// @desc    Get team by ID
// @route   GET /api/teams/:id
// @access  Public
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [
        { model: User, as: 'captain', attributes: ['id', 'name', 'ign', 'profile_pic'] },
        {
          model: TeamMember,
          as: 'members',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'ign', 'profile_pic'] }],
        },
      ],
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json({ team });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Failed to get team', error: error.message });
  }
};

// @desc    Create a team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const captain_id = req.user.id;

    const existingTeam = await Team.findOne({ where: { name } });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    const alreadyCaptain = await Team.findOne({ where: { captain_id } });
    if (alreadyCaptain) {
      return res.status(400).json({ message: 'You already own a team' });
    }

    const logo = req.file ? req.file.path : null;
    const team = await Team.create({ name, logo, captain_id });

    await TeamMember.create({ team_id: team.id, user_id: captain_id });

    res.status(201).json({ message: 'Team created', team });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Failed to create team', error: error.message });
  }
};

// @desc    Invite/add player to team
// @route   POST /api/teams/:id/members
// @access  Private (captain only)
const addMember = async (req, res) => {
  try {
    const { user_id } = req.body;
    const team = await Team.findByPk(req.params.id, {
      include: [{ model: TeamMember, as: 'members' }],
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.captain_id !== req.user.id) {
      return res.status(403).json({ message: 'Only the captain can add members' });
    }

    if (team.members.length >= 4) {
      return res.status(400).json({ message: 'Team is full (max 4 players)' });
    }

    const alreadyMember = await TeamMember.findOne({
      where: { team_id: team.id, user_id },
    });

    if (alreadyMember) {
      return res.status(400).json({ message: 'Player already in team' });
    }

    const member = await TeamMember.create({ team_id: team.id, user_id });
    res.status(201).json({ message: 'Player added to team', member });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Failed to add member', error: error.message });
  }
};

// @desc    Remove player from team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private (captain only)
const removeMember = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.captain_id !== req.user.id) {
      return res.status(403).json({ message: 'Only the captain can remove members' });
    }

    if (parseInt(req.params.userId) === team.captain_id) {
      return res.status(400).json({ message: 'Captain cannot be removed' });
    }

    await TeamMember.destroy({
      where: { team_id: team.id, user_id: req.params.userId },
    });

    res.status(200).json({ message: 'Member removed' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Failed to remove member', error: error.message });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (captain only)
const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.captain_id !== req.user.id) {
      return res.status(403).json({ message: 'Only the captain can update the team' });
    }

    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.file) updateData.logo = req.file.path;

    await team.update(updateData);
    res.status(200).json({ message: 'Team updated', team });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ message: 'Failed to update team', error: error.message });
  }
};

module.exports = { getTeams, getTeamById, createTeam, addMember, removeMember, updateTeam };
