import { Router, Request, Response } from 'express';
import { NotificationManager } from '../patterns/singleton';
import { getPool } from '../database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const manager = NotificationManager.getInstance();
        const alerts = manager.getAllAlerts();
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/all', async (req: Request, res: Response) => {
    try {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [alerts] = await connection.execute(
                `SELECT * FROM stock_alerts ORDER BY createdAt DESC`
            );

            res.json(alerts);
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/unread', async (req: Request, res: Response) => {
    try {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [alerts] = await connection.execute(
                `SELECT * FROM stock_alerts WHERE isRead = false ORDER BY createdAt DESC`
            );

            res.json(alerts);
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/stats', async (req: Request, res: Response) => {
    try {
        const manager = NotificationManager.getInstance();
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [stats] = await connection.execute(
                `SELECT COUNT(*) as total, SUM(CASE WHEN isRead = false THEN 1 ELSE 0 END) as unread FROM stock_alerts`
            );

            const alertStats = (stats as any[])[0];

            res.json({
                cachedAlerts: manager.getAlertsCount(),
                databaseAlerts: alertStats.total,
                unreadAlerts: alertStats.unread,
                subscribers: manager.getSubscribersCount(),
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const manager = NotificationManager.getInstance();
        manager.clearAlert(req.params.id);

        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            await connection.execute(
                `DELETE FROM stock_alerts WHERE id = ?`,
                [req.params.id]
            );

            res.json({ success: true });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.put('/:id/read', async (req: Request, res: Response) => {
    try {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            await connection.execute(
                `UPDATE stock_alerts SET isRead = true WHERE id = ?`,
                [req.params.id]
            );

            res.json({ success: true });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;