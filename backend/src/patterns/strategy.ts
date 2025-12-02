import { getPool } from '../database';

export interface ReportStrategy {
    generate(date: Date): Promise<any>;
}

export class WarehouseStatusReportStrategy implements ReportStrategy {
    async generate(date: Date): Promise<any> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const dateStr = date.toISOString().split('T')[0];

            const [products] = await connection.execute(
                `SELECT id, name, article, quantity, price, (quantity * price) as total_value
                 FROM products`
            );

            const [movements] = await connection.execute(
                `SELECT * FROM warehouse_movements
                 WHERE DATE(\`date\`) = ?
                 ORDER BY \`date\` DESC`,
                [dateStr]
            );

            const productList = (products as any[]) || [];
            const totalValue = productList.reduce((sum, p) => {
                const value = parseFloat(p.total_value) || 0;
                return sum + value;
            }, 0);

            return {
                date: dateStr,
                products: productList,
                movements: movements || [],
                totalProducts: productList.length,
                totalValue: totalValue.toFixed(2),
                reportType: 'WAREHOUSE_STATUS',
            };
        } finally {
            connection.release();
        }
    }
}

export class MovementDynamicsReportStrategy implements ReportStrategy {
    async generate(startDate: Date): Promise<any> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];

            const [movements] = await connection.execute(
                `SELECT wm.*, p.name, p.article
                 FROM warehouse_movements wm
                          LEFT JOIN products p ON wm.productId = p.id
                 WHERE DATE(wm.\`date\`) BETWEEN ? AND ?
                 ORDER BY wm.\`date\` DESC`,
                [startDateStr, endDateStr]
            );

            const [summary] = await connection.execute(
                `SELECT
                     type,
                     COUNT(*) as count,
                     SUM(quantity) as total_quantity
                 FROM warehouse_movements
                 WHERE DATE(\`date\`) BETWEEN ? AND ?
                 GROUP BY type`,
                [startDateStr, endDateStr]
            );

            return {
                period: { start: startDateStr, end: endDateStr },
                movements: movements || [],
                summary: summary || [],
                reportType: 'MOVEMENT_DYNAMICS',
            };
        } finally {
            connection.release();
        }
    }
}

export class FinancialReportStrategy implements ReportStrategy {
    async generate(date: Date): Promise<any> {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [products] = await connection.execute(
                `SELECT
                     id,
                     name,
                     article,
                     quantity,
                     price,
                     (quantity * price) as total_value,
                     supplierId
                 FROM products`
            );

            const productList = (products as any[]) || [];
            const totalInventoryValue = productList.reduce((sum, p) => {
                const value = parseFloat(p.total_value) || 0;
                return sum + value;
            }, 0);

            const [bySupplier] = await connection.execute(
                `SELECT
                     s.name as supplier,
                     COUNT(p.id) as product_count,
                     SUM(p.quantity * p.price) as supplier_value
                 FROM products p
                          LEFT JOIN suppliers s ON p.supplierId = s.id
                 GROUP BY p.supplierId, s.name`
            );

            return {
                date: date.toISOString().split('T')[0],
                totalInventoryValue: totalInventoryValue.toFixed(2),
                products: productList,
                bySupplier: bySupplier || [],
                reportType: 'FINANCIAL',
            };
        } finally {
            connection.release();
        }
    }
}

export class ReportContext {
    private strategy: ReportStrategy | null = null;

    setStrategy(strategy: ReportStrategy): void {
        this.strategy = strategy;
    }

    async executeReport(date: Date): Promise<any> {
        if (!this.strategy) {
            throw new Error('Report strategy not set');
        }
        return this.strategy.generate(date);
    }
}