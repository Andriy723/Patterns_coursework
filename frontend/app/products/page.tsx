'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { UserNavigation } from '@/components/UserNavigation';
import type { WarehouseStatus } from '@/types';

interface PublicProduct {
    id: string;
    name: string;
    article: string;
    quantity: number;
    minStock: number;
}

export default function UserProductsPage() {
    const [products, setProducts] = useState<PublicProduct[]>([]);
    const [status, setStatus] = useState<WarehouseStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
            return;
        }
        
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminRole');
        
        const userToken = localStorage.getItem('userToken');
        
        if (!userToken) {
            router.replace('/user/login');
            return;
        }
        
        fetchData();
    }, [router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const [productsRes, statusData] = await Promise.all([
                axios.get(`${baseUrl}/products/public-simple`, { timeout: 15000 }),
                apiClient.getWarehouseStatus().catch(() => null)
            ]);
            
            setProducts(productsRes.data || []);
            setStatus(statusData);
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err: any) {
            console.error('[PRODUCTS PAGE] Error fetching data:', err);
            setError(err.response?.data?.error || 'Не вдалось завантажити дані. Спробуйте оновити сторінку.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        router.push('/user/login');
    };

    if (loading) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100vh',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</p>
                    <p style={{ fontSize: '18px', color: '#6b7280' }}>Завантаження...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <UserNavigation onLogout={handleLogout} />
            <main style={{
                flex: 1,
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                padding: '20px',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                }}>
                    <div>
                        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '700' }}>
                            📋 Склад: Список товарів
                        </h1>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                            Ви увійшли як користувач
                        </p>
                    </div>
                </div>

                {status && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '20px',
                        marginBottom: '30px',
                    }}>
                        <div style={{
                            backgroundColor: '#dbeafe',
                            padding: '20px',
                            borderRadius: '12px',
                            border: '1px solid #bfdbfe',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        }}>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#1e40af' }}>
                                📦 Всього товарів
                            </h3>
                            <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1e40af' }}>
                                {status.stats.total_items || 0}
                            </p>
                        </div>

                        <div style={{
                            backgroundColor: '#dcfce7',
                            padding: '20px',
                            borderRadius: '12px',
                            border: '1px solid #bbf7d0',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        }}>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#166534' }}>
                                📊 Загальна кількість
                            </h3>
                            <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#166534' }}>
                                {status.stats.total_quantity || 0} од.
                            </p>
                        </div>

                        <div style={{
                            backgroundColor: '#fef3c7',
                            padding: '20px',
                            borderRadius: '12px',
                            border: '1px solid #fcd34d',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        }}>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#92400e' }}>
                                ⚠️ Низький запас
                            </h3>
                            <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#92400e' }}>
                                {status.lowStockCount || 0}
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        color: '#991b1b',
                        marginBottom: '20px',
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                            Список товарів
                        </h2>
                        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                            Тут відображаються всі товари на складі (без цін)
                        </p>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '13px', color: '#111827' }}>
                                        Назва
                                    </th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '13px', color: '#111827' }}>
                                        Артикул
                                    </th>
                                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', fontSize: '13px', color: '#111827' }}>
                                        Залишок
                                    </th>
                                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', fontSize: '13px', color: '#111827' }}>
                                        Мінімум
                                    </th>
                                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', fontSize: '13px', color: '#111827' }}>
                                        Статус
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p, index) => (
                                    <tr
                                        key={p.id}
                                        style={{
                                            borderBottom: '1px solid #e5e7eb',
                                            backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                                        }}
                                    >
                                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                                            {p.name}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>
                                            {p.article}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#111827', fontWeight: '600' }}>
                                            {p.quantity} од.
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                                            {p.minStock} од.
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            {p.quantity <= p.minStock ? (
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    backgroundColor: '#fee2e2',
                                                    color: '#991b1b',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                }}>
                                                    ⚠️ Низький
                                                </span>
                                            ) : (
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    backgroundColor: '#dcfce7',
                                                    color: '#166534',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                }}>
                                                    ✅ Норма
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {products.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                            <p style={{ margin: 0, fontSize: '16px' }}>📭 Товарів немає</p>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}