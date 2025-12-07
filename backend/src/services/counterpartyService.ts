import { getPool } from '../database';
import { Counterparty } from '../models/entities';
import { v4 as uuidv4 } from 'uuid';

export class CounterpartyService {
    async createCounterparty(data: {
        name: string;
        phone?: string;
        email?: string;
        address?: string;
        taxId?: string;
        notes?: string;
        type?: 'SUPPLIER' | 'CLIENT' | 'PARTNER' | 'OTHER';
    }): Promise<Counterparty> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const id = uuidv4();

            await connection.execute(
                `INSERT INTO counterparties (id, name, phone, email, address, taxId, notes, type)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    data.name,
                    data.phone || null,
                    data.email || null,
                    data.address || null,
                    data.taxId || null,
                    data.notes || null,
                    data.type || 'OTHER',
                ]
            );

            return await this.getCounterparty(id);
        } finally {
            connection.release();
        }
    }

    async getCounterparty(id: string): Promise<Counterparty> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [result] = await connection.execute(
                'SELECT * FROM counterparties WHERE id = ?',
                [id]
            );

            if ((result as any[]).length === 0) {
                throw new Error('Контрагент не знайдено');
            }

            const cp = (result as any[])[0];
            return {
                id: cp.id,
                name: cp.name,
                phone: cp.phone,
                email: cp.email,
                address: cp.address,
                taxId: cp.taxId,
                notes: cp.notes,
                type: cp.type,
                createdAt: new Date(cp.createdAt),
                updatedAt: new Date(cp.updatedAt),
            };
        } finally {
            connection.release();
        }
    }

    async getAllCounterparties(): Promise<Counterparty[]> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [result] = await connection.execute(
                `SELECT c.*, 
                       GROUP_CONCAT(DISTINCT s.id) as supplierIds,
                       GROUP_CONCAT(DISTINCT s.name) as supplierNames
                 FROM counterparties c
                 LEFT JOIN suppliers s ON s.counterpartyId = c.id
                 GROUP BY c.id
                 ORDER BY c.name`
            );

            return (result as any[]).map((cp: any) => ({
                id: cp.id,
                name: cp.name,
                phone: cp.phone,
                email: cp.email,
                address: cp.address,
                taxId: cp.taxId,
                notes: cp.notes,
                type: cp.type,
                createdAt: new Date(cp.createdAt),
                updatedAt: new Date(cp.updatedAt),
                suppliers: cp.supplierIds ? cp.supplierIds.split(',').map((id: string, index: number) => ({
                    id: id.trim(),
                    name: cp.supplierNames.split(',')[index]?.trim() || '',
                })) : [],
            } as any));
        } finally {
            connection.release();
        }
    }

    async updateCounterparty(id: string, data: Partial<Counterparty>): Promise<Counterparty> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const updates: string[] = [];
            const values: any[] = [];

            if (data.name !== undefined) {
                updates.push('name = ?');
                values.push(data.name);
            }
            if (data.phone !== undefined) {
                updates.push('phone = ?');
                values.push(data.phone || null);
            }
            if (data.email !== undefined) {
                updates.push('email = ?');
                values.push(data.email || null);
            }
            if (data.address !== undefined) {
                updates.push('address = ?');
                values.push(data.address || null);
            }
            if (data.taxId !== undefined) {
                updates.push('taxId = ?');
                values.push(data.taxId || null);
            }
            if (data.notes !== undefined) {
                updates.push('notes = ?');
                values.push(data.notes || null);
            }
            if (data.type !== undefined) {
                updates.push('type = ?');
                values.push(data.type);
            }

            if (updates.length === 0) {
                return await this.getCounterparty(id);
            }

            values.push(id);
            await connection.execute(
                `UPDATE counterparties SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            return await this.getCounterparty(id);
        } finally {
            connection.release();
        }
    }

    async deleteCounterparty(id: string): Promise<void> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            await connection.execute('DELETE FROM counterparties WHERE id = ?', [id]);
        } finally {
            connection.release();
        }
    }
}

