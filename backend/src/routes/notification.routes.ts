import { authenticate } from './../middleware/auth';
// src/routes/notification.routes.ts

import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller'; // Assuming you have an auth middleware

const router = express.Router();

// A middleware to ensure the user is authenticated for all notification routes
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the authenticated user, sorted by recency
 * @access  Private
 */
router.get('/', getNotifications);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private
 */
router.put('/:id/read', markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all unread notifications for the user as read
 * @access  Private
 */
router.put('/read-all', markAllAsRead);

export default router;