import express from 'express';
import {
  createUser,
  updateMyProfile,
  deleteUser,
  getActiveUsers,
  toggleFavorite,
  getCurrentUser,
  getUserName,
  getUserProfile
} from '../controllers/user/userController';
import { checkUsernameController } from '../controllers/auth/authController';
import { authenticate } from '../middleware/auth';
import { validate, updateProfileSchema } from '../validators/profile.validator';

const router = express.Router();

// Public routes
router.post('/', createUser);
router.get('/active', getActiveUsers);
router.get('/check-username', checkUsernameController); // New route to check for username availability

// Protected routes (require authentication)
router.use(authenticate);
router.get("/me", getCurrentUser);

// Profile routes to get a user by ID or username
router.get('/id/:identifier', getUserProfile);
router.get('/username/:identifier', getUserProfile);

router.put(
  '/update',
  validate(updateProfileSchema),
  updateMyProfile
);

router.get("/search", getUserName);
router.delete('/:id', deleteUser); // Consider adding additional logic to ensure users can only delete their own accounts
router.post('/:userId/favorites', toggleFavorite);


export default router;
