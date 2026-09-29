const express = require('express');
const router = express.Router();
const { 
  verifyUser, getDirectory, getAdminStats, 
  getPendingVerifications, approveUser, getNetworkSuggestions,
  deleteUser, getUserProfile, updateUserProfile, getUserById,
  rejectUser
} = require('../controllers/userController');
const { protect, admin, facultyOrAdmin } = require('../middleware/authMiddleware');

router.post('/verify', protect, verifyUser);
router.get('/directory', protect, getDirectory);
router.get('/stats', protect, admin, getAdminStats);
router.get('/pending', protect, facultyOrAdmin, getPendingVerifications);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/:id/approve', protect, facultyOrAdmin, approveUser);
router.delete('/:id/reject', protect, facultyOrAdmin, rejectUser);
router.get('/network', protect, getNetworkSuggestions);
router.get('/:id', protect, getUserById);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
