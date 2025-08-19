// src/services/notification.services.ts

import { Notification, INotification } from '../models/Notification.model';
import { User } from '../models/User';
import mongoose from 'mongoose';

// A utility function to check for valid ObjectIds
const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

/**
 * Get all notifications for a user, sorted by creation date.
 * Populates sender information for display on the client.
 * @param userId The ID of the user to get notifications for.
 * @returns An array of notification documents.
 */
export const getUserNotifications = async (userId: string): Promise<INotification[]> => {
    if (!isValidObjectId(userId)) {
        throw new Error('Invalid user ID.');
    }

    // Find and sort notifications for the given user, populating the sender's basic info
    const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .populate('sender', 'username displayName profilePic isOnline') // Only get necessary user fields
        .exec();

    return notifications;
};

/**
 * Marks a single notification as read.
 * @param notificationId The ID of the notification to mark as read.
 * @param userId The ID of the user who owns the notification.
 * @returns The updated notification document.
 */
export const markNotificationAsRead = async (notificationId: string, userId: string): Promise<INotification | null> => {
    if (!isValidObjectId(notificationId) || !isValidObjectId(userId)) {
        throw new Error('Invalid notification or user ID.');
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId }, // Find by notification ID and ensure it belongs to the user
        { $set: { isRead: true } }, // Update the isRead field
        { new: true } // Return the updated document
    ).exec();

    if (!notification) {
        throw new Error('Notification not found or not owned by user.');
    }

    return notification;
};

/**
 * Marks all notifications for a user as read.
 * @param userId The ID of the user.
 * @returns An object with the count of modified documents.
 */
export const markAllNotificationsAsRead = async (userId: string) => {
    if (!isValidObjectId(userId)) {
        throw new Error('Invalid user ID.');
    }

    const result = await Notification.updateMany(
        { recipient: userId, isRead: false }, // Find all unread notifications for the user
        { $set: { isRead: true } } // Mark them all as read
    ).exec();

    return result;
};

// You can add more services here for deleting notifications, etc.