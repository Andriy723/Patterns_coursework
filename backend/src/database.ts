// backend/src/database.ts
import mysql from 'mysql2/promise';
import { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

let pool: Pool;

export async function initializeDatabase(): Promise<Pool> {
    pool = await mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'warehouse_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });

    await createTables();
    return pool;
}

export function getPool(): Pool {
    return pool;
}

async function createTables(): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS suppliers (
                                                     id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                email VARCHAR(255),
                address VARCHAR(500),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS products (
                                                    id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                article VARCHAR(100) NOT NULL,
                quantity INT NOT NULL DEFAULT 0,
                price DECIMAL(10, 2) NOT NULL,
                supplierId VARCHAR(36),
                minStock INT DEFAULT 10,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (supplierId) REFERENCES suppliers(id) ON DELETE SET NULL,
                INDEX idx_article (article)
                )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS warehouse_movements (
                                                               id VARCHAR(36) PRIMARY KEY,
                productId VARCHAR(36) NOT NULL,
                type ENUM('INCOME', 'OUTCOME', 'WRITE_OFF') NOT NULL,
                quantity INT NOT NULL,
                \`date\` DATETIME DEFAULT CURRENT_TIMESTAMP,
                documentNumber VARCHAR(100),
                notes VARCHAR(500),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
                INDEX idx_productId (productId),
                INDEX idx_date (\`date\`)
                )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS stock_alerts (
                                                        id VARCHAR(36) PRIMARY KEY,
                productId VARCHAR(36) NOT NULL,
                message VARCHAR(500) NOT NULL,
                isRead BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
                )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admin_users (
                                                       id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('SUPER_ADMIN', 'ADMIN', 'USER') DEFAULT 'USER',
                isActive BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
        `);

        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@warehouse.local';
        const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!';

        const [existing] = await connection.execute(
            'SELECT id FROM admin_users WHERE email = ?',
            [superAdminEmail]
        );

        if ((existing as any[]).length === 0) {
            const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
            await connection.execute(
                'INSERT INTO admin_users (id, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)',
                ['super-admin-001', superAdminEmail, hashedPassword, 'SUPER_ADMIN', true]
            );
            console.log(`✅ Super admin created: ${superAdminEmail}`);
        }

        console.log('✅ Database tables initialized');
    } finally {
        connection.release();
    }
}