const express = require('express');
const router = express.Router();
const { requestMentorship, getMentorships, updateMentorshipStatus } = require('../controllers/mentorshipController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request', protect, requestMentorship);
router.get('/', protect, getMentorships);
router.put('/:id/status', protect, updateMentorshipStatus);

module.exports = router;
