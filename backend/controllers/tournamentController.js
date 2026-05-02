const { Tournament, TournamentRegistration } = require('../models/Tournament');
const { Team } = require('../models/Team');
const User = require('../models/User');

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
const getTournaments = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    const tournaments = await Tournament.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'ign'] },
      ],
      order: [['start_date', 'ASC']],
    });

    res.status(200).json({ tournaments });
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({ message: 'Failed to get tournaments', error: error.message });
  }
};

// @desc    Get tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'ign'] },
        {
          model: TournamentRegistration,
          as: 'registrations',
          include: [{ model: Team, as: 'team', attributes: ['id', 'name', 'logo'] }],
        },
      ],
    });

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.status(200).json({ tournament });
  } catch (error) {
    console.error('Get tournament error:', error);
    res.status(500).json({ message: 'Failed to get tournament', error: error.message });
  }
};

// @desc    Create tournament (Admin)
// @route   POST /api/tournaments
// @access  Private/Admin
const createTournament = async (req, res) => {
  try {
    const { name, start_date, end_date, prize_pool, max_teams, entry_fee } = req.body;

    const tournament = await Tournament.create({
      name,
      start_date,
      end_date,
      prize_pool: prize_pool || 0,
      max_teams: max_teams || 16,
      entry_fee: entry_fee || 0,
      status: 'upcoming',
      created_by: req.user.id,
    });

    res.status(201).json({ message: 'Tournament created', tournament });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ message: 'Failed to create tournament', error: error.message });
  }
};

// @desc    Update tournament (Admin)
// @route   PUT /api/tournaments/:id
// @access  Private/Admin
const updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    await tournament.update(req.body);
    res.status(200).json({ message: 'Tournament updated', tournament });
  } catch (error) {
    console.error('Update tournament error:', error);
    res.status(500).json({ message: 'Failed to update tournament', error: error.message });
  }
};

// @desc    Delete tournament (Admin)
// @route   DELETE /api/tournaments/:id
// @access  Private/Admin
const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    await tournament.destroy();
    res.status(200).json({ message: 'Tournament deleted' });
  } catch (error) {
    console.error('Delete tournament error:', error);
    res.status(500).json({ message: 'Failed to delete tournament', error: error.message });
  }
};

// @desc    Register team for tournament
// @route   POST /api/tournaments/:id/register
// @access  Private
const registerForTournament = async (req, res) => {
  try {
    const { team_id } = req.body;
    const tournament_id = req.params.id;

    const tournament = await Tournament.findByPk(tournament_id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ message: 'Tournament registration is closed' });
    }

    const existingReg = await TournamentRegistration.findOne({
      where: { tournament_id, team_id },
    });

    if (existingReg) {
      return res.status(400).json({ message: 'Team already registered' });
    }

    const regCount = await TournamentRegistration.count({ where: { tournament_id } });
    if (regCount >= tournament.max_teams) {
      return res.status(400).json({ message: 'Tournament is full' });
    }

    const registration = await TournamentRegistration.create({ tournament_id, team_id });
    res.status(201).json({ message: 'Team registered successfully', registration });
  } catch (error) {
    console.error('Register tournament error:', error);
    res.status(500).json({ message: 'Failed to register', error: error.message });
  }
};

module.exports = {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  registerForTournament,
};
