import { Request, Response } from 'express';
import * as userService from '../../services/user.req.services';

// Custom Request type to include the user object from middleware


export const sendFriendRequest = async (req: Request, res: Response) => {
    try {
        const currentUserId = req.user?._id;
        const { targetUserId } = req.params;

        if (!currentUserId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const newRequest = await userService.sendFriendRequest(currentUserId, targetUserId);
        res.status(201).json({ message: 'Friend request sent.', request: newRequest });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
    try {
        const currentUserId = req.user?._id;
        const { requestId } = req.params;

        if (!currentUserId) {
            return res.status(401).json({ message: 'User not authenticated.' });
      }
      

        const { requester, receiver } = await userService.acceptFriendRequest(currentUserId, requestId);
        res.status(200).json({ message: 'Friend request accepted.', requester, receiver });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const rejectFriendRequest = async (req: Request, res: Response) => {
    try {
        const currentUserId = req.user?._id;
        const { requestId } = req.params;
        
        if (!currentUserId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const result = await userService.rejectFriendRequest(currentUserId, requestId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const cancelFriendRequest = async (req: Request, res: Response) => {
    try {
        const currentUserId = req.user?._id;
        const { requestId } = req.params;
        
        if (!currentUserId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const result = await userService.cancelFriendRequest(currentUserId, requestId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const addFriend = async (req: Request, res: Response) => {
    try {
        const currentUserId = req.user?._id;
        const { targetUserId } = req.params;

        if (!currentUserId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const result = await userService.addFriend(currentUserId, targetUserId);
        res.status(200).json({ message: 'Friend added successfully.', user: result.updatedCurrentUser });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const unfriend = async (req: Request, res: Response) => {
    try {
        const currentUserId = req.user?._id;
        const { targetUserId } = req.params;

        if (!currentUserId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const result = await userService.unfriend(currentUserId, targetUserId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const followUser = async (req: Request, res: Response) => {
    try {
        const currentUserId = req.user?._id;
        const { targetUserId } = req.params;
        
        if (!currentUserId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const result = await userService.followUser(currentUserId, targetUserId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const unfollowUser = async (req: Request, res: Response) => {
    try {
        const currentUserId = req.user?._id;
        const { targetUserId } = req.params;
        
        if (!currentUserId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const result = await userService.unfollowUser(currentUserId, targetUserId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const sendFollowRequest = async (req: Request, res: Response) => {
    try {
        const currentUserId = req.user?._id;
        const { targetUserId } = req.params;

        if (!currentUserId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const newRequest = await userService.sendFollowRequest(currentUserId, targetUserId);
        res.status(201).json({ message: 'Follow request sent.', request: newRequest });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const cancelFollowRequest = async (req: Request, res: Response) => {
    try {
        const currentUserId = req.user?._id;
        const { requestId } = req.params;

        if (!currentUserId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const result = await userService.cancelFollowRequest(currentUserId, requestId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const acceptFollowRequest = async (req: Request, res: Response) => {
    try {
        const currentUserId = req.user?._id;
        const { requestId } = req.params;

        if (!currentUserId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const { follower, following } = await userService.acceptFollowRequest(currentUserId, requestId);
        res.status(200).json({ message: 'Follow request accepted.', follower, following });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
