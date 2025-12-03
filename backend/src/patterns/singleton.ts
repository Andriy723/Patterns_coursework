export class NotificationManager {
    private static instance: NotificationManager;
    private subscribers: Array<(alert: any) => void> = [];
    private alertCache: Map<string, any> = new Map();

    private constructor() {
    }

    static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    subscribe(callback: (alert: any) => void): void {
        this.subscribers.push(callback);
    }

    unsubscribe(callback: (alert: any) => void): void {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
    }

    notify(alert: any): void {
        this.alertCache.set(alert.id, alert);
        this.subscribers.forEach(callback => {
            try {
                callback(alert);
            } catch (error) {
                console.error('Error in subscriber:', error);
            }
        });
    }

    getAllAlerts(): any[] {
        const alerts = Array.from(this.alertCache.values());
        return alerts;
    }

    clearAlert(id: string): void {
        this.alertCache.delete(id);
    }

    clearAllAlerts(): void {
        this.alertCache.clear();
    }

    getSubscribersCount(): number {
        return this.subscribers.length;
    }

    getAlertsCount(): number {
        return this.alertCache.size;
    }
}