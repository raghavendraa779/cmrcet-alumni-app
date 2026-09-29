const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
    },
    description: { type: String, required: true },
    requirements: { type: String, default: '' },
    applyLink: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    experienceLevel: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Lead', ''], default: '' },
    workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site', ''], default: '' },
    deadline: { type: Date },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ isActive: 1, createdAt: -1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ author: 1 });
jobSchema.index({ title: 'text', company: 'text', location: 'text' });

module.exports = mongoose.model('Job', jobSchema);
