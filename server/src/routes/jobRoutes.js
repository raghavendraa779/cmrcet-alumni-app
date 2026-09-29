const express = require('express');
const router = express.Router();
const { getJobs, createJob, updateJob, deleteJob, toggleSavedJob } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getJobs).post(protect, createJob);
router.route('/:id').put(protect, updateJob).delete(protect, deleteJob);
router.put('/:id/save', protect, toggleSavedJob);

module.exports = router;
