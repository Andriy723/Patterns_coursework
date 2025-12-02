import { WarehouseMovement } from '../models/entities';
import { getPool } from '../database';
import { MovementProcessorFactory } from '../patterns/factory';
import { ProductService } from './productService';

export class WarehouseService {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    async recordMovement(
        productId: string,
        type: 'INCOME' | 'OUTCOME' | 'WRITE_OFF',
        quantity: number,
        documentNumber: string
    ): Promise<WarehouseMovement> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [product] = await connection.execute(
                `SELECT id, quantity FROM products WHERE id = ?`,
                [productId]
            );

            if ((product as any[]).length === 0) {
                throw new Error('Товар не знайдено');
            }

            const processor = MovementProcessorFactory.createProcessor(type);
            const movement = await processor.process(productId, quantity, documentNumber);

            await this.productService.checkAllLowStock();

            return movement;
        } finally {
            connection.release();
        }
    }

    async getMovements(limit: number = 100): Promise<WarehouseMovement[]> {
        if (limit < 1 || limit > 1000) {
            limit = 100;
        }

        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            console.log('Executing SELECT query for movements with limit:', limit);

            const query = `SELECT * FROM warehouse_movements ORDER BY \`date\` DESC LIMIT ${Math.floor(limit)}`;
            const [rows] = await connection.execute(query);

            console.log('Query result:', rows);
            console.log('Number of rows:', Array.isArray(rows) ? rows.length : 0);

            const movements = (rows as WarehouseMovement[]) || [];
            return movements;
        } catch (error) {
            console.error('Error fetching movements:', error);
            return [];
        } finally {
            connection.release();
        }
    }

    async getMovementsByProduct(productId: string): Promise<WarehouseMovement[]> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM warehouse_movements WHERE productId = ? ORDER BY \`date\` DESC`,
                [productId]
            );

            return (rows as WarehouseMovement[]) || [];
        } catch (error) {
            console.error('Error fetching movements:', error);
            return [];
        } finally {
            connection.release();
        }
    }

    async getWarehouseStatus(): Promise<any> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [products] = await connection.execute(
                `SELECT id, name, article, quantity, price, minStock, (quantity * price) as total_value
                 FROM products ORDER BY name`
            );

            const [stats] = await connection.execute(
                `SELECT
                     COUNT(*) as total_items,
                     COALESCE(SUM(quantity), 0) as total_quantity,
                     COALESCE(SUM(quantity * price), 0) as total_value
                 FROM products`
            );

            const lowStockProducts = await this.productService.getLowStockProducts();

            return {
                products,
                stats: (stats as any[])[0],
                lowStockItems: lowStockProducts,
                lowStockCount: lowStockProducts.length,
            };
        } finally {
            connection.release();
        }
    }
}