const News = require('../models/News');
const User = require('../models/User');

// @desc    Get news (filtered by targeting)
// @route   GET /api/news
// @access  Private
const getNews = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    let query = {};
    if (user.role !== 'Admin') {
      query = {
        $and: [
          { $or: [{ targetRole: 'All' }, { targetRole: user.role }] },
          { $or: [{ targetBranch: 'All' }, { targetBranch: user.branch || 'None' }] }
        ]
      };
    }

    const total = await News.countDocuments(query);
    const news = await News.find(query)
      .populate('author', 'name role profilePicture')
      .populate('comments.user', 'name role profilePicture')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: news,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create news
// @route   POST /api/news
// @access  Private (Admin/Faculty)
const createNews = async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Faculty') {
      return res.status(401).json({ message: 'User not authorized to post news' });
    }

    const { title, content, category, imageUrl, allowComments, targetRole, targetBranch } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Please add a title and content field' });
    }

    const news = await News.create({
      title,
      content,
      category: category || 'General',
      imageUrl: imageUrl || '',
      allowComments: allowComments !== undefined ? allowComments : true,
      targetRole: targetRole || 'All',
      targetBranch: targetBranch || 'All',
      author: req.user.id,
    });

    const populatedNews = await News.findById(news._id).populate('author', 'name role profilePicture');
    res.status(201).json(populatedNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private
const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    // Check for user ownership or admin
    if (news.author.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await news.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Pin status
// @route   PUT /api/news/:id/pin
// @access  Private (Admin only)
const pinNews = async (req, res) => {
  try {
    if (!require('mongoose').isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    if (req.user.role !== 'Admin') return res.status(401).json({ message: 'Only Admins can pin posts' });
    
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    news.isPinned = !news.isPinned;
    await news.save();

    const populatedNews = await News.findById(news._id)
      .populate('author', 'name role')
      .populate('comments.user', 'name role');

    res.status(200).json(populatedNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Like
// @route   PUT /api/news/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    if (!require('mongoose').isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    // Check if user already liked it
    const index = news.likes.indexOf(req.user.id);
    if (index === -1) {
      news.likes.push(req.user.id); // Add like
    } else {
      news.likes.splice(index, 1); // Remove like
    }

    await news.save();
    
    const populatedNews = await News.findById(news._id)
      .populate('author', 'name role')
      .populate('comments.user', 'name role');

    res.status(200).json(populatedNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add Comment
// @route   POST /api/news/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    if (!require('mongoose').isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    if (!news.allowComments && req.user.role !== 'Admin') {
      return res.status(400).json({ message: 'Comments are disabled for this post' });
    }

    news.comments.push({ user: req.user.id, text });
    await news.save();

    const populatedNews = await News.findById(news._id)
      .populate('author', 'name role')
      .populate('comments.user', 'name role');

    res.status(201).json(populatedNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Comment
// @route   DELETE /api/news/:id/comment/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    if (!require('mongoose').isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    const comment = news.comments.find(c => c._id.toString() === req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Check ownership
    if (comment.user.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    news.comments = news.comments.filter(c => c._id.toString() !== req.params.commentId);
    await news.save();

    const populatedNews = await News.findById(news._id)
      .populate('author', 'name role')
      .populate('comments.user', 'name role');

    res.status(200).json(populatedNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateNews = async (req, res) => {
  try {
    if (!require('mongoose').isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    if (news.author.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, content, category, imageUrl, allowComments, targetRole, targetBranch } = req.body;
    if (title !== undefined) news.title = title;
    if (content !== undefined) news.content = content;
    if (category !== undefined) news.category = category;
    if (imageUrl !== undefined) news.imageUrl = imageUrl;
    if (allowComments !== undefined) news.allowComments = allowComments;
    if (targetRole !== undefined) news.targetRole = targetRole;
    if (targetBranch !== undefined) news.targetBranch = targetBranch;
    await news.save();
    const populated = await News.findById(news._id)
      .populate('author', 'name role profilePicture')
      .populate('comments.user', 'name role profilePicture');
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNews,
  createNews,
  updateNews,
  deleteNews,
  pinNews,
  toggleLike,
  addComment,
  deleteComment
};
