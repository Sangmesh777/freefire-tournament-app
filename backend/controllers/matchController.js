const { Match, MatchResult } = require('../models/Match');
const { Team } = require('../models/Team');
const { Tournament } = require('../models/Tournament');

// @desc    Get matches for a tournament
// @route   GET /api/matches?tournament_id=x
// @access  Public
const getMatches = async (req, res) => {
  try {
    const { tournament_id } = req.query;
    const where = tournament_id ? { tournament_id } : {};

    const matches = await Match.findAll({
      where,
      include: [
        { model: Team, as: 'team1', attributes: ['id', 'name', 'logo'] },
        { model: Team, as: 'team2', attributes: ['id', 'name', 'logo'] },
        { model: Team, as: 'winner', attributes: ['id', 'name', 'logo'] },
        { model: MatchResult, as: 'results' },
      ],
      order: [['scheduled_at', 'ASC']],
    });

    res.status(200).json({ matches });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Failed to get matches', error: error.message });
  }
};

// @desc    Get match by ID
// @route   GET /api/matches/:id
// @access  Public
const getMatchById = async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id, {
      include: [
        { model: Team, as: 'team1', attributes: ['id', 'name', 'logo'] },
        { model: Team, as: 'team2', attributes: ['id', 'name', 'logo'] },
        { model: Team, as: 'winner', attributes: ['id', 'name', 'logo'] },
        { model: MatchResult, as: 'results' },
      ],
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.status(200).json({ match });
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ message: 'Failed to get match', error: error.message });
  }
};

// @desc    Create match (Admin)
// @route   POST /api/matches
// @access  Private/Admin
const createMatch = async (req, res) => {
  try {
    const { tournament_id, team1_id, team2_id, scheduled_at, round } = req.body;

    const match = await Match.create({
      tournament_id,
      team1_id,
      team2_id,
      scheduled_at,
      round: round || 1,
      status: 'scheduled',
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`tournament_${tournament_id}`).emit('match_scheduled', { match });
    }

    res.status(201).json({ message: 'Match created', match });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ message: 'Failed to create match', error: error.message });
  }
};

// @desc    Update match status / result (Admin)
// @route   PUT /api/matches/:id
// @access  Private/Admin
const updateMatch = async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    await match.update(req.body);

    const io = req.app.get('io');
    if (io) {
      io.to(`tournament_${match.tournament_id}`).emit('match_updated', { match });
      if (req.body.status === 'live') {
        io.to(`tournament_${match.tournament_id}`).emit('match_live', { matchId: match.id });
      }
    }

    res.status(200).json({ message: 'Match updated', match });
  } catch (error) {
    console.error('Update match error:', error);
    res.status(500).json({ message: 'Failed to update match', error: error.message });
  }
};

// @desc    Submit match result (Admin)
// @route   POST /api/matches/:id/result
// @access  Private/Admin
const submitResult = async (req, res) => {
  try {
    const { results, winner_id } = req.body;
    const match = await Match.findByPk(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    await match.update({ status: 'completed', winner_id });

    for (const result of results) {
      await MatchResult.upsert({
        match_id: match.id,
        team_id: result.team_id,
        kills: result.kills,
        placement: result.placement,
        points: result.points,
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`tournament_${match.tournament_id}`).emit('match_result', {
        matchId: match.id,
        winner_id,
        results,
      });
    }

    res.status(200).json({ message: 'Result submitted' });
  } catch (error) {
    console.error('Submit result error:', error);
    res.status(500).json({ message: 'Failed to submit result', error: error.message });
  }
};

module.exports = { getMatches, getMatchById, createMatch, updateMatch, submitResult };
