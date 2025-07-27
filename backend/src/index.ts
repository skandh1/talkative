import express from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth';
import { connectDB } from './config/db';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration (adjust as needed)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Middleware
app.use(express.json());

// Security Headers (optional)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Database connection & server start
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});

// Routes
app.get('/api/public', (req, res) => {
  res.json({ message: 'Public endpoint' });
});

// Extend Express Request type for `user` (create a `types/express.d.ts` file)

// Protected route (now type-safe)
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


app.use('/api/users', userRoutes);