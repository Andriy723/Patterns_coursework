import { Router, Request, Response } from 'express';
import { SupplierService } from '../services/supplierService';
import { authMiddleware, adminOnly, superAdminOnly } from './auth';

const router = Router();
const supplierService = new SupplierService();

router.post('/', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
    try {
        const supplier = await supplierService.createSupplier(req.body);
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
        const suppliers = await supplierService.getAllSuppliers();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
        const supplier = await supplierService.getSupplier(req.params.id);
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.put('/:id', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
    try {
        const supplier = await supplierService.updateSupplier(req.params.id, req.body);
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
        res.json(supplier);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

router.delete('/:id', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
    try {
        const deleted = await supplierService.deleteSupplier(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Supplier not found' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;