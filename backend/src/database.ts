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
            CREATE TABLE IF NOT EXISTS counterparties (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                email VARCHAR(255),
                address VARCHAR(500),
                taxId VARCHAR(50),
                notes VARCHAR(1000),
                type ENUM('SUPPLIER', 'CLIENT', 'PARTNER', 'OTHER') DEFAULT 'OTHER',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_name (name),
                INDEX idx_type (type)
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id VARCHAR(36) PRIMARY KEY,
                counterpartyId VARCHAR(36),
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                email VARCHAR(255),
                address VARCHAR(500),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (counterpartyId) REFERENCES counterparties(id) ON DELETE SET NULL,
                INDEX idx_counterpartyId (counterpartyId)
            )
        `);

        try {
            const [columns] = await connection.execute(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'suppliers' 
                AND COLUMN_NAME = 'counterpartyId'
            `);
            
            if ((columns as any[]).length === 0) {
                console.log('Adding counterpartyId column to suppliers table...');
                await connection.execute(`
                    ALTER TABLE suppliers 
                    ADD COLUMN counterpartyId VARCHAR(36) AFTER id
                `);
                try {
                    await connection.execute(`
                        ALTER TABLE suppliers 
                        ADD CONSTRAINT fk_suppliers_counterparty 
                        FOREIGN KEY (counterpartyId) REFERENCES counterparties(id) ON DELETE SET NULL
                    `);
                } catch (fkError: any) {
                    if (!fkError.message.includes('Duplicate foreign key')) {
                        console.warn('Could not add foreign key for suppliers.counterpartyId:', fkError.message);
                    }
                }
                console.log('✅ counterpartyId column added to suppliers table');
            }
        } catch (error: any) {
            console.warn('Could not add counterpartyId column to suppliers:', error.message);
        }

        try {
            const [columns] = await connection.execute(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'counterparties' 
                AND COLUMN_NAME = 'type'
            `);
            
            if ((columns as any[]).length === 0) {
                console.log('Adding type column to counterparties table...');
                await connection.execute(`
                    ALTER TABLE counterparties 
                    ADD COLUMN type ENUM('SUPPLIER', 'CLIENT', 'PARTNER', 'OTHER') DEFAULT 'OTHER' AFTER notes
                `);
                console.log('✅ type column added to counterparties table');
            }
        } catch (error: any) {
            console.warn('Could not add type column to counterparties:', error.message);
        }

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

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role ENUM('USER') DEFAULT 'USER',
                isActive BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS counterparties (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                email VARCHAR(255),
                address VARCHAR(500),
                taxId VARCHAR(50),
                notes VARCHAR(1000),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_name (name)
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS documents (
                id VARCHAR(36) PRIMARY KEY,
                documentNumber VARCHAR(100) NOT NULL UNIQUE,
                type ENUM('INVOICE', 'ACT') NOT NULL,
                documentDate DATETIME NOT NULL,
                supplierId VARCHAR(36),
                counterpartyId VARCHAR(36),
                counterpartyName VARCHAR(255),
                counterpartyPhone VARCHAR(20),
                counterpartyEmail VARCHAR(255),
                counterpartyAddress VARCHAR(500),
                totalAmount DECIMAL(10, 2) DEFAULT 0,
                notes VARCHAR(1000),
                status ENUM('DRAFT', 'CONFIRMED', 'CANCELLED') DEFAULT 'DRAFT',
                createdBy VARCHAR(36),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (supplierId) REFERENCES suppliers(id) ON DELETE SET NULL,
                FOREIGN KEY (counterpartyId) REFERENCES counterparties(id) ON DELETE SET NULL,
                INDEX idx_documentNumber (documentNumber),
                INDEX idx_documentDate (documentDate),
                INDEX idx_type (type)
            )
        `);

        try {
            const [columns] = await connection.execute(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'documents' 
                AND COLUMN_NAME = 'counterpartyId'
            `);
            
            if ((columns as any[]).length === 0) {
                console.log('Adding counterpartyId column to documents table...');
                await connection.execute(`
                    ALTER TABLE documents 
                    ADD COLUMN counterpartyId VARCHAR(36) AFTER supplierId
                `);
                try {
                    await connection.execute(`
                        ALTER TABLE documents 
                        ADD CONSTRAINT fk_documents_counterparty 
                        FOREIGN KEY (counterpartyId) REFERENCES counterparties(id) ON DELETE SET NULL
                    `);
                } catch (fkError: any) {
                    if (!fkError.message.includes('Duplicate foreign key')) {
                        console.warn('Could not add foreign key for counterpartyId:', fkError.message);
                    }
                }
                console.log('✅ counterpartyId column added to documents table');
            }
        } catch (error: any) {
            console.warn('Could not add counterpartyId column (might already exist):', error.message);
        }

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS document_items (
                id VARCHAR(36) PRIMARY KEY,
                documentId VARCHAR(36) NOT NULL,
                productId VARCHAR(36) NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                total DECIMAL(10, 2) NOT NULL,
                notes VARCHAR(500),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
                FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
                INDEX idx_documentId (documentId),
                INDEX idx_productId (productId)
            )
        `);

        const defaultUserEmail = process.env.DEFAULT_USER_EMAIL || 'user1@warehouse.local';
        const defaultUserPassword = process.env.DEFAULT_USER_PASSWORD || 'User123!';

        const [existingUser] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [defaultUserEmail]
        );
        if ((existingUser as any[]).length === 0) {
            const hashed = await bcrypt.hash(defaultUserPassword, 10);
            await connection.execute(
                'INSERT INTO users (id, email, password, name, role, isActive) VALUES (?, ?, ?, ?, ?, ?)',
                ['user-001', defaultUserEmail, hashed, 'User One', 'USER', true]
            );
            console.log(`✅ Default USER created: ${defaultUserEmail}`);
        }

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