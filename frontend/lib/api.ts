import axios, { AxiosInstance } from 'axios';

interface Product {
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

interface Supplier {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    createdAt: string;
    updatedAt: string;
}

interface Movement {
    id: string;
    productId: string;
    type: 'INCOME' | 'OUTCOME' | 'WRITE_OFF';
    quantity: number;
    date: string;
    documentNumber: string;
    notes: string;
    createdAt: string;
}

interface WarehouseStatus {
    products: Product[];
    stats: {
        total_items: number;
        total_quantity: number;
        total_value: number;
    };
    lowStockItems: Product[];
    lowStockCount: number;
}

class ApiClient {
    private client: AxiosInstance;
    private baseURL: string;

    constructor(baseURL?: string) {
        this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: { 'Content-Type': 'application/json' },
        });

        this.client.interceptors.request.use((config) => {
            const adminToken = localStorage.getItem('adminToken');
            const userToken = localStorage.getItem('userToken');
            
            if (adminToken) {
                config.headers.Authorization = `Bearer ${adminToken}`;
            } else if (userToken) {
                config.headers.Authorization = `Bearer ${userToken}`;
            }
            return config;
        });

        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    const adminToken = localStorage.getItem('adminToken');
                    const userToken = localStorage.getItem('userToken');
                    
                    if (adminToken) {
                        localStorage.removeItem('adminToken');
                        window.location.href = '/admin/login';
                    } else if (userToken) {
                        localStorage.removeItem('userToken');
                        window.location.href = '/user/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    async getProducts(): Promise<Product[]> {
        const response = await this.client.get('/products');
        return response.data || [];
    }

    async getProduct(id: string): Promise<Product> {
        const response = await this.client.get(`/products/${id}`);
        return response.data;
    }

    async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
        const response = await this.client.post('/products', data);
        return response.data;
    }

    async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
        const response = await this.client.put(`/products/${id}`, data);
        return response.data;
    }

    async deleteProduct(id: string): Promise<void> {
        await this.client.delete(`/products/${id}`);
    }

    async getSuppliers(): Promise<Supplier[]> {
        const response = await this.client.get('/suppliers');
        return response.data || [];
    }

    async getSupplier(id: string): Promise<Supplier> {
        const response = await this.client.get(`/suppliers/${id}`);
        return response.data;
    }

    async createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
        const response = await this.client.post('/suppliers', data);
        return response.data;
    }

    async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
        const response = await this.client.put(`/suppliers/${id}`, data);
        return response.data;
    }

    async deleteSupplier(id: string): Promise<void> {
        await this.client.delete(`/suppliers/${id}`);
    }

    async recordMovement(
        productId: string,
        type: 'INCOME' | 'OUTCOME' | 'WRITE_OFF',
        quantity: number,
        documentNumber: string
    ): Promise<Movement> {
        const response = await this.client.post('/warehouse/movement', {
            productId,
            type,
            quantity,
            documentNumber,
        });
        return response.data;
    }

    async getMovements(): Promise<Movement[]> {
        const response = await this.client.get('/warehouse/movements');
        return response.data || [];
    }

    async getMovementsByProduct(productId: string): Promise<Movement[]> {
        const response = await this.client.get(`/warehouse/movements/${productId}`);
        return response.data || [];
    }

    async getWarehouseStatus(): Promise<WarehouseStatus> {
        const response = await this.client.get('/warehouse/status');
        return response.data;
    }

    async getStatusReport(date?: Date): Promise<any> {
        const response = await this.client.get('/reports/status', {
            params: { date: date?.toISOString() },
        });
        return response.data;
    }

    async getDynamicsReport(date?: Date): Promise<any> {
        const response = await this.client.get('/reports/dynamics', {
            params: { date: date?.toISOString() },
        });
        return response.data;
    }

    async getFinancialReport(date?: Date): Promise<any> {
        const response = await this.client.get('/reports/financial', {
            params: { date: date?.toISOString() },
        });
        return response.data;
    }
}

export const apiClient = new ApiClient();