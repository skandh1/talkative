
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

    // targetUser.pendingFriendRequests.push(newRequest._id as mongoose.Types.ObjectId);
    // await targetUser.save();

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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const request = await FriendRequest.findById(requestId).session(session);
        if (!request) {
            throw new Error("Request not found.");
        }

        // Ensure current user is the receiver
        const requestReceiver = request.receiver.toString();
        const currentUserIdString = currentUserId.toString();
        if (requestReceiver !== currentUserIdString) {
            throw new Error("You are not the receiver of this request.");
        }

        if (request.status !== "pending") {
            throw new Error("Request is not pending.");
        }

        // Update both users' friends
        const [requester, receiver] = await Promise.all([
            User.findByIdAndUpdate(
                request.sender,
                { $addToSet: { friends: request.receiver } },
                { new: true, session }
            ),
            User.findByIdAndUpdate(
                request.receiver,
                { $addToSet: { friends: request.sender } },
                { new: true, session }
            ),
        ]);

        if (!requester || !receiver) {
            throw new Error("Could not update users.");
        }

        // Delete the friend request
        await FriendRequest.deleteOne({ _id: request._id }).session(session);

        // Delete the original friend request notification
        await Notification.deleteOne({
            recipient: request.receiver,
            sender: request.sender,
            type: "friend_request"
        }).session(session);

        // Create a notification for acceptance
        await Notification.create(
            [
                {
                    recipient: request.sender,
                    sender: request.receiver,
                    type: "friend_accepted",
                    content: `${receiver.displayName || receiver.username} accepted your friend request.`,
                },
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return { requester, receiver };
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err; // Pass error up for proper handling
    }
};

// Update this function in your user.req.services.ts
export const getRelationships = async (userId: string, otherUserId: string) => {
    try {
        const [user, otherUser] = await Promise.all([
            User.findById(userId),
            User.findById(otherUserId),
        ]);

        if (!user || !otherUser) {
            throw new Error('User not found.');
        }

        // Find the actual request documents, not just boolean checks
        const [outgoingRequest, incomingRequest] = await Promise.all([
            FriendRequest.findOne({
                sender: userId,
                receiver: otherUserId,
                status: "pending",
            }),
            FriendRequest.findOne({
                sender: otherUserId,
                receiver: userId,
                status: "pending",
            })
        ]);

        const relationships = {
            isFriend: user.friends.includes(otherUser._id),
            outgoingRequest: outgoingRequest, // Return the full object with _id
            incomingRequest: incomingRequest, // Return the full object with _id
        };

        return relationships;
    } catch (err) {
        throw err;
    }
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

    await request.deleteOne();

    await Notification.deleteOne({
        recipient: request.receiver,
        sender: request.sender,
        type: "friend_request"
    })
    // Remove the request from the receiver's pending list
    // await User.findByIdAndUpdate(currentUserId, { $pull: { pendingFriendRequests: requestId } });

    // *** Create a notification for the requester ***
    // const receiverUser = await User.findById(currentUserId);
    // await Notification.create({
    //     recipient: request.sender,
    //     sender: currentUserId,
    //     type: 'friend_rejected',
    //     content: `${receiverUser?.displayName || receiverUser?.username} rejected your friend request.`,
    //     relatedId: request._id,
    // });

    return { message: 'Request rejected successfully.' };
};

export const cancelFriendRequest = async (currentUserId: string, requestId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const request = await FriendRequest.findById(requestId).session(session);
        if (!request) {
            throw new Error("Request not found.");
        }

        const requestSender = request.sender.toString();
        const currentUserIdString = currentUserId.toString();

        // Only the sender can cancel their outgoing request
        if (requestSender !== currentUserIdString) {
            throw new Error("You are not the sender of this request.");
        }

        // Delete the request itself
        await FriendRequest.deleteOne({ _id: requestId }).session(session);

        // Delete the related notification for the receiver
        await Notification.deleteOne({
            recipient: request.receiver,
            sender: request.sender,
            type: "friend_request", // <-- make sure you used this type when creating it
        }).session(session);

        await session.commitTransaction();
        session.endSession();

        return { message: "Request cancelled successfully." };
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
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

    const existingRequest = await FollowRequest.findOne({ sender: currentUserId, receiver: targetUserId });
    if (existingRequest) {
        throw new Error('A follow request has already been sent.');
    }

    const newRequest = await FollowRequest.create({ sender: currentUserId, receiver: targetUserId });
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
    // console.log(request, currentUserId)
    const requestReceiver = request.sender.toString();
    const currentUserIdString = currentUserId.toString();

    // console.log(requestReceiver, currentUserIdString)

    if (!request || requestReceiver !== currentUserIdString) {
        throw new Error('Request not found or you are not the receiver.');
    }

    await Promise.all([
        // User.findByIdAndUpdate(request.receiver, { $pull: { pendingFollowRequests: requestId } }),
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
    await request.deleteOne();

    const [follower, following] = await Promise.all([
        User.findByIdAndUpdate(request.sender, { $addToSet: { following: request.receiver } }),
        User.findByIdAndUpdate(request.receiver, { $addToSet: { followers: request.sender }, $pull: { pendingFollowRequests: requestId } }),
    ]);

    if (!follower || !following) {
        throw new Error('Could not update users.');
    }

    // *** Create a notification for the requester ***
    await Notification.create({
        recipient: request.sender,
        sender: request.receiver,
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

    await request.deleteOne();

    await User.findByIdAndUpdate(currentUserId, { $pull: { pendingFollowRequests: requestId } });

    // *** Create a notification for the requester ***
    const receiverUser = await User.findById(currentUserId);
    await Notification.create({
        recipient: request.sender,
        sender: currentUserId,
        type: 'follow_rejected',
        content: `${receiverUser?.displayName || receiverUser?.username} rejected your follow request.`,
        relatedId: request._id,
    });

    return { message: 'Follow request rejected.' };
};

export const getFollowRelationships = async (userId: string, otherUserId: string) => {
    try {
        const [user, otherUser] = await Promise.all([
            User.findById(userId),
            User.findById(otherUserId),
        ]);

        if (!user || !otherUser) {
            throw new Error('User not found.');
        }

        // Find the actual follow request documents
        const [outgoingFollowRequest, incomingFollowRequest] = await Promise.all([
            FollowRequest.findOne({
                sender: userId,
                receiver: otherUserId,
                status: "pending",
            }),
            FollowRequest.findOne({
                sender: otherUserId,
                receiver: userId,
                status: "pending",
            })
        ]);
        
        const relationships = {
            isFollowing: user.following.includes(otherUser._id),
            outgoingFollowRequest: outgoingFollowRequest, // Return the full object with _id
            incomingFollowRequest: incomingFollowRequest, // Return the full object with _id
        };

        return relationships;
    } catch (err) {
        throw err;
    }
};