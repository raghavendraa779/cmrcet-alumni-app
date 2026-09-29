const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  toggleSave,
  getSavedJobs,
  checkSaved
} = require('../controllers/savedJobController');

router.use(protect);

router.post('/:jobId', toggleSave);
router.get('/', getSavedJobs);
router.get('/check/:jobId', checkSaved);

module.exports = router;
