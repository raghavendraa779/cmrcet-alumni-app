const User = require('../models/User');
const mongoose = require('mongoose');

// ... existing verifyUser code ...

// @desc    Verify user with organization email
// @route   POST /api/users/verify
// @access  Private
const verifyUser = async (req, res) => {
  try {
    const { orgEmail } = req.body;
    
    if (!orgEmail) {
      return res.status(400).json({ message: 'Please provide an organization email.' });
    }

    if (!orgEmail.endsWith('@cmrcet.ac.in')) {
      return res.status(400).json({ message: 'Invalid email domain. Must be @cmrcet.ac.in' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.organizationEmail = orgEmail;
    user.isVerified = true;
    await user.save();

    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: req.headers.authorization.split(' ')[1],
      profilePicture: user.profilePicture,
      batchYear: user.batchYear,
      branch: user.branch,
      company: user.company,
      designation: user.designation,
      linkedInUrl: user.linkedInUrl,
      currentYear: user.currentYear,
      department: user.department,
      subject: user.subject,
      bio: user.bio,
      githubUrl: user.githubUrl,
      twitterUrl: user.twitterUrl,
      portfolioUrl: user.portfolioUrl,
      achievements: user.achievements,
      skills: user.skills,
      interests: user.interests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all verified users for directory
// @route   GET /api/users/directory
// @access  Private
const getDirectory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({ isVerified: true });
    const users = await User.find({ isVerified: true })
      .select('-password -organizationEmail') 
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = totalUsers - verifiedUsers;
    
    const alumniCount = await User.countDocuments({ role: 'Alumni', isVerified: true });
    const studentCount = await User.countDocuments({ role: 'Student', isVerified: true });
    const facultyCount = await User.countDocuments({ role: 'Faculty', isVerified: true });

    res.status(200).json({
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      roles: { alumni: alumniCount, students: studentCount, faculty: facultyCount }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending verifications
// @route   GET /api/users/pending
// @access  Private (Admin/Faculty)
const getPendingVerifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({ isVerified: false });
    const pendingUsers = await User.find({ isVerified: false })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: pendingUsers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a user
// @route   PUT /api/users/:id/approve
// @access  Private (Admin/Faculty)
const approveUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'User approved', id: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get network suggestions (Batchmates or Mentors)
// @route   GET /api/users/network
// @access  Private
const getNetworkSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;
    
    let suggestions = [];
    const baseQuery = { isVerified: true, isPrivate: { $ne: true }, _id: { $ne: currentUser._id } };
    
    if (currentUser.role === 'Student') {
      const mentors = await User.find({
        ...baseQuery,
        role: 'Alumni',
        branch: currentUser.branch,
        availableForMentorship: true
      }).select('-password -organizationEmail').limit(limit).sort({ createdAt: -1 });
      
      if (mentors.length < limit) {
        const branchAlumni = await User.find({
          ...baseQuery,
          role: 'Alumni',
          branch: currentUser.branch,
          _id: { $nin: mentors.map(m => m._id) }
        }).select('-password -organizationEmail').limit(limit - mentors.length).sort({ createdAt: -1 });
        suggestions = [...mentors, ...branchAlumni];
      } else {
        suggestions = mentors;
      }
    } else if (currentUser.role === 'Alumni') {
      const batchmates = await User.find({
        ...baseQuery,
        role: 'Alumni',
        batchYear: currentUser.batchYear
      }).select('-password -organizationEmail').limit(limit).sort({ createdAt: -1 });
      
      if (batchmates.length < limit) {
        const others = await User.find({
          ...baseQuery,
          _id: { $nin: [...batchmates.map(m => m._id), currentUser._id] }
        }).select('-password -organizationEmail').limit(limit - batchmates.length).sort({ createdAt: -1 });
        suggestions = [...batchmates, ...others];
      } else {
        suggestions = batchmates;
      }
    } else {
      suggestions = await User.find(baseQuery)
        .select('-password -organizationEmail')
        .skip(skip).limit(limit).sort({ createdAt: -1 });
    }
    
    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const News = require('../models/News');
    const Job = require('../models/Job');
    const Event = require('../models/Event');
    const Message = require('../models/Message');

    await News.deleteMany({ author: user._id });
    await Job.deleteMany({ author: user._id });
    await Event.deleteMany({ organizer: user._id });
    await Message.deleteMany({ $or: [{ sender: user._id }, { receiver: user._id }] });

    await Event.updateMany({}, { $pull: { attendees: user._id } });
    await News.updateMany({}, { $pull: { likes: user._id, comments: { user: user._id } } });

    await user.deleteOne();

    res.status(200).json({ message: 'User removed', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a user
// @route   DELETE /api/users/:id/reject
// @access  Private (Admin/Faculty)
const rejectUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.status(200).json({ message: 'User rejected and removed', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userProfile = user.toObject();
    delete userProfile.organizationEmail;
    delete userProfile.resetPasswordToken;
    delete userProfile.resetPasswordExpire;

    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.batchYear !== undefined) user.batchYear = req.body.batchYear;
    if (req.body.branch !== undefined) user.branch = req.body.branch;
    if (req.body.company !== undefined) user.company = req.body.company;
    if (req.body.designation !== undefined) user.designation = req.body.designation;
    if (req.body.linkedInUrl !== undefined) user.linkedInUrl = req.body.linkedInUrl;
    if (req.body.currentYear !== undefined) user.currentYear = req.body.currentYear;
    if (req.body.department !== undefined) user.department = req.body.department;
    if (req.body.subject !== undefined) user.subject = req.body.subject;
    if (req.body.profilePicture !== undefined) user.profilePicture = req.body.profilePicture;

    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.githubUrl !== undefined) user.githubUrl = req.body.githubUrl;
    if (req.body.twitterUrl !== undefined) user.twitterUrl = req.body.twitterUrl;
    if (req.body.portfolioUrl !== undefined) user.portfolioUrl = req.body.portfolioUrl;
    if (req.body.achievements !== undefined) user.achievements = req.body.achievements;
    if (req.body.skills !== undefined) user.skills = req.body.skills;
    if (req.body.interests !== undefined) user.interests = req.body.interests;
    
    if (req.body.location !== undefined) user.location = req.body.location;
    if (req.body.availableForMentorship !== undefined) user.availableForMentorship = req.body.availableForMentorship;
    if (req.body.mentorshipAreas !== undefined) user.mentorshipAreas = req.body.mentorshipAreas;
    if (req.body.privacySettings !== undefined) user.privacySettings = req.body.privacySettings;
    if (req.body.isPrivate !== undefined) user.isPrivate = req.body.isPrivate;

    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userProfile = user.toObject();
    if (userProfile.privacySettings) {
      if (!userProfile.privacySettings.showEmail) delete userProfile.email;
      if (!userProfile.privacySettings.showSocials) {
        delete userProfile.linkedInUrl;
        delete userProfile.githubUrl;
        delete userProfile.twitterUrl;
        delete userProfile.portfolioUrl;
      }
    }
    delete userProfile.organizationEmail;
    delete userProfile.resetPasswordToken;
    delete userProfile.resetPasswordExpire;

    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  verifyUser,
  getDirectory,
  getAdminStats,
  getPendingVerifications,
  approveUser,
  getNetworkSuggestions,
  deleteUser,
  rejectUser,
  getUserProfile,
  updateUserProfile,
  getUserById,
};

