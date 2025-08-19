// src/pages/NotificationsPage.tsx

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './hook/useNotifications'; // Custom hook for fetching notifications
import { useApi } from '@/hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
// import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const NotificationCard: React.FC<{ notification: any; onAction: (type: string, id: string) => void }> = ({ notification, onAction }) => {
  const queryClient = useQueryClient();
  const { request } = useApi();

  // Utility to handle a single action on a notification (e.g., accept, reject, mark as read)
  const handleAction = async (actionType: 'accept' | 'reject' | 'read', notificationId: string, relatedId?: string) => {
    let endpoint = '';
    let method = 'PUT';

    // Determine the API endpoint based on notification type and action
    if (actionType === 'accept' && notification.type.includes('friend_request')) {
      endpoint = `/users/requests/friend/${relatedId}/accept`;
    } else if (actionType === 'reject' && notification.type.includes('friend_request')) {
      endpoint = `/users/requests/friend/${relatedId}/reject`;
    } else if (actionType === 'accept' && notification.type.includes('follow_request')) {
      endpoint = `/users/requests/follow/${relatedId}/accept`;
    } else if (actionType === 'reject' && notification.type.includes('follow_request')) {
      endpoint = `/users/requests/follow/${relatedId}/reject`;
    } else if (actionType === 'read') {
      endpoint = `/notifications/${notificationId}/read`;
    }

    if (endpoint) {
      try {
        await request(endpoint, { method });
        onAction(actionType, notificationId); // Inform the parent component
      } catch (err: any) {
        toast.error(`Failed to perform action: ${err.body?.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div className={`p-4 rounded-lg shadow-md mb-4 flex justify-between items-center transition-all duration-300 ${notification.isRead ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-50 dark:bg-gray-800'}`}>
      <div className="flex-1">
        <p className={`font-semibold ${notification.isRead ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
          {notification.content}
        </p>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </span>
      </div>
      <div className="flex space-x-2 ml-4">
        {['friend_request', 'follow_request'].includes(notification.type) && !notification.isRead && (
          <>
            <Button
              onClick={() => handleAction('accept', notification._id, notification.relatedId)}
              className="bg-green-500 hover:bg-green-600 text-white"
              size="sm"
            >
              Accept
            </Button>
            <Button
              onClick={() => handleAction('reject', notification._id, notification.relatedId)}
              className="bg-red-500 hover:bg-red-600 text-white"
              size="sm"
            >
              Reject
            </Button>
          </>
        )}
        {!notification.isRead && (
          <Button
            onClick={() => handleAction('read', notification._id)}
            variant="outline"
            size="sm"
            className="text-gray-600 dark:text-gray-300"
          >
            Mark as Read
          </Button>
        )}
      </div>
    </div>
  );
};

export const NotificationsPage: React.FC = () => {
  const { dbUser } = useAuth();
  const { data: notifications, isLoading, isError, error } = useNotifications();
  console.log("isLoading:", isLoading);
  console.log("notifications data:", notifications);
  const queryClient = useQueryClient();
  const { request } = useApi();

  // Mutation to mark all notifications as read
  const { mutate: markAllAsRead } = useMutation({
    mutationFn: () => request('/notifications/read-all', { method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      toast.error(`Failed to mark all as read: ${err.body?.message || 'Unknown error'}`);
    },
  });

  if (!dbUser) {
    return <div className="p-8 text-center">Please log in to view notifications.</div>;
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading notifications...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Error fetching notifications: {error.message}</div>;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleActionComplete = () => {
    // Invalidate queries after any action to refresh the list and unread count
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Notifications ({unreadCount > 0 ? `${unreadCount} unread` : '0 unread'})
        </h1>
        {notifications.length > 0 && (
          <Button onClick={() => markAllAsRead()} variant="secondary" disabled={unreadCount === 0}>
            Mark All as Read
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">You have no notifications.</div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onAction={handleActionComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};