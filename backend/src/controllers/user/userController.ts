import { Request, Response } from 'express';
import { User, IUser } from '../../models/User';
import mongoose from 'mongoose';

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const userData: IUser = req.body;
    const newUser = await User.create(userData);
    res.status(201).json(newUser);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('favs', 'username profilePic')
      .populate('friends', 'username profilePic')
      .populate('blocked', 'username')
      .populate('clubs', 'name');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in getUserById:", error); // 👈 Log the full error
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Delete user (soft delete by changing status)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profileStatus: 'deleted' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User marked as deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all active users with pagination
export const getActiveUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ profileStatus: 'active' })
      .skip(skip)
      .limit(limit)
      .select('-friends -blocked -favs -clubs'); // Exclude heavy fields

    const total = await User.countDocuments({ profileStatus: 'active' });

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add/remove favorite user
export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { targetUserId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const favIndex = user.favs.indexOf(new mongoose.Types.ObjectId(targetUserId));
    if (favIndex === -1) {
      user.favs.push(targetUserId);
    } else {
      user.favs.splice(favIndex, 1);
    }

    await user.save();
    res.json(user.favs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};