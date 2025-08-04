import express from 'express';
import {
  createUser,
  getUserById,
  updateMyProfile,
  deleteUser,
  getActiveUsers,
  toggleFavorite
} from '../controllers/user/userController';
import { authenticate } from '../middleware/auth';
import { validate, updateProfileSchema } from '../validators/profile.validator';

const router = express.Router();

// Public routes
router.post('/', createUser);
router.get('/active', getActiveUsers);

// Protected routes (require authentication)
router.use(authenticate);
router.get('/:id', getUserById);
router.patch(
  '/me',
  validate(updateProfileSchema),
  updateMyProfile
);
router.delete('/:id', deleteUser); // Consider adding additional logic to ensure users can only delete their own accounts
router.post('/:userId/favorites', toggleFavorite);

export default router;