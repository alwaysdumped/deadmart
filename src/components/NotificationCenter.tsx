import React, { useEffect, useState, useRef } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { Bell, X, Check, CheckCheck, Package, ShoppingBag, AlertCircle, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationCenter: React.FC = () => {
    const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, startPolling, stopPolling } = useNotificationStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        startPolling();
        return () => stopPolling();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'order':
                return <Package className="h-5 w-5 text-blue-600" />;
            case 'product':
                return <ShoppingBag className="h-5 w-5 text-green-600" />;
            case 'promotion':
                return <Gift className="h-5 w-5 text-purple-600" />;
            case 'system':
            default:
                return <AlertCircle className="h-5 w-5 text-orange-600" />;
        }
    };

    const handleNotificationClick = async (notification: any) => {
        if (!notification.read) {
            await markAsRead(notification._id || notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
        setIsOpen(false);
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await deleteNotification(id);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[32rem] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                                <CheckCheck className="h-4 w-4" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => {
                                    const notificationId = notification._id || notification.id;
                                    return (
                                        <div
                                            key={notificationId}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-primary-50' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'
                                                            }`}>
                                                            {notification.title}
                                                        </p>
                                                        <button
                                                            onClick={(e) => handleDelete(e, notificationId!)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {notification.createdAt && new Date(notification.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="flex-shrink-0">
                                                        <div className="h-2 w-2 bg-primary-600 rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
