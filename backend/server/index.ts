import express from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth';
import dotenv from 'dotenv';


dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});
// Public route
app.get('/api/public', (req, res) => {
  res.json({ message: 'Public endpoint' });
});

// Protected route
app.get('/api/protected', authenticate, (req, res) => {
  const user = (req as any).user;
  res.json({ 
    message: 'Protected endpoint', 
    user: {
      uid: user.uid,
      email: user.email
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});