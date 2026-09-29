const mongoose = require('mongoose');
const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({ success: false, message: 'Invalid Target ID' });
    }

    const report = await Report.create({
      reporter: req.user.id,
      targetType,
      targetId,
      reason,
      description
    });

    res.status(201).json({ success: true, data: report, message: 'Report submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { status, targetType } = req.query;
    let query = {};
    if (status) query.status = status;
    if (targetType) query.targetType = targetType;

    const reports = await Report.find(query)
      .populate('reporter', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: reports,
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

exports.reviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Report ID' });
    }

    if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      { status, reviewNote, reviewedBy: req.user.id },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
