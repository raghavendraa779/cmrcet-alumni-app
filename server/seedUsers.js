const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });
require('node:dns').setServers(['8.8.8.8', '1.1.1.1']);

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const students = [
      'Madikanti Sathwik', 'Md Rizwana', 'Modi Rakshitha', 'Md Nazeerulla', 
      'Muthe Sidhartha', 'Jayasri', 'Sindhura', 'R Ravichandra', 'R Abhiram'
    ].map(name => ({
      name,
      email: `${name.replace(/\s+/g, '').toLowerCase()}@cmrcet.ac.in`,
      password: hashedPassword,
      role: 'Student',
      branch: 'Computer Science (CSE)',
      currentYear: '3rd Year',
      batchYear: 2028, // Assuming 2026 is 3rd year, graduation in 2028
      isVerified: true
    }));

    const faculty = [
      { name: 'Mr Srinidhi Reddy', subject: 'Full Stack Development', designation: 'Assistant Professor' },
      { name: 'Mr B Shiva', subject: 'Design and Analysis of Algorithms', designation: 'Assistant Professor' },
      { name: 'Ms Sai Lakhmi Prasuna', subject: 'DevOps', designation: 'Assistant Professor' },
      { name: 'Ms U Sowjanya', subject: 'Computer Networks', designation: 'Assistant Professor' },
      { name: 'Ms J Sushma Rose', subject: 'Data Analytics', designation: 'Assistant Professor' },
      { name: 'Mr Shiva Skanda', subject: 'Computer Science', designation: 'Head of Department (HOD)' }
    ].map(f => ({
      name: f.name,
      email: `${f.name.replace(/[^a-zA-Z]/g, '').toLowerCase()}@cmrcet.ac.in`,
      password: hashedPassword,
      role: 'Faculty',
      department: 'Computer Science (CSE)',
      designation: f.designation,
      subject: f.subject,
      isVerified: true
    }));

    // Delete existing dummy students and faculty from previous seed (optional, but let's just insert to be safe, or just insert)
    // We will just insert them. If emails conflict, we might get an error.
    // Let's ensure emails are unique by appending a random string if needed, or just unique enough.
    
    // Clean up previous seed if any (only the ones we are about to add)
    const emailsToDelete = [...students.map(s => s.email), ...faculty.map(f => f.email)];
    await User.deleteMany({ email: { $in: emailsToDelete } });

    await User.insertMany([...students, ...faculty]);
    
    console.log('Successfully seeded Students and Faculty!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedUsers();
