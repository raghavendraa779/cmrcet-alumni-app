require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { notFound } = require('./src/middleware/errorHandler');
const { errorHandler } = require('./src/middleware/errorMiddleware');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(helmet());
app.use(express.json());

// Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter, require('./src/routes/authRoutes'));
app.use('/api/news', require('./src/routes/newsRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));
app.use('/api/jobs', require('./src/routes/jobRoutes'));
app.use('/api/events', require('./src/routes/eventRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));

// New feature routes (will be created by other agents)
try { app.use('/api/notifications', require('./src/routes/notificationRoutes')); } catch(e) {}
try { app.use('/api/mentorship', require('./src/routes/mentorshipRoutes')); } catch(e) {}
try { app.use('/api/search', require('./src/routes/searchRoutes')); } catch(e) {}
try { app.use('/api/saved-jobs', require('./src/routes/savedJobRoutes')); } catch(e) {}
try { app.use('/api/reports', require('./src/routes/reportRoutes')); } catch(e) {}
try { app.use('/api/analytics', require('./src/routes/analyticsRoutes')); } catch(e) {}

// Make uploads folder static
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('College Alumni Management API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// HTTP Server and Socket.io Setup
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Store connected users mapping (userId -> socketId)
const connectedUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('setup', (data) => {
    let userId = socket.userId;
    
    socket.join(userId);
    connectedUsers.set(userId, socket.id);
    socket.emit('connected');
    console.log(`User ${userId} joined room`);
  });

  // Handle joining a specific chat room (optional, but good for typing indicators)
  socket.on('join_chat', (room) => {
    socket.join(room);
  });

  // Handle sending a message
  socket.on('new_message', (newMessageRecieved) => {
    const receiverId = newMessageRecieved.receiver;
    if (!receiverId) return console.log('receiverId not defined');

    // Emit the message directly to the receiver's personal room
    socket.in(receiverId).emit('message_received', newMessageRecieved);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove from connected users map
    for (let [key, value] of connectedUsers.entries()) {
      if (value === socket.id) {
        connectedUsers.delete(key);
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});
