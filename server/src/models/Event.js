const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['Webinar', 'Meetup', 'Workshop', 'Reunion', 'Other'],
    },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ date: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Event', eventSchema);
