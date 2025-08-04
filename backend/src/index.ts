import express from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth';
import { connectDB } from './config/db';
import dotenv from 'dotenv';
dotenv.config();

import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';

// Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Middleware
app.use(express.json());

// Security Headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Routes
app.get('/api/public', (req, res) => {
  res.json({ message: 'Public endpoint' });
});

// Protected route
app.get('/api/protected', authenticate, (req, res) => {
  if (!req.user) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json({
    message: 'Protected endpoint',
    user: {
      uid: req.user.uid,
      email: req.user.email,
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Database connection & server start
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

console.log("hii")

startServer();