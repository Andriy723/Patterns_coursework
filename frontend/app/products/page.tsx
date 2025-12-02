'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
    id: string;
    name: string;
    article: string;
    quantity: number;
    price: number;
    minStock: number;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('adminRole');
        setIsSuperAdmin(role === 'SUPER_ADMIN');
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const response = await axios.get(`${baseUrl}/products`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
                    📋 Products
                </h1>
                {isSuperAdmin && (
                    <a href="/admin/products/create" style={{
                        padding: '12px 20px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                    }}>
                        ➕ Add Product
                    </a>
                )}
            </div>

            {loading ? (
                <div style={{ padding: '60px 40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                    <p style={{ fontSize: '18px', color: '#6b7280' }}>⏳ Loading...</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Name</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Article</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Qty</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Price</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Min Stock</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((product) => (
                            <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>{product.name}</td>
                                <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>{product.article}</td>
                                <td style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    fontSize: '14px',
                                    color: product.quantity <= product.minStock ? '#dc2626' : '#111827',
                                    fontWeight: product.quantity <= product.minStock ? '700' : 'normal',
                                }}>
                                    {product.quantity}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: '#111827' }}>
                                    ${Number(product.price).toFixed(2)}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#111827' }}>
                                    {product.minStock}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {products.length === 0 && (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            color: '#6b7280',
                        }}>
                            No products available
                        </div>
                    )}
                </div>
            )}

            {!isSuperAdmin && (
                <div style={{
                    marginTop: '20px',
                    padding: '12px',
                    backgroundColor: '#e0f2fe',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    color: '#0369a1',
                    fontSize: '13px',
                }}>
                    ℹ️ Only Super Admins can add or edit products
                </div>
            )}
        </div>
    );
}