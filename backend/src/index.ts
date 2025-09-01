
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { WSServer } from './ws/server';
import { connectDB } from './config/db'; // Assuming this function exists

// Load environment variables



const app = express();
const server = createServer(app);

// Use CORS configuration from the first snippet
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware from both snippets
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Enhanced Security Headers from the second snippet
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Import and use all routes from both snippets
import chatRoutes from './routes/chat.rotute';
import callRoutes from './routes/call.routes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import settings from './routes/settings.router';
import userReqRoutes from './routes/userReqRoutes';
import notification from './routes/notification.routes';

app.use('/api/chat', chatRoutes);
app.use('/api/call', callRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', userReqRoutes);
app.use('/api', settings);
app.use('/api/notifications', notification);

// Health check endpoint from the first snippet
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize WebSocket server from the first snippet
const wsServer = new WSServer(server);

// Database connection & server start
const startServer = async () => {
  try {
    // Using the more robust connectDB function from the second snippet
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Start the HTTP/WebSocket server
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown from the first snippet
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  wsServer.close();
  mongoose.connection.close();
  server.close();
});