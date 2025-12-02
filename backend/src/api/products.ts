import { Router, Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { adminOnly, authMiddleware } from './auth';

const router = Router();
const productService = new ProductService();

router.post('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
        const product = await productService.getProduct(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.put('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

router.delete('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
        const deleted = await productService.deleteProduct(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Product not found' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/low-stock/list', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
        const products = await productService.getLowStockProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Public GET: products for USER (без цін і без suppliers)
router.get('/public-simple', async (req: Request, res: Response) => {
    try {
        const products = await productService.getAllProducts();
        // Відбираємо лише потрібні поля
        const publicProducts = products.map(p => ({
            id: p.id,
            name: p.name,
            article: p.article,
            quantity: p.quantity,
            minStock: p.minStock
        }));
        res.json(publicProducts);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;