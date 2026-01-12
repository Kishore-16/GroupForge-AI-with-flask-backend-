/**
 * Real-time Notifications Component
 * Displays real-time notifications and updates from WebSocket
 */

import { useState, useEffect } from 'react';
import { useWebSocket } from '../../contexts';
import { X, Bell, CheckCircle, AlertCircle, Users, User } from 'lucide-react';

interface Notification {
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: string;
    autoHide?: boolean;
}

interface RealTimeNotificationsProps {
    maxNotifications?: number;
    autoHideDelay?: number;
}

export function RealTimeNotifications({
    maxNotifications = 5,
    autoHideDelay = 5000
}: RealTimeNotificationsProps) {
    const { onNotification, onTeamFormed, onAssessmentCompleted, onProfileUpdate } = useWebSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Handle general notifications
        onNotification((data) => {
            addNotification({
                type: 'info',
                title: 'Notification',
                message: data.data?.message || data.message || 'New notification received',
                autoHide: true
            });
        });

        // Handle team formation notifications
        onTeamFormed((data) => {
            addNotification({
                type: 'success',
                title: 'Team Formed!',
                message: `You've been added to team: ${data.data?.teamName || 'New Team'}`,
                autoHide: true
            });
        });

        // Handle assessment completion notifications
        onAssessmentCompleted((data) => {
            addNotification({
                type: 'success',
                title: 'Assessment Completed!',
                message: `Your assessment has been completed with a score of ${data.data?.overallScore || 'N/A'}`,
                autoHide: true
            });
        });

        // Handle profile update notifications
        onProfileUpdate((data) => {
            addNotification({
                type: 'info',
                title: 'Profile Updated',
                message: 'Your profile has been updated successfully',
                autoHide: true
            });
        });

    }, [onNotification, onTeamFormed, onAssessmentCompleted, onProfileUpdate]);

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
        };

        setNotifications(prev => {
            const updated = [newNotification, ...prev].slice(0, maxNotifications);
            return updated;
        });

        // Auto-hide notification if specified
        if (notification.autoHide !== false) {
            setTimeout(() => {
                removeNotification(newNotification.id);
            }, autoHideDelay);
        }
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Bell className="w-5 h-5 text-blue-500" />;
        }
    };

    const getNotificationColors = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`
            p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out
            ${getNotificationColors(notification.type)}
            animate-slide-in-right
          `}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 mb-1">
                                    {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}