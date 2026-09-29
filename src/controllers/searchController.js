const User = require('../models/User');

exports.searchUsers = async (req, res) => {
  try {
    const { query, role, industry, location } = req.query;
    
    let filter = {};
    
    if (query) {
      filter.name = { $regex: query, $options: 'i' };
    }
    if (role) {
      filter.role = role;
    }
    if (industry) {
      filter.industry = { $regex: industry, $options: 'i' };
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
