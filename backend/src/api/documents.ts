import { Router, Request, Response } from 'express';
import { DocumentService } from '../services/documentService';
import { authMiddleware, adminOnly } from './auth';
import { AuthRequest } from './auth';

const router = Router();
const documentService = new DocumentService();

router.use(authMiddleware);
router.use(adminOnly);

router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const {
            documentNumber,
            type,
            documentDate,
            supplierId,
            counterpartyId,
            counterpartyName,
            counterpartyPhone,
            counterpartyEmail,
            counterpartyAddress,
            notes,
            items,
        } = req.body;

        if (!documentNumber || !type || !documentDate || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Відсутні обов\'язкові поля' });
        }

        if (!['INVOICE', 'ACT'].includes(type)) {
            return res.status(400).json({ error: 'Невірний тип документа' });
        }

        const document = await documentService.createDocument({
            documentNumber,
            type,
            documentDate,
            supplierId,
            counterpartyId,
            counterpartyName,
            counterpartyPhone,
            counterpartyEmail,
            counterpartyAddress,
            notes,
            items,
            createdBy: req.adminId,
        });

        res.status(201).json(document);
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(400).json({ error: (error as Error).message });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const { type, status, startDate, endDate, supplierId } = req.query;

        const filters: any = {};
        if (type) filters.type = type;
        if (status) filters.status = status;
        if (startDate) filters.startDate = startDate as string;
        if (endDate) filters.endDate = endDate as string;
        if (supplierId) filters.supplierId = supplierId as string;

        const documents = await documentService.getAllDocuments(filters);
        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/generate-number', async (req: Request, res: Response) => {
    try {
        const { type } = req.query;

        if (!type || !['INVOICE', 'ACT'].includes(type as string)) {
            return res.status(400).json({ error: 'Вкажіть тип документа (INVOICE або ACT)' });
        }

        const number = await documentService.generateDocumentNumber(type as 'INVOICE' | 'ACT');
        res.json({ documentNumber: number });
    } catch (error) {
        console.error('Error generating document number:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const document = await documentService.getDocument(req.params.id);
        res.json(document);
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(404).json({ error: (error as Error).message });
    }
});

router.post('/:id/confirm', async (req: Request, res: Response) => {
    try {
        const document = await documentService.confirmDocument(req.params.id);
        res.json(document);
    } catch (error) {
        console.error('Error confirming document:', error);
        res.status(400).json({ error: (error as Error).message });
    }
});

router.post('/:id/cancel', async (req: Request, res: Response) => {
    try {
        const document = await documentService.cancelDocument(req.params.id);
        res.json(document);
    } catch (error) {
        console.error('Error cancelling document:', error);
        res.status(400).json({ error: (error as Error).message });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await documentService.deleteDocument(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(400).json({ error: (error as Error).message });
    }
});

export default router;

