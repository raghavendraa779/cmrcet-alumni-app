const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendRequest,
  getMyRequests,
  respondToRequest,
  completeRequest,
  getMentors
} = require('../controllers/mentorshipController');

router.use(protect);

router.post('/', sendRequest);
router.get('/my-requests', getMyRequests);
router.put('/:id/respond', respondToRequest);
router.put('/:id/complete', completeRequest);
router.get('/mentors', getMentors);

module.exports = router;
