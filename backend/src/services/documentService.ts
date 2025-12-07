import { getPool } from '../database';
import { Document, DocumentItem, Supplier, Counterparty } from '../models/entities';
import { v4 as uuidv4 } from 'uuid';
import { WarehouseService } from './warehouseService';

export class DocumentService {
    private warehouseService: WarehouseService;

    constructor() {
        this.warehouseService = new WarehouseService();
    }

    async createDocument(documentData: {
        documentNumber: string;
        type: 'INVOICE' | 'ACT';
        documentDate: string;
        supplierId?: string;
        counterpartyId?: string;
        counterpartyName?: string;
        counterpartyPhone?: string;
        counterpartyEmail?: string;
        counterpartyAddress?: string;
        notes?: string;
        items: Array<{
            productId: string;
            quantity: number;
            price: number;
            notes?: string;
        }>;
        createdBy?: string;
    }): Promise<Document> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [existing] = await connection.execute(
                'SELECT id FROM documents WHERE documentNumber = ?',
                [documentData.documentNumber]
            );

            if ((existing as any[]).length > 0) {
                throw new Error('Документ з таким номером вже існує');
            }

            let totalAmount = 0;
            for (const item of documentData.items) {
                totalAmount += item.quantity * item.price;
            }

            const documentId = uuidv4();
            const documentDate = new Date(documentData.documentDate);

            let counterpartyData = {
                name: documentData.counterpartyName,
                phone: documentData.counterpartyPhone,
                email: documentData.counterpartyEmail,
                address: documentData.counterpartyAddress,
            };

            if (documentData.counterpartyId) {
                const [cpResult] = await connection.execute(
                    'SELECT * FROM counterparties WHERE id = ?',
                    [documentData.counterpartyId]
                );
                if ((cpResult as any[]).length > 0) {
                    const cp = (cpResult as any[])[0];
                    counterpartyData = {
                        name: cp.name,
                        phone: cp.phone,
                        email: cp.email,
                        address: cp.address,
                    };
                }
            }

            await connection.execute(
                `INSERT INTO documents (
                    id, documentNumber, type, documentDate, supplierId, counterpartyId,
                    counterpartyName, counterpartyPhone, counterpartyEmail, counterpartyAddress,
                    totalAmount, notes, status, createdBy
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    documentId,
                    documentData.documentNumber,
                    documentData.type,
                    documentDate.toISOString().slice(0, 19).replace('T', ' '),
                    documentData.supplierId || null,
                    documentData.counterpartyId || null,
                    counterpartyData.name || null,
                    counterpartyData.phone || null,
                    counterpartyData.email || null,
                    counterpartyData.address || null,
                    totalAmount,
                    documentData.notes || null,
                    'DRAFT',
                    documentData.createdBy || null,
                ]
            );

            for (const item of documentData.items) {
                const itemId = uuidv4();
                const itemTotal = item.quantity * item.price;

                await connection.execute(
                    `INSERT INTO document_items (
                        id, documentId, productId, quantity, price, total, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        itemId,
                        documentId,
                        item.productId,
                        item.quantity,
                        item.price,
                        itemTotal,
                        item.notes || null,
                    ]
                );
            }

            await connection.commit();

            return await this.getDocument(documentId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getDocument(documentId: string): Promise<Document> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [documents] = await connection.execute(
                `SELECT d.*, 
                        s.name as supplierName, s.phone as supplierPhone, 
                        s.email as supplierEmail, s.address as supplierAddress,
                        c.name as counterpartyNameFromDb, c.phone as counterpartyPhoneFromDb,
                        c.email as counterpartyEmailFromDb, c.address as counterpartyAddressFromDb
                 FROM documents d
                 LEFT JOIN suppliers s ON d.supplierId = s.id
                 LEFT JOIN counterparties c ON d.counterpartyId = c.id
                 WHERE d.id = ?`,
                [documentId]
            );

            if ((documents as any[]).length === 0) {
                throw new Error('Документ не знайдено');
            }

            const doc = (documents as any[])[0];

            const [items] = await connection.execute(
                `SELECT di.*, p.name as productName, p.article as productArticle
                 FROM document_items di
                 JOIN products p ON di.productId = p.id
                 WHERE di.documentId = ?
                 ORDER BY di.createdAt`,
                [documentId]
            );

            return {
                id: doc.id,
                documentNumber: doc.documentNumber,
                type: doc.type,
                documentDate: new Date(doc.documentDate),
                supplierId: doc.supplierId,
                counterpartyId: doc.counterpartyId,
                counterpartyName: doc.counterpartyName || doc.counterpartyNameFromDb,
                counterpartyPhone: doc.counterpartyPhone || doc.counterpartyPhoneFromDb,
                counterpartyEmail: doc.counterpartyEmail || doc.counterpartyEmailFromDb,
                counterpartyAddress: doc.counterpartyAddress || doc.counterpartyAddressFromDb,
                totalAmount: parseFloat(doc.totalAmount),
                notes: doc.notes,
                status: doc.status,
                createdBy: doc.createdBy,
                createdAt: new Date(doc.createdAt),
                updatedAt: new Date(doc.updatedAt),
                supplier: doc.supplierId && doc.supplierName ? {
                    id: doc.supplierId,
                    name: doc.supplierName,
                    phone: doc.supplierPhone || '',
                    email: doc.supplierEmail || '',
                    address: doc.supplierAddress || '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as Supplier : undefined,
                counterparty: doc.counterpartyId && doc.counterpartyNameFromDb ? {
                    id: doc.counterpartyId,
                    name: doc.counterpartyNameFromDb,
                    phone: doc.counterpartyPhoneFromDb || undefined,
                    email: doc.counterpartyEmailFromDb || undefined,
                    address: doc.counterpartyAddressFromDb || undefined,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as Counterparty : undefined,
                items: (items as any[]).map((item: any) => ({
                    id: item.id,
                    documentId: item.documentId,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    total: parseFloat(item.total),
                    notes: item.notes,
                    createdAt: new Date(item.createdAt),
                    product: {
                        id: item.productId,
                        name: item.productName,
                        article: item.productArticle,
                    } as any,
                })),
            };
        } finally {
            connection.release();
        }
    }

    async getAllDocuments(filters?: {
        type?: 'INVOICE' | 'ACT';
        status?: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
        startDate?: string;
        endDate?: string;
        supplierId?: string;
    }): Promise<Document[]> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            let query = `
                SELECT d.*, 
                       s.name as supplierName, s.id as supplierIdFromJoin,
                       c.name as counterpartyNameFromDb, c.id as counterpartyIdFromJoin
                FROM documents d
                LEFT JOIN suppliers s ON d.supplierId = s.id
                LEFT JOIN counterparties c ON d.counterpartyId = c.id
                WHERE 1=1
            `;
            const params: any[] = [];

            if (filters?.type) {
                query += ' AND d.type = ?';
                params.push(filters.type);
            }

            if (filters?.status) {
                query += ' AND d.status = ?';
                params.push(filters.status);
            }

            if (filters?.startDate) {
                query += ' AND d.documentDate >= ?';
                params.push(filters.startDate);
            }

            if (filters?.endDate) {
                query += ' AND d.documentDate <= ?';
                params.push(filters.endDate);
            }

            if (filters?.supplierId) {
                query += ' AND d.supplierId = ?';
                params.push(filters.supplierId);
            }

            query += ' ORDER BY d.documentDate DESC, d.createdAt DESC';

            const [documents] = await connection.execute(query, params);

            return (documents as any[]).map((doc: any) => ({
                id: doc.id,
                documentNumber: doc.documentNumber,
                type: doc.type,
                documentDate: new Date(doc.documentDate),
                supplierId: doc.supplierId,
                counterpartyId: doc.counterpartyId,
                counterpartyName: doc.counterpartyName || doc.counterpartyNameFromDb,
                counterpartyPhone: doc.counterpartyPhone,
                counterpartyEmail: doc.counterpartyEmail,
                counterpartyAddress: doc.counterpartyAddress,
                totalAmount: parseFloat(doc.totalAmount),
                notes: doc.notes,
                status: doc.status,
                createdBy: doc.createdBy,
                createdAt: new Date(doc.createdAt),
                updatedAt: new Date(doc.updatedAt),
                supplier: doc.supplierId && doc.supplierName ? {
                    id: doc.supplierId,
                    name: doc.supplierName,
                    phone: '',
                    email: '',
                    address: '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as Supplier : undefined,
                counterparty: doc.counterpartyId && doc.counterpartyNameFromDb ? {
                    id: doc.counterpartyId,
                    name: doc.counterpartyNameFromDb,
                    phone: undefined,
                    email: undefined,
                    address: undefined,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as Counterparty : undefined,
            }));
        } finally {
            connection.release();
        }
    }

    async confirmDocument(documentId: string): Promise<Document> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [documents] = await connection.execute(
                `SELECT d.*, s.name as supplierName
                 FROM documents d
                 LEFT JOIN suppliers s ON d.supplierId = s.id
                 WHERE d.id = ?`,
                [documentId]
            );

            if ((documents as any[]).length === 0) {
                throw new Error('Документ не знайдено');
            }

            const doc = (documents as any[])[0];

            if (doc.status === 'CONFIRMED') {
                throw new Error('Документ вже підтверджено');
            }

            if (doc.status === 'CANCELLED') {
                throw new Error('Скасований документ не можна підтвердити');
            }

            const [items] = await connection.execute(
                `SELECT di.*, p.name as productName, p.article as productArticle
                 FROM document_items di
                 JOIN products p ON di.productId = p.id
                 WHERE di.documentId = ?
                 ORDER BY di.createdAt`,
                [documentId]
            );

            const documentItems = (items as any[]).map((item: any) => ({
                id: item.id,
                documentId: item.documentId,
                productId: item.productId,
                quantity: item.quantity,
                price: parseFloat(item.price),
                total: parseFloat(item.total),
                notes: item.notes,
                createdAt: new Date(item.createdAt),
            }));

            if (documentItems.length === 0) {
                throw new Error('Документ не містить позицій');
            }

            await connection.execute(
                'UPDATE documents SET status = ? WHERE id = ?',
                ['CONFIRMED', documentId]
            );

            const movementType = doc.type === 'INVOICE' ? 'INCOME' : 'OUTCOME';

            for (const item of documentItems) {
                await this.warehouseService.recordMovement(
                    item.productId,
                    movementType,
                    item.quantity,
                    doc.documentNumber
                );
            }

            await connection.commit();

            return await this.getDocument(documentId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async cancelDocument(documentId: string): Promise<Document> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const document = await this.getDocument(documentId);

            if (document.status === 'CANCELLED') {
                throw new Error('Документ вже скасовано');
            }

            if (document.status === 'CONFIRMED') {
                throw new Error('Підтверджений документ не можна скасувати. Створіть зворотний документ.');
            }

            await connection.execute(
                'UPDATE documents SET status = ? WHERE id = ?',
                ['CANCELLED', documentId]
            );

            return await this.getDocument(documentId);
        } finally {
            connection.release();
        }
    }

    async deleteDocument(documentId: string): Promise<void> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const document = await this.getDocument(documentId);

            if (document.status === 'CONFIRMED') {
                throw new Error('Не можна видалити підтверджений документ');
            }

            await connection.execute('DELETE FROM documents WHERE id = ?', [documentId]);
        } finally {
            connection.release();
        }
    }

    async generateDocumentNumber(type: 'INVOICE' | 'ACT'): Promise<string> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const prefix = type === 'INVOICE' ? 'INV' : 'ACT';
            const year = new Date().getFullYear();

            const [result] = await connection.execute(
                `SELECT documentNumber FROM documents 
                 WHERE documentNumber LIKE ? 
                 ORDER BY documentNumber DESC 
                 LIMIT 1`,
                [`${prefix}-${year}-%`]
            );

            let nextNumber = 1;

            if ((result as any[]).length > 0) {
                const lastNumber = (result as any[])[0].documentNumber;
                const match = lastNumber.match(/\d+$/);
                if (match) {
                    nextNumber = parseInt(match[0]) + 1;
                }
            }

            return `${prefix}-${year}-${String(nextNumber).padStart(6, '0')}`;
        } finally {
            connection.release();
        }
    }
}

