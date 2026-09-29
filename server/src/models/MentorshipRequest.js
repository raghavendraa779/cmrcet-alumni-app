const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  areas: { type: [String], default: [] },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  responseMessage: { type: String, default: '' },
}, { timestamps: true });

mentorshipRequestSchema.index({ student: 1, status: 1 });
mentorshipRequestSchema.index({ mentor: 1, status: 1 });
// Prevent duplicate pending requests
mentorshipRequestSchema.index({ student: 1, mentor: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
