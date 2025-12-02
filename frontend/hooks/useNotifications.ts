import { useEffect, useState } from 'react';

export interface Notification {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
        const notification: Notification = {
            id: Date.now().toString(),
            message,
            type,
            timestamp: new Date(),
        };

        setNotifications((prev) => [...prev, notification]);

        setTimeout(() => {
            removeNotification(notification.id);
        }, 5000);
    };

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return {
        notifications,
        addNotification,
        removeNotification,
    };
}