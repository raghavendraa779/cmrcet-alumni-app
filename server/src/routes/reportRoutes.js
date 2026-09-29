const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createReport,
  getReports,
  reviewReport
} = require('../controllers/reportController');

router.use(protect);

router.post('/', createReport);
router.get('/', admin, getReports);
router.put('/:id', admin, reviewReport);

module.exports = router;
