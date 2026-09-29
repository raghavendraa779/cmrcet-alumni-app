const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get all conversations (last message per user)
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const currentUserId = req.user.id;
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

    const basePipeline = [
      {
        $match: {
          $or: [{ sender: currentUserObjectId }, { receiver: currentUserObjectId }]
        }
      },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserObjectId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', currentUserObjectId] }, { $eq: ['$read', false] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ];

    const totalPipeline = [...basePipeline, { $count: 'total' }];
    const totalResult = await Message.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    const conversations = await Message.aggregate([
      ...basePipeline,
      { $sort: { 'lastMessage.createdAt': -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = await User.findById(conv._id).select('name profilePicture role');
        return {
          user: otherUser,
          lastMessage: {
            text: conv.lastMessage.text,
            createdAt: conv.lastMessage.createdAt,
            isMine: conv.lastMessage.sender.toString() === currentUserId,
            read: conv.lastMessage.read
          },
          unreadCount: conv.unreadCount
        };
      })
    );

    res.status(200).json({
      data: populated,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat history with a specific user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    };

    const total = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Return in oldest to newest order
    messages.reverse();

    // Mark messages as read if the current user is the receiver
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      data: messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages/:userId
// @access  Private
const sendMessage = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const senderId = req.user.id;
    const receiverId = req.params.userId;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
};
