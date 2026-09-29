const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedType: {
    type: String,
    enum: ['User', 'Post', 'Comment', 'Event'],
    required: true
  },
  reportedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'reportedType',
    required: true
  },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate', 'other'],
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
