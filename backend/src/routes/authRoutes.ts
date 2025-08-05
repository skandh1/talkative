import express from 'express';
import { googleAuth, syncUserController } from '../controllers/auth/authController';

const router = express.Router();

// POST /api/auth/google
router.post("/sync-user", syncUserController)
router.post('/google', googleAuth);

export default router;