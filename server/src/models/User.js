const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Admin', 'Alumni', 'Student', 'Faculty'],
    required: true,
  },
  batchYear: {
    type: String, // Graduation Year for Alumni, Expected Graduation for Students
  },
  branch: {
    type: String, // e.g. CSE, ECE
  },
  company: {
    type: String, // For Alumni
  },
  designation: {
    type: String, // For Alumni (e.g., Software Engineer) or Faculty (e.g., Professor)
  },
  linkedInUrl: {
    type: String,
  },
  currentYear: {
    type: String, // For Students (1st, 2nd, 3rd, 4th)
  },
  department: {
    type: String, // For Faculty
  },
  subject: {
    type: String, // For Faculty (Subject taught)
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  organizationEmail: {
    type: String,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  bio: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  twitterUrl: { type: String, default: '' },
  portfolioUrl: { type: String, default: '' },
  achievements: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  location: { type: String, default: '' },
  availableForMentorship: { type: Boolean, default: false },
  mentorshipAreas: { type: [String], default: [] },
  privacySettings: {
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    showSocials: { type: Boolean, default: true },
    showBio: { type: Boolean, default: true },
    profileVisibility: { type: String, enum: ['public', 'verified', 'private'], default: 'public' },
  },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  isPrivate: { type: Boolean, default: false },
}, {
  timestamps: true
});

userSchema.index({ isVerified: 1 });
userSchema.index({ role: 1 });
userSchema.index({ branch: 1 });
userSchema.index({ batchYear: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ name: 'text', company: 'text', skills: 'text' });

const User = mongoose.model('User', userSchema);
module.exports = User;
