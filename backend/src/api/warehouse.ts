import { Router, Request, Response } from 'express';
import { WarehouseService } from '../services/warehouseService';
import { authMiddleware, adminOnly } from './auth';

const router = Router();
const warehouseService = new WarehouseService();

router.post('/movement', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
        const { productId, type, quantity, documentNumber } = req.body;

        if (!productId || !type || quantity === undefined || !documentNumber) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!['INCOME', 'OUTCOME', 'WRITE_OFF'].includes(type)) {
            return res.status(400).json({ error: 'Invalid movement type' });
        }

        if (quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be greater than 0' });
        }

        const movement = await warehouseService.recordMovement(productId, type, quantity, documentNumber);
        res.status(201).json(movement);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

router.get('/movements', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
        console.log('GET /movements called');
        const movements = await warehouseService.getMovements();
        console.log('Movements response:', movements);
        res.json(movements || []);
    } catch (error) {
        console.error('Error fetching movements:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/movements/:productId', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
        const movements = await warehouseService.getMovementsByProduct(req.params.productId);
        res.json(movements || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Public GET /status for USER (без ціни якщо USER, з ціною якщо admin)
router.get('/status', async (req: Request, res: Response) => {
    try {
        const status = await warehouseService.getWarehouseStatus();
        const token = req.headers.authorization?.split(' ')[1];
        let role = null;
        if (token) {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.decode(token);
            role = decoded?.role;
        }
        let products = status.products;
        if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
            // видалити price field
            products = products.map((p: any) => {
                const { price, ...rest } = p;
                return rest;
            });
        }
        res.json({
            ...status,
            products
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;