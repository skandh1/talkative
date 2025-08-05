import express from 'express';
import {
  createUser,
  getUserById,
  updateMyProfile,
  deleteUser,
  getActiveUsers,
  toggleFavorite,
  getCurrentUser,
  getUserName
} from '../controllers/user/userController';
import { authenticate } from '../middleware/auth';
import { validate, updateProfileSchema } from '../validators/profile.validator';

const router = express.Router();

// Public routes
router.post('/', createUser);
router.get('/active', getActiveUsers);

// Protected routes (require authentication)
router.use(authenticate);
router.get("/me", getCurrentUser)
// router.get("/u/:id", getCurrentUser)
router.put(
  '/update',
  validate(updateProfileSchema),
  updateMyProfile
);

router.get("/search", getUserName)
router.delete('/:id', deleteUser); // Consider adding additional logic to ensure users can only delete their own accounts
router.post('/:userId/favorites', toggleFavorite);
router.get('/find/:id', getUserById);

export default router;