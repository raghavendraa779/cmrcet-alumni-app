const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, search, replacement) {
  const content = fs.readFileSync(filePath, 'utf8');
  const updated = content.replace(search, replacement);
  fs.writeFileSync(filePath, updated);
}

// 1. userController.js: Pagination, validation, cascade delete, reject, suggestions
let userCtrlPath = path.join(__dirname, 'server', 'src', 'controllers', 'userController.js');
let userCtrl = fs.readFileSync(userCtrlPath, 'utf8');

// Require mongoose at top if not there
if (!userCtrl.includes("const mongoose = require('mongoose');")) {
  userCtrl = "const mongoose = require('mongoose');\n" + userCtrl;
}

// Validation wrapper string
const idValidation = `
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
`;

// getDirectory pagination
userCtrl = userCtrl.replace(
  /const getDirectory = async \(req, res\) => {[\s\S]*?try {([\s\S]*?)res\.status\(200\)\.json\(users\);/m,
  `const getDirectory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({ isVerified: true });
    const users = await User.find({ isVerified: true })
      .select('-password -organizationEmail') 
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });`
);

// getPendingVerifications pagination
userCtrl = userCtrl.replace(
  /const getPendingVerifications = async \(req, res\) => {[\s\S]*?try {([\s\S]*?)res\.status\(200\)\.json\(pendingUsers\);/m,
  `const getPendingVerifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({ isVerified: false });
    const pendingUsers = await User.find({ isVerified: false })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.status(200).json({
      data: pendingUsers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });`
);

// deleteUser cascade
userCtrl = userCtrl.replace(
  /const deleteUser = async \(req, res\) => {\s*try {\s*const user = await User\.findById\(req\.params\.id\);\s*if \(!user\) return res\.status\(404\)\.json\({ message: 'User not found' }\);\s*await user\.deleteOne\(\);/m,
  `const deleteUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const News = require('../models/News');
    const Job = require('../models/Job');
    const Event = require('../models/Event');
    const Message = require('../models/Message');

    await News.deleteMany({ author: user._id });
    await Job.deleteMany({ author: user._id });
    await Event.deleteMany({ organizer: user._id });
    await Message.deleteMany({ $or: [{ sender: user._id }, { receiver: user._id }] });

    await Event.updateMany({}, { $pull: { attendees: user._id } });
    await News.updateMany({}, { $pull: { likes: user._id, comments: { user: user._id } } });

    await user.deleteOne();`
);

// approveUser validation
userCtrl = userCtrl.replace(
  /const approveUser = async \(req, res\) => {\s*try {/m,
  `const approveUser = async (req, res) => {\n  try {\n${idValidation}`
);

// getNetworkSuggestions replacement
userCtrl = userCtrl.replace(
  /const getNetworkSuggestions = async \(req, res\) => {[\s\S]*?res\.status\(200\)\.json\(suggestions\);\s*} catch/m,
  `const getNetworkSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;
    
    let suggestions = [];
    const baseQuery = { isVerified: true, _id: { $ne: currentUser._id } };
    
    if (currentUser.role === 'Student') {
      const mentors = await User.find({
        ...baseQuery,
        role: 'Alumni',
        branch: currentUser.branch,
        availableForMentorship: true
      }).select('-password -organizationEmail').limit(limit).sort({ createdAt: -1 });
      
      if (mentors.length < limit) {
        const branchAlumni = await User.find({
          ...baseQuery,
          role: 'Alumni',
          branch: currentUser.branch,
          _id: { $nin: mentors.map(m => m._id) }
        }).select('-password -organizationEmail').limit(limit - mentors.length).sort({ createdAt: -1 });
        suggestions = [...mentors, ...branchAlumni];
      } else {
        suggestions = mentors;
      }
    } else if (currentUser.role === 'Alumni') {
      const batchmates = await User.find({
        ...baseQuery,
        role: 'Alumni',
        batchYear: currentUser.batchYear
      }).select('-password -organizationEmail').limit(limit).sort({ createdAt: -1 });
      
      if (batchmates.length < limit) {
        const others = await User.find({
          ...baseQuery,
          _id: { $nin: [...batchmates.map(m => m._id), currentUser._id] }
        }).select('-password -organizationEmail').limit(limit - batchmates.length).sort({ createdAt: -1 });
        suggestions = [...batchmates, ...others];
      } else {
        suggestions = batchmates;
      }
    } else {
      suggestions = await User.find(baseQuery)
        .select('-password -organizationEmail')
        .skip(skip).limit(limit).sort({ createdAt: -1 });
    }
    
    res.status(200).json(suggestions);
  } catch`
);

// rejectUser
const rejectUserCode = `
// @desc    Reject a user
// @route   DELETE /api/users/:id/reject
// @access  Private (Admin/Faculty)
const rejectUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.status(200).json({ message: 'User rejected and removed', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
`;
userCtrl = userCtrl.replace(/module\.exports = \{/m, rejectUserCode + '\nmodule.exports = {');
userCtrl = userCtrl.replace(/deleteUser,/m, 'deleteUser,\n  rejectUser,');

// getUserById validation and privacy
userCtrl = userCtrl.replace(
  /const getUserById = async \(req, res\) => {\s*try {\s*const user = await User\.findById\(req\.params\.id\)\.select\('-password'\);\s*if \(!user\) return res\.status\(404\)\.json\({ message: 'User not found' }\);\s*res\.status\(200\)\.json\(user\);/m,
  `const getUserById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userProfile = user.toObject();
    if (user.privacySettings) {
      if (!user.privacySettings.showEmail) delete userProfile.email;
      if (!user.privacySettings.showSocials) {
        delete userProfile.linkedInUrl;
        delete userProfile.githubUrl;
        delete userProfile.twitterUrl;
        delete userProfile.portfolioUrl;
      }
    }
    delete userProfile.organizationEmail;
    delete userProfile.resetPasswordToken;
    delete userProfile.resetPasswordExpire;

    res.status(200).json(userProfile);`
);

// getUserProfile privacy
userCtrl = userCtrl.replace(
  /const getUserProfile = async \(req, res\) => {\s*try {\s*const user = await User\.findById\(req\.user\.id\)\.select\('-password'\);\s*if \(!user\) return res\.status\(404\)\.json\({ message: 'User not found' }\);\s*res\.status\(200\)\.json\(user\);/m,
  `const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const userProfile = user.toObject();
    delete userProfile.organizationEmail;
    delete userProfile.resetPasswordToken;
    delete userProfile.resetPasswordExpire;

    res.status(200).json(userProfile);`
);


fs.writeFileSync(userCtrlPath, userCtrl);
console.log('Updated userController.js');

// 2. authController.js: forgotPassword, resetPassword, register validation
let authCtrlPath = path.join(__dirname, 'server', 'src', 'controllers', 'authController.js');
let authCtrl = fs.readFileSync(authCtrlPath, 'utf8');

if (!authCtrl.includes("const crypto = require('crypto');")) {
  authCtrl = "const crypto = require('crypto');\n" + authCtrl;
}

// Registration validation
authCtrl = authCtrl.replace(
  /const registerUser = async \(req, res\) => {\s*try {\s*const {([^}]+)} = req\.body;/m,
  `const registerUser = async (req, res) => {
  try {
    const {$1} = req.body;
    
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }`
);

const pwdResetCode = `
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide an email' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account with that email' });
    
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save();
    
    res.status(200).json({ message: 'Password reset token generated', resetToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Please provide a new password' });
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
`;
authCtrl = authCtrl.replace(/module\.exports = \{/m, pwdResetCode + '\nmodule.exports = {');
authCtrl = authCtrl.replace(/loginUser,/m, 'loginUser,\n  forgotPassword,\n  resetPassword,');

fs.writeFileSync(authCtrlPath, authCtrl);
console.log('Updated authController.js');

// 3. authRoutes.js and userRoutes.js
let authRoutesPath = path.join(__dirname, 'server', 'src', 'routes', 'authRoutes.js');
let authRoutes = fs.readFileSync(authRoutesPath, 'utf8');
authRoutes = authRoutes.replace(/const \{([^}]+)\} = require\('\.\.\/controllers\/authController'\);/m, (match, p1) => {
  return "const {" + p1 + ", forgotPassword, resetPassword} = require('../controllers/authController');";
});
authRoutes += "\\nrouter.post('/forgot-password', forgotPassword);\\nrouter.put('/reset-password/:token', resetPassword);\\n";
fs.writeFileSync(authRoutesPath, authRoutes);
console.log('Updated authRoutes.js');

let userRoutesPath = path.join(__dirname, 'server', 'src', 'routes', 'userRoutes.js');
let userRoutes = fs.readFileSync(userRoutesPath, 'utf8');
userRoutes = userRoutes.replace(/const \\{([^}]+)\\} = require\\('\\.\\.\\/controllers\\/userController'\\);/m, (match, p1) => {
  return "const {" + p1 + ", rejectUser} = require('../controllers/userController');";
});
userRoutes = userRoutes.replace(/const \\{ protect, facultyOrAdmin \\} = require\\('\\.\\.\\/middleware\\/authMiddleware'\\);/m, 
  "const { protect, facultyOrAdmin } = require('../middleware/authMiddleware');"
);
if (!userRoutes.includes('rejectUser')) {
  userRoutes += "\\nrouter.delete('/:id/reject', protect, facultyOrAdmin, rejectUser);\\n";
} else {
  if (!userRoutes.includes('/:id/reject')) {
    userRoutes += "\\nrouter.delete('/:id/reject', protect, facultyOrAdmin, rejectUser);\\n";
  }
}
fs.writeFileSync(userRoutesPath, userRoutes);
console.log('Updated userRoutes.js');
