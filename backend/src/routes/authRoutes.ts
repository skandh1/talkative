import { checkUsernameController } from './../controllers/auth/authController';
import express from 'express';
import { googleAuth, setUsernameController, syncUserController } from '../controllers/auth/authController';

const router = express.Router();

// POST /api/auth/google
router.post("/sync-user", syncUserController)
router.post("/set-username", setUsernameController)
router.get("/check-username", checkUsernameController)
router.post('/google', googleAuth);

export default router;