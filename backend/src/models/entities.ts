export interface Product {
    id: string;
    name: string;
    article: string;
    quantity: number;
    price: number;
    supplierId: string;
    minStock: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Supplier {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WarehouseMovement {
    id: string;
    productId: string;
    type: 'INCOME' | 'OUTCOME' | 'WRITE_OFF';
    quantity: number;
    date: Date;
    documentNumber: string;
    notes: string;
    createdAt: Date;
}

export interface StockAlert {
    id: string;
    productId: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

export interface WarehouseReport {
    date: Date;
    totalProducts: number;
    totalValue: number;
    lowStockItems: Product[];
    movements: WarehouseMovement[];
}

export interface NotificationObserver {
    update(alert: StockAlert): void;
}

export interface MovementStrategy {
    process(productId: string, quantity: number): Promise<void>;
}

export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: 'USER';
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}