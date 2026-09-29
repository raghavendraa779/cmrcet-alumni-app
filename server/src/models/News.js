const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    category: {
      type: String,
      default: 'General',
      enum: ['General', 'Placements', 'Events', 'Academics', 'Alumni'],
    },
    imageUrl: { type: String, default: '' },
    isPinned: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    targetRole: { type: String, default: 'All' },
    targetBranch: { type: String, default: 'All' },
    views: { type: Number, default: 0 },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
  }
);

newsSchema.index({ createdAt: -1 });
newsSchema.index({ author: 1 });
newsSchema.index({ isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('News', newsSchema);
