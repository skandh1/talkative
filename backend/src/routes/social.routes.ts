// server/routes/socialRoutes.ts
import express from 'express';
import * as socialController from '../controllers/social.controller';
import { authenticate as authMiddleware } from '../middleware/auth'; // IMPORTANT: You need an auth middleware

const router = express.Router();

// This middleware will protect all routes defined after it
// It should verify a token (e.g., JWT) and attach the user's data to `req.user`
router.use(authMiddleware);

// GET route to fetch all social data for the logged-in user
router.get('/', socialController.handleGetSocialData);

// POST routes to handle friend request actions
router.post('/friend-requests/:requestId/accept', socialController.handleAcceptFriendRequest);
router.post('/friend-requests/:requestId/reject', socialController.handleRejectFriendRequest);

// POST routes to handle follow request actions
router.post('/follow-requests/:requestId/accept', socialController.handleAcceptFollowRequest);
router.post('/follow-requests/:requestId/reject', socialController.handleRejectFollowRequest);


export default router;

// Example of how to use this router in your main server file (e.g., index.ts or app.ts)
/*
import express from 'express';
import socialRoutes from './routes/socialRoutes';

const app = express();
app.use(express.json());

// ... other middleware and routes

app.use('/api/social', socialRoutes);

// ... start server
*/
