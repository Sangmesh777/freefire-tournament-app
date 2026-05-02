const express = require('express');
const router = express.Router();
const { getLeaderboard, recalculateLeaderboard } = require('../controllers/leaderboardController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getLeaderboard);
router.post('/recalculate/:tournament_id', protect, adminOnly, recalculateLeaderboard);

module.exports = router;
