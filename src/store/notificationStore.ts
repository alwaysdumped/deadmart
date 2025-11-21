import { create } from 'zustand';
import { Notification } from '../types';
import { notificationsAPI } from '../services/api';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    startPolling: () => void;
    stopPolling: () => void;
}

let pollingInterval: any | null = null;

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async () => {
        try {
            set({ loading: true });
            const response = await notificationsAPI.getNotifications({ limit: 20 });
            if (response.success) {
                set({
                    notifications: response.notifications,
                    unreadCount: response.unreadCount || 0,
                });
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            set({ loading: false });
        }
    },

    markAsRead: async (id) => {
        try {
            const response = await notificationsAPI.markAsRead(id);
            if (response.success) {
                set({
                    notifications: get().notifications.map(n =>
                        (n._id || n.id) === id ? { ...n, read: true } : n
                    ),
                    unreadCount: Math.max(0, get().unreadCount - 1),
                });
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },

    markAllAsRead: async () => {
        try {
            const response = await notificationsAPI.markAllAsRead();
            if (response.success) {
                set({
                    notifications: get().notifications.map(n => ({ ...n, read: true })),
                    unreadCount: 0,
                });
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    },

    deleteNotification: async (id) => {
        try {
            const notification = get().notifications.find(n => (n._id || n.id) === id);
            const response = await notificationsAPI.deleteNotification(id);
            if (response.success) {
                set({
                    notifications: get().notifications.filter(n => (n._id || n.id) !== id),
                    unreadCount: notification && !notification.read
                        ? Math.max(0, get().unreadCount - 1)
                        : get().unreadCount,
                });
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    },

    startPolling: () => {
        // Poll for new notifications every 30 seconds
        if (!pollingInterval) {
            pollingInterval = setInterval(() => {
                get().fetchNotifications();
            }, 30000);
        }
    },

    stopPolling: () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    },
}));
