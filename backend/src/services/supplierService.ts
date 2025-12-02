import { Supplier } from '../models/entities';
import { getPool } from '../database';
import { v4 as uuidv4 } from 'uuid';

export class SupplierService {
    async createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const id = uuidv4();
            const now = new Date();

            await connection.execute(
                `INSERT INTO suppliers (id, name, phone, email, address, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, data.name, data.phone, data.email, data.address, now, now]
            );

            return { id, ...data, createdAt: now, updatedAt: now };
        } finally {
            connection.release();
        }
    }

    async getSupplier(id: string): Promise<Supplier | null> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM suppliers WHERE id = ?`,
                [id]
            );

            return (rows as Supplier[])[0] || null;
        } finally {
            connection.release();
        }
    }

    async getAllSuppliers(): Promise<Supplier[]> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM suppliers ORDER BY name`
            );

            return rows as Supplier[];
        } finally {
            connection.release();
        }
    }

    async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier | null> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const now = new Date();
            const updates: string[] = [];
            const values: any[] = [];

            Object.entries(data).forEach(([key, value]) => {
                if (key !== 'id' && key !== 'createdAt') {
                    updates.push(`${key} = ?`);
                    values.push(value);
                }
            });

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