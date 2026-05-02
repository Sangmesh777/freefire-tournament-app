const express = require('express');
const router = express.Router();
const {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  registerForTournament,
} = require('../controllers/tournamentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getTournaments);
router.get('/:id', getTournamentById);
router.post('/', protect, adminOnly, createTournament);
router.put('/:id', protect, adminOnly, updateTournament);
router.delete('/:id', protect, adminOnly, deleteTournament);
router.post('/:id/register', protect, registerForTournament);

module.exports = router;
