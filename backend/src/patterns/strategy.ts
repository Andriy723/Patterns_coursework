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
                `SELECT p.id, p.name, p.article, p.quantity, p.price, 
                        (p.quantity * p.price) as total_value,
                        s.name as supplierName, p.supplierId
                 FROM products p
                 LEFT JOIN suppliers s ON p.supplierId = s.id`
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
            const endDate = new Date(startDate);
            const startDateYearAgo = new Date(startDate);
            startDateYearAgo.setFullYear(startDateYearAgo.getFullYear() - 1);
            
            const startYear = startDateYearAgo.getUTCFullYear();
            const startMonth = String(startDateYearAgo.getUTCMonth() + 1).padStart(2, '0');
            const startDay = String(startDateYearAgo.getUTCDate()).padStart(2, '0');
            const startDateStr = `${startYear}-${startMonth}-${startDay}`;
            
            const endYear = endDate.getUTCFullYear();
            const endMonth = String(endDate.getUTCMonth() + 1).padStart(2, '0');
            const endDay = String(endDate.getUTCDate()).padStart(2, '0');
            const endDateStr = `${endYear}-${endMonth}-${endDay}`;
            
            const [movements] = await connection.execute(
                `SELECT wm.*, p.name, p.article
                 FROM warehouse_movements wm
                          LEFT JOIN products p ON wm.productId = p.id
                 WHERE DATE_FORMAT(wm.\`date\`, '%Y-%m-%d') >= ?
                   AND DATE_FORMAT(wm.\`date\`, '%Y-%m-%d') <= ?
                 ORDER BY wm.\`date\` DESC`,
                [startDateStr, endDateStr]
            );

            const [summary] = await connection.execute(
                `SELECT
                     type,
                     COUNT(*) as count,
                     SUM(quantity) as total_quantity
                 FROM warehouse_movements
                 WHERE DATE_FORMAT(\`date\`, '%Y-%m-%d') >= ?
                   AND DATE_FORMAT(\`date\`, '%Y-%m-%d') <= ?
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
                     p.id,
                     p.name,
                     p.article,
                     p.quantity,
                     p.price,
                     (p.quantity * p.price) as total_value,
                     p.supplierId,
                     s.name as supplierName
                 FROM products p
                 LEFT JOIN suppliers s ON p.supplierId = s.id`
            );

            const productList = (products as any[]) || [];
            const totalInventoryValue = productList.reduce((sum, p) => {
                const value = parseFloat(p.total_value) || 0;
                return sum + value;
            }, 0);

            const [bySupplierRows] = await connection.execute(
                `SELECT
                     s.name as supplierName,
                     COUNT(p.id) as product_count,
                     SUM(p.quantity * p.price) as supplier_value
                 FROM products p
                          LEFT JOIN suppliers s ON p.supplierId = s.id
                 GROUP BY p.supplierId, s.name
                 ORDER BY supplier_value DESC`
            );

            const bySupplier = (bySupplierRows as any[] || []).map((s: any) => ({
                supplier: s.supplierName || 'Без постачальника',
                product_count: s.product_count,
                supplier_value: s.supplier_value
            }));

            return {
                date: date.toISOString().split('T')[0],
                totalInventoryValue: totalInventoryValue.toFixed(2),
                products: productList,
                bySupplier: bySupplier,
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