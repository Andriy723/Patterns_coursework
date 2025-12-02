import { Product } from '../models/entities';
import { getPool } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { NotificationService } from './notificationService';

export class ProductService {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    private formatDateForMySQL(date: Date): string {
        return date.toISOString().slice(0, 19).replace('T', ' ');
    }

    async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [existing] = await connection.execute(
                `SELECT id FROM products WHERE article = ? AND supplierId = ?`,
                [data.article, data.supplierId]
            );

            if ((existing as any[]).length > 0) {
                throw new Error(`Артикул '${data.article}' вже існує для цього постачальника`);
            }

            const id = uuidv4();
            const now = new Date();
            const formattedNow = this.formatDateForMySQL(now);

            await connection.execute(
                `INSERT INTO products (id, name, article, quantity, price, supplierId, minStock, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, data.name, data.article, data.quantity, data.price, data.supplierId, data.minStock, formattedNow, formattedNow]
            );

            return {
                id,
                name: data.name,
                article: data.article,
                quantity: data.quantity,
                price: data.price,
                supplierId: data.supplierId,
                minStock: data.minStock,
                createdAt: now,
                updatedAt: now,
            };
        } finally {
            connection.release();
        }
    }

    async getProduct(id: string): Promise<Product | null> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM products WHERE id = ?`,
                [id]
            );

            return (rows as Product[])[0] || null;
        } finally {
            connection.release();
        }
    }

    async getAllProducts(): Promise<Product[]> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM products ORDER BY createdAt DESC`
            );

            return rows as Product[];
        } finally {
            connection.release();
        }
    }

    async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            if (data.article) {
                const [existing] = await connection.execute(
                    `SELECT id FROM products WHERE article = ? AND supplierId = ? AND id != ?`,
                    [data.article, data.supplierId, id]
                );

                if ((existing as any[]).length > 0) {
                    throw new Error(`Артикул '${data.article}' вже існує для цього постачальника`);
                }
            }

            const now = new Date();
            const formattedNow = this.formatDateForMySQL(now);
            const updates: string[] = [];
            const values: any[] = [];

            Object.entries(data).forEach(([key, value]) => {
                if (key !== 'id' && key !== 'createdAt') {
                    updates.push(`${key} = ?`);
                    values.push(value);
                }
            });

            updates.push('updatedAt = ?');
            values.push(formattedNow);
            values.push(id);

            await connection.execute(
                `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            await this.notificationService.checkAndNotifyLowStock(id);

            return this.getProduct(id);
        } finally {
            connection.release();
        }
    }

    async deleteProduct(id: string): Promise<boolean> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [result] = await connection.execute(
                `DELETE FROM products WHERE id = ?`,
                [id]
            );

            return (result as any).affectedRows > 0;
        } finally {
            connection.release();
        }
    }

    async getLowStockProducts(): Promise<Product[]> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM products WHERE quantity <= minStock ORDER BY quantity ASC`
            );

            return rows as Product[];
        } finally {
            connection.release();
        }
    }

    async checkAllLowStock(): Promise<void> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [products] = await connection.execute(
                `SELECT * FROM products WHERE quantity <= minStock`
            );

            for (const product of (products as Product[])) {
                await this.notificationService.sendStockAlert(
                    product.id,
                    product.name,
                    product.quantity,
                    product.minStock
                );
            }
        } finally {
            connection.release();
        }
    }

    async checkAndNotifyLowStock(productId: string): Promise<void> {
        const product = await this.getProduct(productId);
        if (product && product.quantity <= product.minStock) {
            await this.notificationService.sendStockAlert(
                product.id,
                product.name,
                product.quantity,
                product.minStock
            );
        }
    }
}