import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import dotenv from 'dotenv';
dotenv.config();

import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import settings from "./routes/settings.router"
import userReqRoutes from "./routes/userReqRoutes"
import notification from "./routes/notification.routes"
import social from "./routes/social.routes"

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Middleware
app.use(express.json());

// Enhanced Security Headers
app.use((req, res, next) => {
  // Relax COOP for Firebase Auth to work properly
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  
  // Keep other security headers
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use("/api", settings)
app.use('/api/users', userRoutes);
app.use('/api/users', userReqRoutes);
app.use("/api/notifications", notification)
app.use("/api/social", social)

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

startServer();