const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config({ path: './.env' });
require('node:dns').setServers(['8.8.8.8', '1.1.1.1']);

const checkDuplicates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Group by name and count
    const duplicates = await User.aggregate([
      { $group: { _id: "$name", count: { $sum: 1 }, docs: { $push: "$_id" } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicates.length === 0) {
      console.log('No more duplicate names found!');
    } else {
      console.log('Found duplicates:', JSON.stringify(duplicates, null, 2));
      // Optionally delete them keeping the first one
      let deleted = 0;
      for (const group of duplicates) {
        // Keep first doc, delete the rest
        const toDelete = group.docs.slice(1);
        const result = await User.deleteMany({ _id: { $in: toDelete } });
        deleted += result.deletedCount;
      }
      console.log(`Auto-cleaned ${deleted} exact name duplicates.`);
    }
    
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkDuplicates();
