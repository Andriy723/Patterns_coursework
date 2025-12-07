'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const email = typeof window !== 'undefined' ? localStorage.getItem('adminEmail') : null;

    useEffect(() => {
        const role = localStorage.getItem('adminRole');
        setIsSuperAdmin(role === 'SUPER_ADMIN');
        setIsAdmin(role === 'ADMIN' || role === 'SUPER_ADMIN');
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const response = await axios.get(`${baseUrl}/warehouse/status`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 15000,
            });

            setStats(response.data?.stats);
            setLowStockProducts(response.data?.lowStockItems || []);
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err: any) {
            console.error('Error fetching stats:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Не вдалось завантажити статистику';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '700' }}>
                    🏭 Адмін-панель
                </h1>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    Ввійшли як: <strong>{email || 'Адмін'}</strong>
                </p>
            </div>

            {error && (
                <div style={{
                    padding: '20px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#991b1b',
                    marginBottom: '20px',
                }}>
                    ⚠️ {error}
                </div>
            )}

            {loading ? (
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
            ) : stats ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                }}>
                    <div style={{
                        backgroundColor: '#dbeafe',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid #bfdbfe',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1e40af' }}>
                            📦 Всього товарів
                        </h3>
                        <p style={{ margin: 0, fontSize: '36px', fontWeight: '700', color: '#1e40af' }}>
                            {stats?.total_items || 0}
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#dcfce7',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid #bbf7d0',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#166534' }}>
                            📊 Загальна кількість
                        </h3>
                        <p style={{ margin: 0, fontSize: '36px', fontWeight: '700', color: '#166534' }}>
                            {stats?.total_quantity || 0} од.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#fef3c7',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid #fcd34d',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#92400e' }}>
                            💰 Загальна вартість
                        </h3>
                        <p style={{ margin: 0, fontSize: '36px', fontWeight: '700', color: '#92400e' }}>
                            ${Number(stats?.total_value ?? 0).toFixed(2)}
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{
                    padding: '60px 40px',
                    textAlign: 'center',
                    backgroundColor: '#fee2e2',
                    borderRadius: '12px',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                }}>
                    <p style={{ margin: 0, fontWeight: '600' }}>Дані недоступні</p>
                </div>
            )}

            {stats && (
                <div style={{ marginTop: '40px' }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}>
                        <h2 style={{
                            margin: '0 0 16px 0',
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#111827',
                        }}>
                            ⚠️ Товари з низьким запасом
                        </h2>
                        {lowStockProducts.length > 0 ? (
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {lowStockProducts.map((product) => (
                                    <div key={product.id} style={{
                                        padding: '12px',
                                        backgroundColor: '#fef3c7',
                                        borderLeft: '4px solid #f59e0b',
                                        borderRadius: '8px',
                                    }}>
                                        <p style={{
                                            margin: '0 0 4px 0',
                                            fontWeight: '600',
                                            color: '#92400e',
                                        }}>
                                            {product.name}
                                        </p>
                                        <p style={{
                                            margin: '0 0 4px 0',
                                            fontSize: '13px',
                                            color: '#92400e',
                                        }}>
                                            Наявно: {product.quantity} од. (мінімум: {product.minStock})
                                        </p>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '12px',
                                            color: '#92400e',
                                            fontFamily: 'monospace',
                                        }}>
                                            {product.article}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#6b7280', margin: 0 }}>Всі товари у нормі ✅</p>
                        )}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #e0f2fe' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📚</span> Швидкі посилання
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    <a href="/admin/products" style={{
                        padding: '16px 12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        textDecoration: 'none',
                        textAlign: 'center',
                        fontWeight: '600',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }}
                    >
                        <span style={{ fontSize: '24px' }}>📋</span>
                        <span style={{ fontSize: '14px' }}>Товари</span>
                    </a>
                    <a href="/admin/suppliers" style={{
                        padding: '16px 12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        textDecoration: 'none',
                        textAlign: 'center',
                        fontWeight: '600',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }}
                    >
                        <span style={{ fontSize: '24px' }}>🚚</span>
                        <span style={{ fontSize: '14px' }}>Постачальники</span>
                    </a>
                    {isAdmin && (
                        <a href="/admin/documents" style={{
                            padding: '16px 12px',
                            backgroundColor: '#ec4899',
                            color: 'white',
                            textDecoration: 'none',
                            textAlign: 'center',
                            fontWeight: '600',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                        }}
                        >
                            <span style={{ fontSize: '24px' }}>📄</span>
                            <span style={{ fontSize: '14px' }}>Документи</span>
                        </a>
                    )}
                    {isSuperAdmin && (
                        <>
                            <a href="/admin/reports" style={{
                                padding: '16px 12px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                textDecoration: 'none',
                                textAlign: 'center',
                                fontWeight: '600',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                            }}
                            >
                                <span style={{ fontSize: '24px' }}>📈</span>
                                <span style={{ fontSize: '14px' }}>Звіти</span>
                            </a>
                            <a href="/admin/admins" style={{
                                padding: '16px 12px',
                                backgroundColor: '#8b5cf6',
                                color: 'white',
                                textDecoration: 'none',
                                textAlign: 'center',
                                fontWeight: '600',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                            }}
                            >
                                <span style={{ fontSize: '24px' }}>👥</span>
                                <span style={{ fontSize: '14px' }}>Адміністратори</span>
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}