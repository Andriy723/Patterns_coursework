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