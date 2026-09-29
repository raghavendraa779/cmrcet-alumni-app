const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config({ path: './.env' });
require('node:dns').setServers(['8.8.8.8', '1.1.1.1']);

const deleteDuplicates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // These were the incomplete emails generated on the first failed run
    const emailsToDelete = [
      'madikanti@cmrcet.ac.in', 
      'md@cmrcet.ac.in', 
      'modi@cmrcet.ac.in'
    ];
    
    const result = await User.deleteMany({ email: { $in: emailsToDelete } });
    console.log(`Deleted ${result.deletedCount} duplicate users successfully.`);
    
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

deleteDuplicates();
