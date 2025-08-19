// routes/userRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as userController from '../controllers/user/user.req.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Assuming you have an auth middleware that populates req.user
// --- User Relationship Endpoints ---

// Friends
router.post('/requests/friend/:targetUserId', authenticate, userController.sendFriendRequest);
router.put('/requests/friend/:requestId/accept', authenticate, userController.acceptFriendRequest);
router.put('/requests/friend/:requestId/reject', authenticate, userController.rejectFriendRequest);
router.delete('/requests/friend/:requestId/cancel', authenticate, userController.cancelFriendRequest);
router.post('/:targetUserId/add-friend', authenticate, userController.addFriend);
router.delete('/:targetUserId/unfriend', authenticate, userController.unfriend);

// Followers
router.post('/requests/follow/:targetUserId', authenticate, userController.sendFollowRequest);
router.delete('/requests/follow/:requestId/cancel', authenticate, userController.cancelFollowRequest);
router.post('/:targetUserId/follow', authenticate, userController.followUser);
router.delete('/:targetUserId/unfollow', authenticate, userController.unfollowUser);

export default router;
