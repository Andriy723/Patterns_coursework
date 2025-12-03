import { StockAlert, NotificationObserver } from '../models/entities';
import { getPool } from '../database';
import { v4 as uuidv4 } from 'uuid';

export class StockAlertSubject {
    private observers: NotificationObserver[] = [];

    attach(observer: NotificationObserver): void {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
        }
    }

    detach(observer: NotificationObserver): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notifyAll(alert: StockAlert): void {
        this.observers.forEach(observer => {
            observer.update(alert);
        });
    }

    getObserversCount(): number {
        return this.observers.length;
    }

    getObservers(): NotificationObserver[] {
        return this.observers;
    }
}

export class EmailNotificationObserver implements NotificationObserver {
    async update(alert: StockAlert): Promise<void> {
    }
}

export class LoggerNotificationObserver implements NotificationObserver {
    async update(alert: StockAlert): Promise<void> {
        console.log(`📝 Alert logged: ${alert.message}`);
    }
}

export class DatabaseNotificationObserver implements NotificationObserver {
    async update(alert: StockAlert): Promise<void> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            await connection.execute(
                `INSERT INTO stock_alerts (id, productId, message, isRead) VALUES (?, ?, ?, ?)`,
                [alert.id, alert.productId, alert.message, alert.isRead]
            );
        } catch (error) {
            console.error('Error saving alert:', error);
        } finally {
            connection.release();
        }
    }
}

export async function createStockAlert(productId: string, message: string): Promise<StockAlert> {
    const alert: StockAlert = {
        id: uuidv4(),
        productId,
        message,
        isRead: false,
        createdAt: new Date(),
    };

    return alert;
}