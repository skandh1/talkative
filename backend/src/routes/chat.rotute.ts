import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticate as authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/conversations', ChatController.createOrGetConversation);
router.get('/conversations', ChatController.getUserConversations);
router.get('/conversations/:id/messages', ChatController.getMessages);
router.post('/messages', ChatController.sendMessage);
router.post('/mark-read', ChatController.markRead);

export default router;