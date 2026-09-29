const express = require('express');
const router = express.Router();
const { searchUsers } = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, searchUsers);

module.exports = router;
