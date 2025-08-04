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
    console.log("user -> ", req.user)
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
export const updateMyProfile = async (req: Request, res: Response) => {
  // Get the email from the decoded Firebase token attached by the middleware.
  const userEmail = req.user?.email;

  // Add a check to ensure an email exists in the token.
  if (!userEmail) {
    return res.status(400).json({
      success: false,
      message: 'Valid email not found in authentication token.'
    });
  }

  const { username, age, profilePic, about, gender, topics } = req.body;

  try {
    // 💡 KEY CHANGE: Find the user in MongoDB using their email address.
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in our database.' });
    }

    // --- Username Change Logic ---
    if (username && username !== user.username) {
      // This logic remains exactly the same.
      if (user.usernameLastUpdatedAt) {
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const timeSinceLastUpdate = new Date().getTime() - user.usernameLastUpdatedAt.getTime();

        if (timeSinceLastUpdate < twentyFourHours) {
          const hoursLeft = Math.floor((twentyFourHours - timeSinceLastUpdate) / (1000 * 60 * 60));
          return res.status(403).json({
            success: false,
            message: `You can only change your username once every 24 hours. Please try again in ${hoursLeft}h.`,
          });
        }
      }

      const existingUser = await User.findOne({ username });
      // Important: Ensure the found user isn't the current user.
      if (existingUser && existingUser.id !== user.id) {
        return res.status(409).json({ success: false, message: 'Username is already taken' });
      }

      user.username = username;
      user.usernameLastUpdatedAt = new Date();
    }

    // --- Update Other Fields (This logic remains the same) ---
    if (age !== undefined) user.age = age;
    if (profilePic !== undefined) user.profilePic = profilePic;
    if (about !== undefined) user.about = about;
    if (gender !== undefined) user.gender = gender;
    if (topics !== undefined) user.topics = topics;

    const updatedUser = await user.save();

    // The response logic also remains the same.
    

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error while updating profile' });
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

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email
    const user = await User.findOne({ email: userEmail });
    return res.status(200).json({ user })
  } catch (e) {
    console.error(e)
  }
}