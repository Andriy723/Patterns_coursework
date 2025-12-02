export class NotificationManager {
    private static instance: NotificationManager;
    private subscribers: Array<(alert: any) => void> = [];
    private alertCache: Map<string, any> = new Map();

    private constructor() {
        console.log('🔔 NotificationManager initialized');
    }

    static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    subscribe(callback: (alert: any) => void): void {
        this.subscribers.push(callback);
        console.log(`✅ Subscriber added. Total: ${this.subscribers.length}`);
    }

    unsubscribe(callback: (alert: any) => void): void {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
        console.log(`❌ Subscriber removed. Total: ${this.subscribers.length}`);
    }

    notify(alert: any): void {
        this.alertCache.set(alert.id, alert);
        console.log(`📢 Notifying ${this.subscribers.length} subscribers...`);
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
        console.log(`📋 Total alerts in cache: ${alerts.length}`);
        return alerts;
    }

    clearAlert(id: string): void {
        this.alertCache.delete(id);
        console.log(`🗑️ Alert cleared: ${id}`);
    }

    clearAllAlerts(): void {
        this.alertCache.clear();
        console.log('🗑️ All alerts cleared');
    }

    getSubscribersCount(): number {
        return this.subscribers.length;
    }

    getAlertsCount(): number {
        return this.alertCache.size;
    }
}