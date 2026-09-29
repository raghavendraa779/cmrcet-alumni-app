const Job = require('../models/Job');

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await Job.countDocuments({ isActive: true });
    const jobs = await Job.find({ isActive: true })
      .populate('author', 'name role profilePicture email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: jobs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Admin or Alumni)
const createJob = async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Alumni') {
      return res.status(401).json({ message: 'Only Alumni or Admins can post jobs' });
    }

    const { title, company, location, type, description, requirements, applyLink } = req.body;

    if (!title || !company || !location || !type || !description || !applyLink) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const job = await Job.create({
      title,
      company,
      location,
      type,
      description,
      requirements,
      applyLink,
      author: req.user.id,
    });

    const populatedJob = await Job.findById(job._id).populate('author', 'name role profilePicture email');
    res.status(201).json(populatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check for user ownership or admin
    if (job.author.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await job.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    if (!require('mongoose').isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.author.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { title, company, location, type, description, requirements, applyLink, isActive, experienceLevel, workMode, deadline } = req.body;
    if (title !== undefined) job.title = title;
    if (company !== undefined) job.company = company;
    if (location !== undefined) job.location = location;
    if (type !== undefined) job.type = type;
    if (description !== undefined) job.description = description;
    if (requirements !== undefined) job.requirements = requirements;
    if (applyLink !== undefined) job.applyLink = applyLink;
    if (isActive !== undefined) job.isActive = isActive;
    if (experienceLevel !== undefined) job.experienceLevel = experienceLevel;
    if (workMode !== undefined) job.workMode = workMode;
    if (deadline !== undefined) job.deadline = deadline;

    await job.save();
    const populated = await Job.findById(job._id).populate('author', 'name role profilePicture email');
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle saved job for user
// @route   PUT /api/jobs/:id/save
// @access  Private
const toggleSavedJob = async (req, res) => {
  try {
    if (!require('mongoose').isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const User = require('../models/User');
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const user = await User.findById(req.user.id);
    const index = user.savedJobs.indexOf(job._id);

    if (index === -1) {
      user.savedJobs.push(job._id); // Add to saved jobs
    } else {
      user.savedJobs.splice(index, 1); // Remove from saved jobs
    }

    await user.save();
    res.status(200).json({ savedJobs: user.savedJobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  toggleSavedJob,
};
