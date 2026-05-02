const Leaderboard = require('../models/Leaderboard');
const { Team } = require('../models/Team');
const { Tournament } = require('../models/Tournament');
const { MatchResult } = require('../models/Match');
const { sequelize } = require('../config/db');

// @desc    Get leaderboard (global or per tournament)
// @route   GET /api/leaderboard?tournament_id=x
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const { tournament_id } = req.query;
    const where = tournament_id ? { tournament_id } : { tournament_id: null };

    const leaderboard = await Leaderboard.findAll({
      where,
      include: [
        { model: Team, as: 'team', attributes: ['id', 'name', 'logo'] },
        tournament_id
          ? { model: Tournament, as: 'tournament', attributes: ['id', 'name'] }
          : null,
      ].filter(Boolean),
      order: [['total_points', 'DESC'], ['total_kills', 'DESC']],
    });

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Failed to get leaderboard', error: error.message });
  }
};

// @desc    Recalculate leaderboard for a tournament
// @route   POST /api/leaderboard/recalculate/:tournament_id
// @access  Private/Admin
const recalculateLeaderboard = async (req, res) => {
  try {
    const { tournament_id } = req.params;

    const results = await MatchResult.findAll({
      include: [
        {
          model: require('../models/Match').Match,
          as: 'match',
          where: { tournament_id, status: 'completed' },
          attributes: [],
        },
      ],
      attributes: [
        'team_id',
        [sequelize.fn('SUM', sequelize.col('kills')), 'total_kills'],
        [sequelize.fn('SUM', sequelize.col('points')), 'total_points'],
      ],
      group: ['team_id'],
      raw: true,
    });

    await Promise.all(
      results.map((result, index) =>
        Leaderboard.upsert({
          tournament_id,
          team_id: result.team_id,
          total_kills: result.total_kills,
          total_points: result.total_points,
          rank: index + 1,
        })
      )
    );

    res.status(200).json({ message: 'Leaderboard recalculated' });
  } catch (error) {
    console.error('Recalculate leaderboard error:', error);
    res.status(500).json({ message: 'Failed to recalculate', error: error.message });
  }
};

module.exports = { getLeaderboard, recalculateLeaderboard };
