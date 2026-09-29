const mongoose = require('mongoose');
const User = require('./src/models/User');
const News = require('./src/models/News');
require('dotenv').config({ path: './.env' });
require('node:dns').setServers(['8.8.8.8', '1.1.1.1']);

const seedRealNews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for Real News Seeding...');

    // 1. Get an Admin to author the news
    let admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      console.log('No Admin found!');
      process.exit(1);
    }

    // 2. Real News Data
    const realNewsData = [
      {
        title: '🌟 CMR Thinkfest 3.0 Concludes Successfully',
        content: `CMRCET recently hosted the third edition of **"CMR Thinkfest 3.0"**, our national-level project competition. \n\nThe event aimed to promote multidisciplinary innovation among students from various institutions across the country. We saw over 500+ participants showcasing incredible projects in AI, IoT, and sustainable engineering.\n\nCongratulations to all the winners!`,
        author: admin._id,
        category: 'Events',
        isPinned: false,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      },
      {
        title: '🏆 CMR Group Receives 4-Star Rating from MHRD',
        content: `We are proud to announce that the CMR Group’s Institute Innovation Cell (IIC) has received a prestigious **4-star rating** from the Ministry of Human Resource Development (MHRD).\n\nThis highlights our institution's relentless culture of innovation, entrepreneurship, and research excellence. Thank you to the faculty and students who made this possible!`,
        author: admin._id,
        category: 'Academics',
        isPinned: true,
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
      },
      {
        title: '📈 NIRF 2026 Rankings Announced',
        content: `The institution continues to be recognized in national rankings. CMR Group institutions were successfully placed in the **201–300 band in the NIRF 2026 Engineering category**.\n\nOur focus continues to be on improving academic outcomes, research publications, and placement quality to climb even higher next year.`,
        author: admin._id,
        category: 'General',
        isPinned: false,
      }
    ];

    await News.insertMany(realNewsData);
    console.log('✅ Real News Seeded Successfully!');
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedRealNews();
