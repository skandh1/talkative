import { Notification } from './../models/Notification.model';
// server/services/socialService.ts
import { User, FriendRequest, FollowRequest } from '../models/User'; // Adjust path to your models
import mongoose from 'mongoose';

// Helper to select basic user fields for population
const userBasicInfoFields = '_id username profilePic isOnline';

/**
 * Fetches all social data for a given user.
 * @param userId - The ID of the user.
 * @returns An object containing friends, followers, following, and pending requests.
 */
export const getSocialData = async (userId: string) => {
  const user = await User.findById(userId)
    .populate('friends', userBasicInfoFields)
    .populate('followers', userBasicInfoFields)
    .populate('following', userBasicInfoFields)
    .exec();

  if (!user) {
    throw new Error('User not found');
  }

  const friendRequests = await FriendRequest.find({
    receiver: userId,
    status: 'pending',
  }).populate('sender', userBasicInfoFields);

  const followRequests = await FollowRequest.find({
    receiver: userId,
    status: 'pending',
  }).populate('sender', userBasicInfoFields);

  return {
    friends: user.friends,
    followers: user.followers,
    following: user.following,
    friendRequests,
    followRequests,
  };
};

/**
 * Accepts a friend request.
 * @param currentUserId - The user accepting the request.
 * @param requestId - The ID of the friend request.
 */
// export const acceptFriendRequest = async (currentUserId: string, requestId: string) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       const request = await FriendRequest.findById(requestId).session(session);
//       console.log(request, request.receiver.toString(), currentUserId.toString())
//         if (!request || request.receiver.toString() !== currentUserId.toString() || request.status !== 'pending') {
//             throw new Error('Friend request not found or invalid.');
//         }

//         const senderId = request.sender;

//         // Update users
//         await User.findByIdAndUpdate(currentUserId, { $addToSet: { friends: senderId }, $pull: { pendingFriendRequests: requestId } }).session(session);
//         await User.findByIdAndUpdate(senderId, { $addToSet: { friends: currentUserId } }).session(session);

//         // Update request status
//         request.status = 'accepted';
//         await request.save({ session });

//         // Create notification for the original sender
//         await Notification.create([{
//             recipient: senderId,
//             sender: currentUserId,
//             type: 'friend_accepted',
//             content: 'has accepted your friend request.',
//             relatedId: request._id,
//         }], { session });

//         await session.commitTransaction();
//         return { success: true, message: 'Friend request accepted.' };
//     } catch (error) {
//         await session.abortTransaction();
//         throw error;
//     } finally {
//         session.endSession();
//     }
// };

/**
 * Rejects a friend request.
 * @param currentUserId - The user rejecting the request.
 * @param requestId - The ID of the friend request.
 */
export const rejectFriendRequest = async (currentUserId: string, requestId: string) => {
  const request = await FriendRequest.findById(requestId);
  if (!request || request.receiver.toString() !== currentUserId || request.status !== 'pending') {
    throw new Error('Friend request not found or invalid.');
  }

  request.status = 'rejected';
  await request.save();

  await User.findByIdAndUpdate(currentUserId, { $pull: { pendingFriendRequests: requestId } });

  // Optional: You might not want to notify on rejection.
  // await Notification.create(...)

  return { success: true, message: 'Friend request rejected.' };
};


/**
 * Accepts a follow request.
 * @param currentUserId - The user accepting the request.
 * @param requestId - The ID of the follow request.
 */
export const acceptFollowRequest = async (currentUserId: string, requestId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const request = await FollowRequest.findById(requestId).session(session);
    if (!request || request.receiver.toString() !== currentUserId || request.status !== 'pending') {
      throw new Error('Follow request not found or invalid.');
    }

    const requesterId = request.sender;

    // Update users: Add requester to current user's followers, and current user to requester's following
    await User.findByIdAndUpdate(currentUserId, { $addToSet: { followers: requesterId }, $pull: { pendingFollowRequests: requestId } }).session(session);
    await User.findByIdAndUpdate(requesterId, { $addToSet: { following: currentUserId } }).session(session);

    // Update request status
    request.status = 'accepted';
    await request.save({ session });

    // Create notification
    await Notification.create([{
      recipient: requesterId,
      sender: currentUserId,
      type: 'follow_accepted',
      content: 'has started following you back.',
      relatedId: request._id,
    }], { session });

    await session.commitTransaction();
    return { success: true, message: 'Follow request accepted.' };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Rejects a follow request.
 * @param currentUserId - The user rejecting the request.
 * @param requestId - The ID of the follow request.
 */
export const rejectFollowRequest = async (currentUserId: string, requestId: string) => {
  const request = await FollowRequest.findById(requestId);
  if (!request || request.receiver.toString() !== currentUserId || request.status !== 'pending') {
    throw new Error('Follow request not found or invalid.');
  }

  request.status = 'rejected';
  await request.save();

  await User.findByIdAndUpdate(currentUserId, { $pull: { pendingFollowRequests: requestId } });

  return { success: true, message: 'Follow request rejected.' };
};
