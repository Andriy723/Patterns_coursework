import { NotificationManager } from '../patterns/singleton';
import { StockAlertSubject, createStockAlert, DatabaseNotificationObserver, LoggerNotificationObserver } from '../patterns/observer';
import { getPool } from '../database';

export class NotificationService {
    private alertSubject: StockAlertSubject;

    constructor() {
        this.alertSubject = new StockAlertSubject();
        this.alertSubject.attach(new DatabaseNotificationObserver());
        this.alertSubject.attach(new LoggerNotificationObserver());
    }

    async sendStockAlert(productId: string, productName: string, currentStock: number, minStock: number): Promise<void> {
        const message = `Низький запас товару "${productName}": ${currentStock} од. (мінімум: ${minStock} од.)`;
        const alert = await createStockAlert(productId, message);
        this.alertSubject.notifyAll(alert);

        const manager = NotificationManager.getInstance();
        manager.notify(alert);
    }

    async checkAndNotifyLowStock(productId: string): Promise<void> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [products] = await connection.execute(
                `SELECT id, name, quantity, minStock FROM products WHERE id = ? AND quantity <= minStock`,
                [productId]
            );

            for (const product of (products as any[])) {
                await this.sendStockAlert(product.id, product.name, product.quantity, product.minStock);
            }
        } finally {
            connection.release();
        }
    }

    getNotificationManager(): NotificationManager {
        return NotificationManager.getInstance();
    }

    getAllAlerts(): any[] {
        return this.getNotificationManager().getAllAlerts();
    }
}