const express = require('express');
const router = express.Router();
const {
  getTeams,
  getTeamById,
  createTeam,
  addMember,
  removeMember,
  updateTeam,
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const { uploadTeamLogo } = require('../middleware/uploadMiddleware');

router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/', protect, uploadTeamLogo.single('logo'), createTeam);
router.put('/:id', protect, uploadTeamLogo.single('logo'), updateTeam);
router.post('/:id/members', protect, addMember);
router.delete('/:id/members/:userId', protect, removeMember);

module.exports = router;
