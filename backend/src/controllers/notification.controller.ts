// src/controllers/notification.controller.ts

import { Request, Response } from 'express';
import * as notificationServices from '../services/notification.services';
import { Notification } from '../models/Notification.model';

// Note: assuming req.user.id is populated by your authentication middleware
// For example, from a JWT payload

/**
 * Handles GET /api/notifications
 */
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = req?.user?._id;
        
        // Add this check:
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }
        
        const notifications = await notificationServices.getUserNotifications(userId);
        res.status(200).json({ notifications });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to retrieve notifications.', error: error.message });
    }
};

/**
 * Handles PUT /api/notifications/:id/read
 */
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const userId = req?.user?._id;
        const { id } = req.params;
        
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }
        
        const updatedNotification = await notificationServices.markNotificationAsRead(id, userId);
        res.status(200).json({ notification: updatedNotification, message: 'Notification marked as read.' });
    } catch (error: any) {
        // Different status codes based on error type
        if (error.message.includes('Invalid')) {
            res.status(400).json({ message: error.message });
        } else if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

/**
 * Handles PUT /api/notifications/read-all
 */
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = req?.user?._id;
        await notificationServices.markAllNotificationsAsRead(userId);
        res.status(200).json({ message: 'All notifications marked as read.' });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to mark all notifications as read.', error: error.message });
    }
};

export const cleanupOldNotifications = async (userId: string, daysOld: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await Notification.deleteMany({
        recipient: userId,
        isRead: true,
        createdAt: { $lt: cutoffDate }
    });
    
    return result.deletedCount;
};