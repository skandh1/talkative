// routes/userRoutes.ts - Updated with missing endpoints
import { Router } from 'express';
import * as userController from '../controllers/user/user.req.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// --- User Relationship Endpoints ---

// Friends
console.log("1")
router.get("/requests/:targetUserId/relationship", authenticate, userController.getRelationship);
router.post('/requests/friend/:targetUserId', authenticate, userController.sendFriendRequest);
router.put('/requests/friend/:requestId/accept', authenticate, userController.acceptFriendRequest);
router.put('/requests/friend/:requestId/reject', authenticate, userController.rejectFriendRequest);
router.delete('/requests/friend/:requestId/cancel', authenticate, userController.cancelFriendRequest);
router.post('/:targetUserId/add-friend', authenticate, userController.addFriend);
router.delete('/:targetUserId/unfriend', authenticate, userController.unfriend);

// Followers - Add the missing endpoints
router.get("/requests/:targetUserId/follow-relationship", authenticate, userController.getFollowRelationship);
router.post('/requests/follow/:targetUserId', authenticate, userController.sendFollowRequest);
router.put('/requests/follow/:requestId/accept', authenticate, userController.acceptFollowRequest);
router.put('/requests/follow/:requestId/reject', authenticate, userController.rejectFollowRequest);
router.delete('/requests/follow/:requestId/cancel', authenticate, userController.cancelFollowRequest);
router.post('/:targetUserId/follow', authenticate, userController.followUser);
router.delete('/:targetUserId/unfollow', authenticate, userController.unfollowUser);

export default router;