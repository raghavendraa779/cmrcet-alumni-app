const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  try {
    const { reportedType, reportedId, reason, description } = req.body;
    const report = new Report({
      reporter: req.user._id,
      reportedType,
      reportedId,
      reason,
      description
    });
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolutionNotes,
        resolvedBy: req.user._id
      },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
