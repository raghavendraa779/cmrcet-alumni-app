const mongoose = require('mongoose');
const User = require('../models/User');
const News = require('../models/News');
const Event = require('../models/Event');
const Job = require('../models/Job');
const Message = require('../models/Message');
const MentorshipRequest = require('../models/MentorshipRequest');

exports.getAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, verifiedUsers, pendingUsers, 
      alumniUsers, studentUsers, facultyUsers, recentRegistrations,
      totalNews, totalJobs, activeJobs, totalEvents,
      totalMessages, mentorshipRequests
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ isVerified: false }),
      User.countDocuments({ role: 'Alumni' }),
      User.countDocuments({ role: 'Student' }),
      User.countDocuments({ role: 'Faculty' }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      News.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ status: 'open' }), // Assuming job has status, if not fallback to total
      Event.countDocuments(),
      Message.countDocuments(),
      MentorshipRequest.countDocuments()
    ]);

    // Aggregate RSVPs from events
    const eventsAgg = await Event.aggregate([
      { $project: { rsvpCount: { $size: { $ifNull: ["$attendees", []] } } } },
      { $group: { _id: null, totalRSVPs: { $sum: "$rsvpCount" } } }
    ]);
    const totalRSVPs = eventsAgg.length > 0 ? eventsAgg[0].totalRSVPs : 0;

    // Aggregate likes and comments from news
    const newsAgg = await News.aggregate([
      { $project: { likeCount: { $size: { $ifNull: ["$likes", []] } }, commentCount: { $size: { $ifNull: ["$comments", []] } } } },
      { $group: { _id: null, totalLikes: { $sum: "$likeCount" }, totalComments: { $sum: "$commentCount" } } }
    ]);
    const totalLikes = newsAgg.length > 0 ? newsAgg[0].totalLikes : 0;
    const totalComments = newsAgg.length > 0 ? newsAgg[0].totalComments : 0;

    // Growth (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } }
    ]);
    const postGrowth = await News.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } }
    ]);

    const growthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toISOString().substring(0, 7);
      growthMap[monthStr] = { month: monthStr, users: 0, posts: 0 };
    }

    userGrowth.forEach(item => { if (growthMap[item._id]) growthMap[item._id].users = item.count; });
    postGrowth.forEach(item => { if (growthMap[item._id]) growthMap[item._id].posts = item.count; });

    res.json({
      success: true,
      data: {
        users: { 
          total: totalUsers, 
          verified: verifiedUsers, 
          pending: pendingUsers, 
          byRole: { alumni: alumniUsers, students: studentUsers, faculty: facultyUsers }, 
          recentRegistrations 
        },
        content: { totalNews, totalJobs, totalEvents, activeJobs },
        engagement: { totalMessages, totalRSVPs, totalLikes, totalComments, mentorshipRequests },
        growth: Object.values(growthMap)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
