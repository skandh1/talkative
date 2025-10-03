import { Router } from 'express';
import { CallController } from '../controllers/call.controller';
import { authenticate as authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/start', CallController.startCall);
router.post('/accept', CallController.acceptCall);
router.post('/decline', CallController.declineCall);
router.post('/cancel', CallController.cancelCall);
router.post('/end', CallController.endCall);

export default router;