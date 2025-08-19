// src/services/user.req.services.ts

import { User, FriendRequest, FollowRequest, IUser } from '../models/User';
import { Notification } from '../models/Notification.model'; // Import the new Notification model
import mongoose from 'mongoose';

// Utility function to find users
const findUsers = async (currentUserId: string, targetUserId: string) => {
    if (!currentUserId || !targetUserId) {
        throw new Error('User IDs are required.');
    }
    const [currentUser, targetUser] = await Promise.all([
        User.findById(currentUserId).populate('pendingFriendRequests pendingFollowRequests'),
        User.findById(targetUserId).populate('pendingFriendRequests pendingFollowRequests')
    ]);
    if (!currentUser || !targetUser) {
        throw new Error('One or both users not found.');
    }
    return { currentUser, targetUser };
};

// **Service: sendFriendRequest**
export const sendFriendRequest = async (currentUserId: string, targetUserId: string) => {
    const { currentUser, targetUser } = await findUsers(currentUserId, targetUserId);

    // Check if a request already exists
    const existingRequest = await FriendRequest.findOne({
        $or: [
            { sender: currentUserId, receiver: targetUserId },
            { sender: targetUserId, receiver: currentUserId }
        ]
    });
    if (existingRequest) {
        throw new Error('A friend request already exists.');
    }

    // Check privacy settings
    const allowRequestsFrom = targetUser.settings.privacy.allowFriendRequestsFrom;
    const isAlreadyFollowing = currentUser.following.some(id => id.toString() === targetUserId);

    if (allowRequestsFrom === 'no_one' || (allowRequestsFrom === 'followers' && !isAlreadyFollowing)) {
        throw new Error('This user does not accept friend requests from you.');
    }

    const newRequest = await FriendRequest.create({
        sender: currentUserId,
        receiver: targetUserId
    });

    targetUser.pendingFriendRequests.push(newRequest._id as mongoose.Types.ObjectId);
    await targetUser.save();

    // *** Create a notification for the recipient ***
    await Notification.create({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'friend_request',
        content: `${currentUser.displayName || currentUser.username} sent you a friend request.`,
        relatedId: newRequest._id,
    });

    return newRequest;
};

// **Service: acceptFriendRequest**
export const acceptFriendRequest = async (currentUserId: string, requestId: string) => {
    const request = await FriendRequest.findById(requestId);
    const requestReceiver = request.receiver.toString();
    const currentUserIdString = currentUserId.toString();

    if (!request || requestReceiver !== currentUserIdString) {
        throw new Error('Request not found or you are not the receiver.');
    }
    console.log("hi")
    if (request.status !== 'pending') {
        throw new Error('Request is not pending.');
    }

    request.status = 'accepted';
    await request.save();

    const [requester, receiver] = await Promise.all([
        User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } }, { new: true }),
        User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender }, $pull: { pendingFriendRequests: requestId } }, { new: true }),
    ]);

    if (!requester || !receiver) {
        throw new Error('Could not update users.');
    }

    // *** Create a notification for the requester ***
    await Notification.create({
        recipient: request.sender,
        sender: request.receiver,
        type: 'friend_accepted',
        content: `${receiver.displayName || receiver.username} accepted your friend request.`,
        relatedId: request._id,
    });

    return { requester, receiver };
};

// **Service: rejectFriendRequest**
export const rejectFriendRequest = async (currentUserId: string, requestId: string) => {
    const request = await FriendRequest.findById(requestId);
    const requestReceiver = request.receiver.toString();
    const currentUserIdString = currentUserId.toString();

    if (!request || requestReceiver !== currentUserIdString) {
        throw new Error('Request not found or you are not the receiver.');
    }
    if (request.status !== 'pending') {
        throw new Error('Request is not pending.');
    }

    request.status = 'rejected';
    await request.save();

    // Remove the request from the receiver's pending list
    await User.findByIdAndUpdate(currentUserId, { $pull: { pendingFriendRequests: requestId } });

    // *** Create a notification for the requester ***
    const receiverUser = await User.findById(currentUserId);
    await Notification.create({
        recipient: request.sender,
        sender: currentUserId,
        type: 'friend_rejected',
        content: `${receiverUser.displayName || receiverUser.username} rejected your friend request.`,
        relatedId: request._id,
    });

    return { message: 'Request rejected successfully.' };
};

// **Service: cancelFriendRequest**
export const cancelFriendRequest = async (currentUserId: string, requestId: string) => {
    const request = await FriendRequest.findById(requestId);
    const requestReceiver = request.receiver.toString();
    const currentUserIdString = currentUserId.toString();

    if (!request || requestReceiver !== currentUserIdString) {
        throw new Error('Request not found or you are not the receiver.');
    }
    await Promise.all([
        User.findByIdAndUpdate(request.receiver, { $pull: { pendingFriendRequests: requestId } }),
        FriendRequest.findByIdAndDelete(requestId)
    ]);

    return { message: 'Request cancelled successfully.' };
};

// **Service: addFriend**
export const addFriend = async (currentUserId: string, targetUserId: string) => {
    const { currentUser, targetUser } = await findUsers(currentUserId, targetUserId);
    if (currentUser.friends.some(id => id.toString() === targetUserId)) {
        throw new Error('You are already friends with this user.');
    }

    const [updatedCurrentUser, updatedTargetUser] = await Promise.all([
        User.findByIdAndUpdate(currentUserId, { $addToSet: { friends: targetUserId } }, { new: true }),
        User.findByIdAndUpdate(targetUserId, { $addToSet: { friends: currentUserId } }, { new: true })
    ]);
    return { updatedCurrentUser, updatedTargetUser };
};

// **Service: unfriend**
export const unfriend = async (currentUserId: string, targetUserId: string) => {
    const { currentUser, targetUser } = await findUsers(currentUserId, targetUserId);
    if (!currentUser.friends.some(id => id.toString() === targetUserId)) {
        throw new Error('You are not friends with this user.');
    }

    await Promise.all([
        User.findByIdAndUpdate(currentUserId, { $pull: { friends: targetUserId } }),
        User.findByIdAndUpdate(targetUserId, { $pull: { friends: currentUserId } })
    ]);
    return { message: 'Unfriended successfully.' };
};

// **Service: followUser (Public Profile)**
export const followUser = async (currentUserId: string, targetUserId: string) => {
    const { currentUser, targetUser } = await findUsers(currentUserId, targetUserId);
    if (currentUser.following.some(id => id.toString() === targetUserId)) {
        throw new Error('You are already following this user.');
    }

    if (targetUser.settings.privacy.profileType === 'public') {
        await Promise.all([
            User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } }),
            User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } })
        ]);

        // *** Create a notification for the followed user ***
        await Notification.create({
            recipient: targetUserId,
            sender: currentUserId,
            type: 'follow_accepted', // Direct follow on public profile is considered an 'accepted' action
            content: `${currentUser.displayName || currentUser.username} started following you.`,
            relatedId: currentUserId, // You can link to the follower's ID
        });

        return { message: 'Followed user successfully.' };
    } else {
        throw new Error('This is a private profile. A follow request must be sent.');
    }
};

// **Service: unfollowUser**
export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
    const { currentUser, targetUser } = await findUsers(currentUserId, targetUserId);
    if (!currentUser.following.some(id => id.toString() === targetUserId)) {
        throw new Error('You are not following this user.');
    }

    await Promise.all([
        User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } }),
        User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } })
    ]);
    return { message: 'Unfollowed user successfully.' };
};

// **Service: sendFollowRequest**
export const sendFollowRequest = async (currentUserId: string, targetUserId: string) => {
    const { currentUser, targetUser } = await findUsers(currentUserId, targetUserId);
    if (targetUser.settings.privacy.profileType === 'public') {
        throw new Error('Cannot send a follow request to a public profile. Use the direct follow action.');
    }

    const existingRequest = await FollowRequest.findOne({ requester: currentUserId, targetUser: targetUserId });
    if (existingRequest) {
        throw new Error('A follow request has already been sent.');
    }

    const newRequest = await FollowRequest.create({ requester: currentUserId, targetUser: targetUserId });
    targetUser.pendingFollowRequests.push(newRequest._id as mongoose.Types.ObjectId);
    await targetUser.save();

    // *** Create a notification for the recipient ***
    await Notification.create({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'follow_request',
        content: `${currentUser.displayName || currentUser.username} sent you a follow request.`,
        relatedId: newRequest._id,
    });

    return newRequest;
};

// **Service: cancelFollowRequest**
export const cancelFollowRequest = async (currentUserId: string, requestId: string) => {
    const request = await FollowRequest.findById(requestId);
    const requestReceiver = request.receiver.toString();
    const currentUserIdString = currentUserId.toString();

    if (!request || requestReceiver !== currentUserIdString) {
        throw new Error('Request not found or you are not the receiver.');
    }

    await Promise.all([
        User.findByIdAndUpdate(request.targetUser, { $pull: { pendingFollowRequests: requestId } }),
        FollowRequest.findByIdAndDelete(requestId)
    ]);

    return { message: 'Follow request cancelled.' };
};

// **Service: acceptFollowRequest**
export const acceptFollowRequest = async (currentUserId: string, requestId: string) => {
    const request = await FollowRequest.findById(requestId);
    const requestReceiver = request.receiver.toString();
    const currentUserIdString = currentUserId.toString();

    if (!request || requestReceiver !== currentUserIdString) {
        throw new Error('Request not found or you are not the receiver.');
    }

    if (request.status !== 'pending') {
        throw new Error('Request is not pending.');
    }

    request.status = 'accepted';
    await request.save();

    const [follower, following] = await Promise.all([
        User.findByIdAndUpdate(request.requester, { $addToSet: { following: request.targetUser } }),
        User.findByIdAndUpdate(request.targetUser, { $addToSet: { followers: request.requester }, $pull: { pendingFollowRequests: requestId } }),
    ]);

    if (!follower || !following) {
        throw new Error('Could not update users.');
    }

    // *** Create a notification for the requester ***
    await Notification.create({
        recipient: request.requester,
        sender: request.targetUser,
        type: 'follow_accepted',
        content: `${following.displayName || following.username} accepted your follow request.`,
        relatedId: request._id,
    });

    return { follower, following };
};

// **Service: rejectFollowRequest**
export const rejectFollowRequest = async (currentUserId: string, requestId: string) => {
    const request = await FollowRequest.findById(requestId);
    const requestReceiver = request.receiver.toString();
    const currentUserIdString = currentUserId.toString();

    if (!request || requestReceiver !== currentUserIdString) {
        throw new Error('Request not found or you are not the receiver.');
    }

    if (request.status !== 'pending') {
        throw new Error('Request is not pending.');
    }

    request.status = 'rejected';
    await request.save();

    await User.findByIdAndUpdate(currentUserId, { $pull: { pendingFollowRequests: requestId } });

    // *** Create a notification for the requester ***
    const receiverUser = await User.findById(currentUserId);
    await Notification.create({
        recipient: request.requester,
        sender: currentUserId,
        type: 'follow_rejected',
        content: `${receiverUser?.displayName || receiverUser?.username} rejected your follow request.`,
        relatedId: request._id,
    });

    return { message: 'Follow request rejected.' };
};