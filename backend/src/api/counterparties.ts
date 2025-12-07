import { Router, Request, Response } from 'express';
import { CounterpartyService } from '../services/counterpartyService';
import { authMiddleware, superAdminOnly } from './auth';

const router = Router();
const counterpartyService = new CounterpartyService();

router.use(authMiddleware);
router.use(superAdminOnly);

router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, phone, email, address, taxId, notes } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Назва контрагента обов\'язкова' });
        }

        const counterparty = await counterpartyService.createCounterparty({
            name,
            phone,
            email,
            address,
            taxId,
            notes,
        });

        res.status(201).json(counterparty);
    } catch (error) {
        console.error('Error creating counterparty:', error);
        res.status(400).json({ error: (error as Error).message });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const counterparties = await counterpartyService.getAllCounterparties();
        res.json(counterparties);
    } catch (error) {
        console.error('Error fetching counterparties:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const counterparty = await counterpartyService.getCounterparty(req.params.id);
        res.json(counterparty);
    } catch (error) {
        console.error('Error fetching counterparty:', error);
        res.status(404).json({ error: (error as Error).message });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const counterparty = await counterpartyService.updateCounterparty(req.params.id, req.body);
        res.json(counterparty);
    } catch (error) {
        console.error('Error updating counterparty:', error);
        res.status(400).json({ error: (error as Error).message });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await counterpartyService.deleteCounterparty(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting counterparty:', error);
        res.status(400).json({ error: (error as Error).message });
    }
});

export default router;

