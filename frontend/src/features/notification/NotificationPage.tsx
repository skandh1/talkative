// src/pages/NotificationsPage.tsx

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './hook/useNotifications';
import { useApi } from '@/hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";

const NotificationCard: React.FC<{ notification: any; onAction: (type: string, id: string) => void }> = ({ notification, onAction }) => {
  const queryClient = useQueryClient();
  const { request } = useApi();

  // Individual mutations for better control and error handling
  const { mutate: acceptRequest, isPending: isAccepting } = useMutation({
    mutationFn: async () => {
      let endpoint = '';
      
      if (notification.type === 'friend_request') {
        endpoint = `/users/requests/friend/${notification.relatedId}/accept`;
      } else if (notification.type === 'follow_request') {
        endpoint = `/users/requests/follow/${notification.relatedId}/accept`;
      }
      
      if (!endpoint) throw new Error('Invalid notification type for accept action');
      
      return request(endpoint, { method: 'PUT' });
    },
    onSuccess: () => {
      toast.success('Request accepted!');
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['relationship'] });
      queryClient.invalidateQueries({ queryKey: ['followRelationship'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      onAction('accept', notification._id);
    },
    onError: (err: any) => {
      toast.error(`Failed to accept request: ${err.body?.message || 'Unknown error'}`);
    },
  });

  const { mutate: rejectRequest, isPending: isRejecting } = useMutation({
    mutationFn: async () => {
      let endpoint = '';
      
      if (notification.type === 'friend_request') {
        endpoint = `/users/requests/friend/${notification.relatedId}/reject`;
      } else if (notification.type === 'follow_request') {
        endpoint = `/users/requests/follow/${notification.relatedId}/reject`;
      }
      
      if (!endpoint) throw new Error('Invalid notification type for reject action');
      
      return request(endpoint, { method: 'PUT' });
    },
    onSuccess: () => {
      toast.info('Request rejected.');
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['relationship'] });
      queryClient.invalidateQueries({ queryKey: ['followRelationship'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      onAction('reject', notification._id);
    },
    onError: (err: any) => {
      toast.error(`Failed to reject request: ${err.body?.message || 'Unknown error'}`);
    },
  });

  const { mutate: markAsRead, isPending: isMarkingRead } = useMutation({
    mutationFn: () => request(`/notifications/${notification._id}/read`, { method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onAction('read', notification._id);
    },
    onError: (err: any) => {
      toast.error(`Failed to mark as read: ${err.body?.message || 'Unknown error'}`);
    },
  });

  // Check if this notification type supports accept/reject actions
  const isActionableRequest = ['friend_request', 'follow_request'].includes(notification.type);

  return (
    <div className={`p-4 rounded-lg shadow-md mb-4 flex justify-between items-center transition-all duration-300 ${
      notification.isRead ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-50 dark:bg-gray-800'
    }`}>
      <div className="flex-1">
        <p className={`font-semibold ${
          notification.isRead ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'
        }`}>
          {notification.content}
        </p>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </span>
        {/* Show sender info if available */}
        {notification.sender && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            From: {notification.sender.displayName || notification.sender.username}
          </div>
        )}
      </div>
      <div className="flex space-x-2 ml-4">
        {isActionableRequest && !notification.isRead && (
          <>
            <Button
              onClick={() => acceptRequest()}
              className="bg-green-500 hover:bg-green-600 text-white"
              size="sm"
              disabled={isAccepting}
            >
              {isAccepting ? 'Accepting...' : 'Accept'}
            </Button>
            <Button
              onClick={() => rejectRequest()}
              className="bg-red-500 hover:bg-red-600 text-white"
              size="sm"
              disabled={isRejecting}
            >
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </Button>
          </>
        )}
        {!notification.isRead && (
          <Button
            onClick={() => markAsRead()}
            variant="outline"
            size="sm"
            className="text-gray-600 dark:text-gray-300"
            disabled={isMarkingRead}
          >
            {isMarkingRead ? 'Marking...' : 'Mark as Read'}
          </Button>
        )}
      </div>
    </div>
  );
};

export const NotificationsPage: React.FC = () => {
  const { dbUser } = useAuth();
  const { data, isLoading, isError, error } = useNotifications();
  const queryClient = useQueryClient();
  const { request } = useApi();

  // Mutation to mark all notifications as read
  const { mutate: markAllAsRead, isPending: isMarkingAllRead } = useMutation({
    mutationFn: () => request('/notifications/read-all', { method: 'PUT' }),
    onSuccess: () => {
      toast.success('All notifications marked as read');
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
    return <div className="p-8 text-center text-red-500">
      Error fetching notifications: {error?.message || 'Unknown error'}
    </div>;
  }

  // Handle the new data structure
  const notifications = data?.notifications || [];
  const totalCount = data?.total || 0;
  const hasMore = data?.hasMore || false;
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleActionComplete = () => {
    // This is called after any action completes
    // The individual mutations already handle query invalidation
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Notifications ({unreadCount > 0 ? `${unreadCount} unread` : '0 unread'})
          {totalCount > notifications.length && (
            <span className="text-sm text-gray-500 dark:text-gray-400 block">
              Showing {notifications.length} of {totalCount} notifications
            </span>
          )}
        </h1>
        {notifications.length > 0 && (
          <Button 
            onClick={() => markAllAsRead()} 
            variant="secondary" 
            disabled={unreadCount === 0 || isMarkingAllRead}
          >
            {isMarkingAllRead ? 'Marking All...' : 'Mark All as Read'}
          </Button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          You have no notifications.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {notifications.map((notification: any) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                onAction={handleActionComplete}
              />
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-6">
              <p className="text-gray-500 dark:text-gray-400">
                Showing {notifications.length} of {totalCount} notifications
              </p>
              {/* You could add a "Load More" button here if you implement pagination */}
            </div>
          )}
        </>
      )}
    </div>
  );
};