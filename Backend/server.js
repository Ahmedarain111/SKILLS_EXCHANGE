import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Database connection
import connectDB from './config/database.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import skillRoutes from './routes/skills.js';
import exchangeRoutes from './routes/exchanges.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io for real-time messaging
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-exchange', (exchangeId) => {
    socket.join(exchangeId);
  });

  socket.on('send-message', async (data) => {
    try {
      const Message = (await import('./models/message.js')).default;
      const message = new Message(data);
      await message.save();
      
      // Populate sender info before sending
      await message.populate('sender', 'name avatar');
      
      io.to(data.exchangeId).emit('new-message', message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Serve frontend for all other routes - place this AFTER all your API routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.MONGODB_URI?.includes('localhost') ? 'Local MongoDB' : 'MongoDB Atlas'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

