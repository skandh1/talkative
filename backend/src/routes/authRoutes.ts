import { checkUsernameController, protectedEndPoint, publicEndPoint } from './../controllers/auth/authController';
import express from 'express';
import { googleAuth, setUsernameController, syncUserController } from '../controllers/auth/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get("/public", publicEndPoint)
router.get("/protected", authenticate, protectedEndPoint)
router.post("/sync-user", syncUserController)
router.post("/set-username", setUsernameController)
router.get("/check-username", checkUsernameController)
router.post('/google', googleAuth);

export default router;