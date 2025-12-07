import { Supplier } from '../models/entities';
import { getPool } from '../database';
import { v4 as uuidv4 } from 'uuid';

export class SupplierService {
    async createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'counterparty'>): Promise<Supplier> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const id = uuidv4();
            const now = new Date();

            await connection.execute(
                `INSERT INTO suppliers (id, counterpartyId, name, phone, email, address, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, data.counterpartyId || null, data.name, data.phone, data.email, data.address, now, now]
            );

            return await this.getSupplier(id) || { id, ...data, createdAt: now, updatedAt: now };
        } finally {
            connection.release();
        }
    }

    async getSupplier(id: string): Promise<Supplier | null> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT s.*, c.id as counterpartyIdFromJoin, c.name as counterpartyName,
                        c.phone as counterpartyPhone, c.email as counterpartyEmail,
                        c.address as counterpartyAddress, c.taxId as counterpartyTaxId,
                        c.notes as counterpartyNotes, c.type as counterpartyType
                 FROM suppliers s
                 LEFT JOIN counterparties c ON s.counterpartyId = c.id
                 WHERE s.id = ?`,
                [id]
            );

            if ((rows as any[]).length === 0) {
                return null;
            }

            const row = (rows as any[])[0];
            return {
                id: row.id,
                counterpartyId: row.counterpartyId,
                name: row.name,
                phone: row.phone || '',
                email: row.email || '',
                address: row.address || '',
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt),
                counterparty: row.counterpartyIdFromJoin ? {
                    id: row.counterpartyIdFromJoin,
                    name: row.counterpartyName,
                    phone: row.counterpartyPhone,
                    email: row.counterpartyEmail,
                    address: row.counterpartyAddress,
                    taxId: row.counterpartyTaxId,
                    notes: row.counterpartyNotes,
                    type: row.counterpartyType,
                    createdAt: new Date(row.createdAt),
                    updatedAt: new Date(row.updatedAt),
                } as any : undefined,
            };
        } finally {
            connection.release();
        }
    }

    async getAllSuppliers(): Promise<Supplier[]> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT s.*, c.id as counterpartyIdFromJoin, c.name as counterpartyName,
                        c.phone as counterpartyPhone, c.email as counterpartyEmail,
                        c.address as counterpartyAddress, c.taxId as counterpartyTaxId,
                        c.notes as counterpartyNotes, c.type as counterpartyType
                 FROM suppliers s
                 LEFT JOIN counterparties c ON s.counterpartyId = c.id
                 ORDER BY s.name`
            );

            return (rows as any[]).map((row: any) => ({
                id: row.id,
                counterpartyId: row.counterpartyId,
                name: row.name,
                phone: row.phone || '',
                email: row.email || '',
                address: row.address || '',
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt),
                counterparty: row.counterpartyIdFromJoin ? {
                    id: row.counterpartyIdFromJoin,
                    name: row.counterpartyName,
                    phone: row.counterpartyPhone,
                    email: row.counterpartyEmail,
                    address: row.counterpartyAddress,
                    taxId: row.counterpartyTaxId,
                    notes: row.counterpartyNotes,
                    type: row.counterpartyType,
                    createdAt: new Date(row.createdAt),
                    updatedAt: new Date(row.updatedAt),
                } as any : undefined,
            }));
        } finally {
            connection.release();
        }
    }

    async updateSupplier(id: string, data: Partial<Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'counterparty'>>): Promise<Supplier | null> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const now = new Date();
            const updates: string[] = [];
            const values: any[] = [];

            if (data.counterpartyId !== undefined) {
                updates.push('counterpartyId = ?');
                values.push(data.counterpartyId || null);
            }
            if (data.name !== undefined) {
                updates.push('name = ?');
                values.push(data.name);
            }
            if (data.phone !== undefined) {
                updates.push('phone = ?');
                values.push(data.phone);
            }
            if (data.email !== undefined) {
                updates.push('email = ?');
                values.push(data.email);
            }
            if (data.address !== undefined) {
                updates.push('address = ?');
                values.push(data.address);
            }

            if (updates.length === 0) {
                return this.getSupplier(id);
            }

            updates.push('updatedAt = ?');
            values.push(now);
            values.push(id);

            await connection.execute(
                `UPDATE suppliers SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            return this.getSupplier(id);
        } finally {
            connection.release();
        }
    }

    async deleteSupplier(id: string): Promise<boolean> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            await connection.execute(
                `UPDATE products SET supplierId = NULL WHERE supplierId = ?`,
                [id]
            );
            const [result] = await connection.execute(
                `DELETE FROM suppliers WHERE id = ?`,
                [id]
            );

            return (result as any).affectedRows > 0;
        } finally {
            connection.release();
        }
    }
}