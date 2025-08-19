

import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../../hooks/useApi';

export const useNotifications = () => {
    const { request } = useApi();
    const fetchNotifications = async () => {
        // Correctly get the raw JSON response
        const response = await request('/notifications', { method: 'GET' });
        
        // This log shows the full response, which you've identified as {notifications: Array(2)}
        console.log("Full API Response:", response.notifications);
        
        // Check for the existence of the notifications property directly on the response object
        if (!response.notifications) {
            throw new Error(`Failed to fetch notifications: ${response.message || 'Notifications property not found.'}`);
        }
        
        // Correctly return the notifications array
        return response.notifications;
    };

    return useQuery({
        queryKey: ['notifications'],
        queryFn: fetchNotifications,
        refetchInterval: 15000,
    });
};
export const useUnreadCount = () => {
    const { data: notifications } = useNotifications();
    return notifications ? notifications.filter(n => !n.isRead).length : 0;
};