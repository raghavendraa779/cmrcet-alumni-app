const mongoose = require('mongoose');
const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

exports.toggleSave = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ success: false, message: 'Invalid Job ID' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const existingSavedJob = await SavedJob.findOne({ user: req.user.id, job: jobId });

    if (existingSavedJob) {
      await SavedJob.deleteOne({ _id: existingSavedJob._id });
      return res.json({ success: true, saved: false, message: 'Job unsaved' });
    } else {
      await SavedJob.create({ user: req.user.id, job: jobId });
      return res.status(201).json({ success: true, saved: true, message: 'Job saved' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user.id })
      .populate('job')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: savedJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.checkSaved = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ success: false, message: 'Invalid Job ID' });
    }

    const savedJob = await SavedJob.findOne({ user: req.user.id, job: jobId });
    res.json({ success: true, saved: !!savedJob });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
