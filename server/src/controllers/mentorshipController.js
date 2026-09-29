const mongoose = require('mongoose');
const MentorshipRequest = require('../models/MentorshipRequest');
const User = require('../models/User');

exports.sendRequest = async (req, res) => {
  try {
    const { mentor, message, areas } = req.body;
    
    if (!mongoose.isValidObjectId(mentor)) {
      return res.status(400).json({ success: false, message: 'Invalid mentor ID' });
    }

    const studentUser = await User.findById(req.user.id);
    if (studentUser.role !== 'Student') {
      return res.status(403).json({ success: false, message: 'Only students can send mentorship requests' });
    }

    const mentorUser = await User.findById(mentor);
    if (!mentorUser || mentorUser.role !== 'Alumni' || !mentorUser.availableForMentorship) {
      return res.status(400).json({ success: false, message: 'Mentor not found or unavailable' });
    }

    const existingRequest = await MentorshipRequest.findOne({
      student: req.user.id,
      mentor,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You already have a pending request with this mentor' });
    }

    const request = await MentorshipRequest.create({
      student: req.user.id,
      mentor,
      message,
      areas
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate pending request found' });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const { role } = req.query; // 'student' or 'mentor'
    let query = {};
    
    if (role === 'student') query.student = req.user.id;
    else if (role === 'mentor') query.mentor = req.user.id;
    else {
      query.$or = [{ student: req.user.id }, { mentor: req.user.id }];
    }

    const requests = await MentorshipRequest.find(query)
      .populate('student', 'firstName lastName email profilePicture branch batch')
      .populate('mentor', 'firstName lastName email profilePicture company jobTitle')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseMessage } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid request ID' });
    }
    
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await MentorshipRequest.findOneAndUpdate(
      { _id: id, mentor: req.user.id, status: 'pending' },
      { status, responseMessage },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found or already processed' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.completeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid request ID' });
    }

    const request = await MentorshipRequest.findOneAndUpdate(
      { _id: id, $or: [{ student: req.user.id }, { mentor: req.user.id }], status: 'accepted' },
      { status: 'completed' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found or not in accepted state' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.getMentors = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { branch, skills } = req.query;
    let query = { role: 'Alumni', availableForMentorship: true };

    if (branch) query.branch = branch;
    if (skills) query.skills = { $in: skills.split(',') };

    const mentors = await User.find(query)
      .select('firstName lastName profilePicture company jobTitle branch skills location')
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: mentors,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
