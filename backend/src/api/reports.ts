import { Router, Request, Response } from 'express';
import { ReportContext, WarehouseStatusReportStrategy, MovementDynamicsReportStrategy, FinancialReportStrategy } from '../patterns/strategy';
import { authMiddleware, adminOnly } from './auth';

const router = Router();

router.get('/status', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
        const date = req.query.date ? new Date(req.query.date as string) : new Date();

        const context = new ReportContext();
        context.setStrategy(new WarehouseStatusReportStrategy());
        const report = await context.executeReport(date);

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/dynamics', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
        const date = req.query.date ? new Date(req.query.date as string) : new Date();

        const context = new ReportContext();
        context.setStrategy(new MovementDynamicsReportStrategy());
        const report = await context.executeReport(date);

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/financial', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
        const date = req.query.date ? new Date(req.query.date as string) : new Date();

        const context = new ReportContext();
        context.setStrategy(new FinancialReportStrategy());
        const report = await context.executeReport(date);

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;