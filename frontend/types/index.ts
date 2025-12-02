export interface Product {
    id: string;
    name: string;
    article: string;
    quantity: number;
    price: number;
    supplierId: string;
    minStock: number;
    createdAt: string;
    updatedAt: string;
}

export interface Supplier {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    createdAt: string;
    updatedAt: string;
}

export interface Movement {
    id: string;
    productId: string;
    type: 'INCOME' | 'OUTCOME' | 'WRITE_OFF';
    quantity: number;
    date: string;
    documentNumber: string;
    notes: string;
    createdAt: string;
}

export interface WarehouseStatus {
    products: Product[];
    stats: {
        total_items: number;
        total_quantity: number;
        total_value: number;
    };
    lowStockItems: Product[];
    lowStockCount: number;
}
