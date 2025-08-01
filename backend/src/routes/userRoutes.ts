import express from 'express';
import {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getActiveUsers,
  toggleFavorite
} from '../controllers/user/userController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/', createUser);
router.get('/active', getActiveUsers);

// Protected routes (require authentication)
router.use(authenticate);

router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:userId/favorites', toggleFavorite);

export default router;