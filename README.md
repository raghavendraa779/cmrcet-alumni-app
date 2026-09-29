# CMR Alumni Network Platform

A comprehensive full-stack platform designed to connect CMR College of Engineering & Technology alumni, students, and faculty.

## Features

- **Role-Based Dashboards:** Unique views and capabilities for Students, Alumni, Faculty, and Admins.
- **Community Directory:** Searchable directory with filters for branch, batch, and role.
- **News Feed:** Markdown-supported announcements with audience targeting, pinning, likes, and comments.
- **Career Board:** Job and internship postings with a Saved Jobs feature.
- **Events System:** RSVPs for webinars, meetups, and reunions.
- **Real-Time Messaging:** Socket.io powered 1-on-1 direct messaging.
- **Mentorship System:** Students can request mentorship from verified alumni.
- **Global Search:** Cross-collection search for users, posts, and jobs.
- **Admin Command Center:** Content moderation, verification queue, and platform analytics.
- **Security:** Rate limiting, helmet headers, JWT auth, input validation, and protected routes.

## Tech Stack

**Frontend:** React 19, Vite, Redux Toolkit, Tailwind CSS v4, Lucide React, React Markdown.
**Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, Multer, JWT, bcrypt.

## Quick Start

### 1. Environment Setup

Create a `.env` file in the `server` directory (see `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cmralumni
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Run the Application

Start both servers concurrently:

```bash
# Terminal 1 (Backend)
cd server
npm run dev

# Terminal 2 (Frontend)
cd client
npm run dev
```

### 4. Admin Setup

To seed the initial Admin account:
```bash
cd server
node createAdmin.js
```

## Security & Performance Highlights
- Database optimized with tailored indexes
- Pagination on all heavy list endpoints
- Real-time features securely authenticated via JWT in handshake
- Cascade deletion to prevent orphaned documents
