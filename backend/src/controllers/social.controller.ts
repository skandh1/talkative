// server/controllers/socialController.ts
import { Request, Response } from 'express';
import * as socialService from '../services/social.services';

// Assuming you have an auth middleware that adds `user` to the request object


export const handleGetSocialData = async (req: Request, res: Response) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const data = await socialService.getSocialData(req.user._id);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
};

export const handleAcceptFriendRequest = async (req: Request, res: Response) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { requestId } = req.params;
        const result = await socialService.acceptFriendRequest(req.user._id, requestId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
};

export const handleRejectFriendRequest = async (req: Request, res: Response) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { requestId } = req.params;
        const result = await socialService.rejectFriendRequest(req.user._id, requestId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
};

export const handleAcceptFollowRequest = async (req: Request, res: Response) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { requestId } = req.params;
        const result = await socialService.acceptFollowRequest(req.user._id, requestId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
};

export const handleRejectFollowRequest = async (req: Request, res: Response) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { requestId } = req.params;
        const result = await socialService.rejectFollowRequest(req.user._id, requestId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
};
