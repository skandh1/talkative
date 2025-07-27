import express from 'express';
import { googleAuth } from '../controllers/auth/authController';

const router = express.Router();

// POST /api/auth/google
router.post('/google', googleAuth);

export default router;