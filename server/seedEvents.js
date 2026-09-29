const mongoose = require('mongoose');
const Event = require('./src/models/Event');
const User = require('./src/models/User');
require('dotenv').config({ path: './.env' });
require('node:dns').setServers(['8.8.8.8', '1.1.1.1']);

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find the admin user to use as organizer
    const admin = await User.findOne({ email: 'admin@cmrcet.ac.in' });
    if (!admin) {
      console.log('Admin user not found. Please create admin first.');
      process.exit(1);
    }

    const today = new Date();
    
    // Create an Upcoming Event (10 days from now)
    const upcomingDate = new Date();
    upcomingDate.setDate(today.getDate() + 10);
    
    // Create a Past Event (5 days ago)
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 5);

    const dummyEvents = [
      {
        title: 'CMRCET Global Alumni Reunion 2026',
        type: 'Reunion',
        date: upcomingDate,
        location: 'Main Auditorium, CMRCET Campus',
        description: 'Join us for the biggest event of the year! Reconnect with your batchmates, network with industry leaders, and celebrate the legacy of CMRCET.\n\n### Highlights:\n- Keynote by distinguished Alumni\n- Networking Dinner\n- Campus Tour',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        organizer: admin._id,
        attendees: [admin._id]
      },
      {
        title: 'Tech Talk: The Future of AI in Enterprise',
        type: 'Webinar',
        date: upcomingDate,
        location: 'Zoom Link (Sent upon RSVP)',
        description: 'A deep dive into how Artificial Intelligence is reshaping the tech industry. Hosted by our esteemed Alumni currently working at Google and Microsoft.\n\n**Prerequisites:** None. All students and alumni are welcome!',
        imageUrl: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        organizer: admin._id,
        attendees: [admin._id]
      },
      {
        title: 'Resume Building & Mock Interviews',
        type: 'Workshop',
        date: pastDate,
        location: 'Block C, Seminar Hall 2',
        description: 'Prepare for the upcoming placement season! Bring a physical copy of your resume. We will conduct live mock interviews and provide actionable feedback.',
        imageUrl: '',
        organizer: admin._id,
        attendees: [admin._id]
      }
    ];

    // Clear existing events to prevent duplicates if run multiple times
    await Event.deleteMany({});
    
    await Event.insertMany(dummyEvents);
    console.log('Successfully seeded 3 dummy events (2 upcoming, 1 past)!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedEvents();
