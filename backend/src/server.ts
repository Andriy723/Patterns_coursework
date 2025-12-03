import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database';
import authRoutes, { authMiddleware } from './api/auth';
import productRoutes from './api/products';
import supplierRoutes from './api/suppliers';
import warehouseRoutes from './api/warehouse';
import reportRoutes from './api/reports';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Warehouse API is running' });
});

app.use('/api/auth', authRoutes);

app.get('/api/warehouse/status', async (req, res) => {
    try {
        const { WarehouseService } = await import('./services/warehouseService');
        const warehouseService = new WarehouseService();
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

app.get('/api/products/public-simple', async (req, res) => {
    try {
        const { ProductService } = await import('./services/productService');
        const productService = new ProductService();
        const products = await productService.getAllProducts();
        const publicProducts = products.map((p: any) => ({
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

app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/suppliers', authMiddleware, supplierRoutes);
app.use('/api/warehouse', authMiddleware, warehouseRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

async function startServer() {
    try {
        await initializeDatabase();
        console.log('✅ Database connected');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();