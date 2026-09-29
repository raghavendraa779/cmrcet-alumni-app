const mongoose = require('mongoose');
const User = require('./src/models/User');
const News = require('./src/models/News');
const Job = require('./src/models/Job');
const Event = require('./src/models/Event');
require('dotenv').config({ path: './.env' });
require('node:dns').setServers(['8.8.8.8', '1.1.1.1']);
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for Extended Seeding...');

    // 1. Ensure we have an Admin
    let admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      console.log('No Admin found, run createAdmin.js first!');
      process.exit(1);
    }

    // 2. Create some realistic Alumni if they don't exist
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const alumniData = [
      {
        name: 'Priya Sharma', email: 'priya.sharma@gmail.com', password: hashedPassword,
        role: 'Alumni', batchYear: '2020', branch: 'CSE', company: 'Amazon',
        designation: 'SDE II', linkedInUrl: 'https://linkedin.com/in/dummy',
        isVerified: true,
        skills: ['AWS', 'Java', 'System Design'],
        bio: 'Passionate about building scalable backend systems. Happy to mentor juniors!'
      },
      {
        name: 'Rahul Verma', email: 'rahul.verma@gmail.com', password: hashedPassword,
        role: 'Alumni', batchYear: '2021', branch: 'ECE', company: 'Intel',
        designation: 'Hardware Engineer', linkedInUrl: 'https://linkedin.com/in/dummy',
        isVerified: true,
        skills: ['Verilog', 'VLSI', 'C++'],
        bio: 'Working on next-gen processors at Intel.'
      },
      {
        name: 'Anjali Desai', email: 'anjali.desai@gmail.com', password: hashedPassword,
        role: 'Alumni', batchYear: '2019', branch: 'CSE', company: 'Google',
        designation: 'Frontend Engineer', linkedInUrl: 'https://linkedin.com/in/dummy',
        isVerified: true,
        skills: ['React', 'TypeScript', 'Figma'],
        bio: 'Crafting beautiful UI experiences.'
      }
    ];

    let alumniUsers = [];
    for (const a of alumniData) {
      let existing = await User.findOne({ email: a.email });
      if (!existing) {
        existing = await User.create(a);
      }
      alumniUsers.push(existing);
    }
    console.log(`Prepared ${alumniUsers.length} Alumni Profiles.`);

    // 3. Clear existing dummy content to prevent duplicates on multiple runs (optional)
    await News.deleteMany({});
    await Job.deleteMany({});
    await Event.deleteMany({});

    // 4. Seed News
    const newsData = [
      {
        title: '🚀 CMRCET Tech Fest 2026 Announced!',
        content: `Get ready for the biggest technical symposium of the year! \n\n## Highlights\n* **24-hour Hackathon** sponsored by AWS.\n* **Robo-Wars** arena.\n* Keynote speech by our distinguished alumni.\n\n### Registration\nRegistrations open next week. Form teams of 4!`,
        author: admin._id,
        category: 'Events',
        isPinned: true,
        targetRole: 'All',
        targetBranch: 'All',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        views: 342,
      },
      {
        title: '💡 Placement Drive: TCS Digital',
        content: `TCS is visiting our campus for the Digital profile next month.\n\n**Eligibility Criteria:**\n* B.Tech (CSE, ECE, IT) 2027 batch.\n* Minimum 70% or 7.0 CGPA throughout.\n* No active backlogs.\n\nStart preparing your DSA and System Design concepts!`,
        author: admin._id,
        category: 'Placements',
        targetRole: 'Student',
        targetBranch: 'All',
        views: 890,
      },
      {
        title: 'New AI Research Lab Inaugurated',
        content: `We are thrilled to announce the opening of the advanced AI/ML computing lab in block B. It is equipped with **8 NVIDIA A100 GPUs** for students working on their final year deep learning projects.\n\nReach out to your HOD for access guidelines.`,
        author: admin._id,
        category: 'Academics',
        imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
      }
    ];
    await News.insertMany(newsData);
    console.log('Seeded News.');

    // 5. Seed Jobs
    const jobData = [
      {
        title: 'Software Development Engineer Intern (Summer 2027)',
        company: 'Amazon',
        location: 'Hyderabad / Bangalore',
        type: 'Internship',
        description: `We are hiring SDE Interns for Summer 2027!\n\n**Responsibilities:**\n* Design, develop, and test software solutions.\n* Collaborate with experienced engineers.\n\n**Requirements:**\n* Strong understanding of Data Structures and Algorithms.\n* Proficiency in Java, C++, or Python.`,
        applyLink: 'https://amazon.jobs',
        author: alumniUsers[0]._id, // Priya Sharma
        experienceLevel: 'Entry',
        workMode: 'Hybrid',
      },
      {
        title: 'Frontend Developer (React)',
        company: 'Google',
        location: 'Bangalore, India',
        type: 'Full-time',
        description: `Join our team to build next-generation web applications.\n\n**What you'll do:**\n* Build robust UIs using React and TypeScript.\n* Optimize application performance.\n\nI am happy to provide referrals for CMRCET students who are a good fit. Message me on this platform!`,
        applyLink: 'https://careers.google.com',
        author: alumniUsers[2]._id, // Anjali Desai
        experienceLevel: 'Mid',
        workMode: 'On-site',
      }
    ];
    await Job.insertMany(jobData);
    console.log('Seeded Jobs.');

    // 6. Seed Events
    const eventData = [
      {
        title: 'Alumni Mentorship Weekend',
        type: 'Meetup',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        location: 'CMRCET Main Auditorium',
        description: `Join us for a weekend of 1-on-1 mentorship sessions with our most successful alumni.\n\n**Schedule:**\n* 10:00 AM - Keynote Address\n* 11:30 AM - Resume Review Sessions\n* 2:00 PM - Mock Interviews\n\nPlease RSVP to secure your spot!`,
        organizer: admin._id,
        imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&q=80',
      },
      {
        title: 'Intro to Cloud Computing via AWS',
        type: 'Webinar',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        location: 'Online (Zoom link will be emailed)',
        description: `Priya Sharma (SDE II at Amazon) will be hosting an introductory session on AWS Core Services (EC2, S3, Lambda).\n\nPerfect for 2nd and 3rd-year students looking to get certified!`,
        organizer: alumniUsers[0]._id, // Priya
      },
      {
        title: 'Class of 2019 Reunion',
        type: 'Reunion',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago (Past event)
        location: 'Campus Grounds',
        description: `It's been 5 years! Come back to campus, meet your old professors, and catch up with friends.`,
        organizer: admin._id,
      }
    ];
    await Event.insertMany(eventData);
    console.log('Seeded Events.');

    console.log('✅ Extended Database Seeding Complete!');
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
