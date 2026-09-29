const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getAnalytics } = require('../controllers/analyticsController');

router.use(protect);
router.get('/', admin, getAnalytics);

module.exports = router;
