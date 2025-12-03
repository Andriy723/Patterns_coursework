import { WarehouseMovement } from '../models/entities';
import { getPool } from '../database';
import { v4 as uuidv4 } from 'uuid';

abstract class MovementProcessor {
    abstract process(productId: string, quantity: number, documentNumber: string): Promise<WarehouseMovement>;

    protected async createMovement(
        productId: string,
        type: 'INCOME' | 'OUTCOME' | 'WRITE_OFF',
        quantity: number,
        documentNumber: string,
        notes: string
    ): Promise<WarehouseMovement> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const id = uuidv4();
            const date = new Date();
            const dateString = date.toISOString().slice(0, 19).replace('T', ' ');

            await connection.execute(
                `INSERT INTO warehouse_movements (id, productId, type, quantity, \`date\`, documentNumber, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, productId, type, parseInt(quantity.toString()), dateString, documentNumber, notes]
            );

            return {
                id,
                productId,
                type,
                quantity,
                date,
                documentNumber,
                notes,
                createdAt: date,
            };
        } catch (error) {
            console.error('Error creating movement:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
}

export class IncomeMovementProcessor extends MovementProcessor {
    async process(productId: string, quantity: number, documentNumber: string): Promise<WarehouseMovement> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [result] = await connection.execute(
                `UPDATE products SET quantity = quantity + ? WHERE id = ?`,
                [parseInt(quantity.toString()), productId]
            );

            if ((result as any).affectedRows === 0) {
                throw new Error('Товар не знайдено');
            }

            return this.createMovement(productId, 'INCOME', quantity, documentNumber, 'Поповнення запасів');
        } finally {
            connection.release();
        }
    }
}

export class OutcomeMovementProcessor extends MovementProcessor {
    async process(productId: string, quantity: number, documentNumber: string): Promise<WarehouseMovement> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [check] = await connection.execute(
                `SELECT quantity FROM products WHERE id = ?`,
                [productId]
            );

            if ((check as any[]).length === 0) {
                throw new Error('Товар не знайдено');
            }

            const currentQuantity = (check as any[])[0].quantity;
            const quantityNum = parseInt(quantity.toString());

            if (currentQuantity < quantityNum) {
                throw new Error(`Недостатньо товару. Є: ${currentQuantity} од., потрібно: ${quantityNum} од.`);
            }

            await connection.execute(
                `UPDATE products SET quantity = quantity - ? WHERE id = ?`,
                [quantityNum, productId]
            );

            return this.createMovement(productId, 'OUTCOME', quantity, documentNumber, 'Відвантаження товару');
        } finally {
            connection.release();
        }
    }
}

export class WriteOffMovementProcessor extends MovementProcessor {
    async process(productId: string, quantity: number, documentNumber: string): Promise<WarehouseMovement> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [check] = await connection.execute(
                `SELECT quantity FROM products WHERE id = ?`,
                [productId]
            );

            if ((check as any[]).length === 0) {
                throw new Error('Товар не знайдено');
            }

            const currentQuantity = (check as any[])[0].quantity;
            const quantityNum = parseInt(quantity.toString());

            if (currentQuantity < quantityNum) {
                throw new Error(`Недостатньо товару. Є: ${currentQuantity} од., потрібно: ${quantityNum} од.`);
            }

            await connection.execute(
                `UPDATE products SET quantity = quantity - ? WHERE id = ?`,
                [quantityNum, productId]
            );

            return this.createMovement(productId, 'WRITE_OFF', quantity, documentNumber, 'Списання товару');
        } finally {
            connection.release();
        }
    }
}

export class MovementProcessorFactory {
    static createProcessor(type: 'INCOME' | 'OUTCOME' | 'WRITE_OFF'): MovementProcessor {
        switch (type) {
            case 'INCOME':
                return new IncomeMovementProcessor();
            case 'OUTCOME':
                return new OutcomeMovementProcessor();
            case 'WRITE_OFF':
                return new WriteOffMovementProcessor();
            default:
                throw new Error(`Unknown movement type: ${type}`);
        }
    }
}