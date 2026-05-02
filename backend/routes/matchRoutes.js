const express = require('express');
const router = express.Router();
const {
  getMatches,
  getMatchById,
  createMatch,
  updateMatch,
  submitResult,
} = require('../controllers/matchController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getMatches);
router.get('/:id', getMatchById);
router.post('/', protect, adminOnly, createMatch);
router.put('/:id', protect, adminOnly, updateMatch);
router.post('/:id/result', protect, adminOnly, submitResult);

module.exports = router;
