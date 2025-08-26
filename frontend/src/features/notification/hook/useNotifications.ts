// hooks/useNotifications.ts
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../../hooks/useApi';

export const useNotifications = () => {
    const { request } = useApi();
    
    const fetchNotifications = async () => {
        try {
            const response = await request('/notifications', { method: 'GET' });
            
            // Handle nested structure: { notifications: { notifications: [...], total: X, hasMore: boolean } }
            if (response.notifications && response.notifications.notifications && Array.isArray(response.notifications.notifications)) {
                return {
                    notifications: response.notifications.notifications,
                    total: response.notifications.total || 0,
                    hasMore: response.notifications.hasMore || false
                };
            }
            
            // Fallback: Direct notifications array
            if (response.notifications && Array.isArray(response.notifications)) {
                return {
                    notifications: response.notifications,
                    total: response.notifications.length,
                    hasMore: false
                };
            }
            
            // Log the actual response structure for debugging
            console.warn('Unexpected API response structure:', response);
            
            throw new Error('Invalid response structure from notifications API');
        } catch (error: any) {
            console.error('Failed to fetch notifications:', error);
            throw new Error(`Failed to fetch notifications: ${error.message || 'Unknown error'}`);
        }
    };

    return useQuery({
        queryKey: ['notifications'],
        queryFn: fetchNotifications,
        refetchInterval: 15000, // Refetch every 15 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
        retry: 3, // Retry failed requests 3 times
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });
};

export const useUnreadCount = () => {
    const { data } = useNotifications();
    
    // Handle case where data might be undefined or not have notifications
    if (!data || !data.notifications || !Array.isArray(data.notifications)) {
        return 0;
    }
    
    return data.notifications.filter((n: any) => !n.isRead).length;
};