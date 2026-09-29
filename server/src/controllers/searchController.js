const User = require('../models/User');
const Job = require('../models/Job');
const Event = require('../models/Event');
const News = require('../models/News');

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Search term is required' });
    }

    const searchRegex = new RegExp(q, 'i');

    const [users, jobs, events, news] = await Promise.all([
      User.find({
        isVerified: true,
        $or: [
          { name: searchRegex },
          { company: searchRegex },
          { designation: searchRegex },
          { branch: searchRegex }
        ]
      }).select('name profilePicture company designation role').limit(5),
      
      Job.find({
        $or: [
          { title: searchRegex },
          { company: searchRegex }
        ]
      }).select('title company location type').limit(5),

      Event.find({
        $or: [
          { title: searchRegex },
          { location: searchRegex }
        ]
      }).select('title date location type').limit(5),

      News.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex }
        ]
      }).select('title category createdAt').limit(5)
    ]);

    res.json({
      success: true,
      data: {
        users,
        jobs,
        events,
        news
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
