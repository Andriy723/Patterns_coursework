'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import type { WarehouseStatus } from '@/types';

export default function HomePage() {
    const [status, setStatus] = useState<WarehouseStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [apiUrl, setApiUrl] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            const userToken = localStorage.getItem('userToken');
            const adminToken = localStorage.getItem('adminToken');
            if (!userToken && !adminToken) {
                setIsAuthenticated(false);
                router.replace('/user/login');
                return;
            }
            setIsAuthenticated(true);
        };
        checkAuth();
    }, []);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            const data = await apiClient.getWarehouseStatus();
            setStatus(data);
        } catch (error) {
            console.error('Error fetching warehouse status:', error);
            setStatus(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchStatus();
        }
    }, [apiUrl, isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '18px', color: '#6b7280' }}>⏳ Перевірка авторизації...</p>
            </div>
        );
    }

    return (
        <>
            <Navigation />
            <main
                style={{
                    flex: 1,
                    maxWidth: '1200px',
                    margin: '0 auto',
                    width: '100%',
                    padding: '20px',
                }}
            >
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ margin: '0 0 20px 0', fontSize: '28px', fontWeight: '700' }}>
                        🏭 Система складського обліку
                    </h1>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>
                        Управління товарами, постачальниками та рухом на складі
                    </p>
                </div>

                {loading ? (
                    <div
                        style={{
                            padding: '40px',
                            textAlign: 'center',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            color: '#6b7280',
                        }}
                    >
                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
                        <p>Завантаження даних...</p>
                    </div>
                ) : status ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '20px',
                            marginTop: '20px',
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: '#dbeafe',
                                padding: '24px',
                                borderRadius: '12px',
                                border: '1px solid #bfdbfe',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                            }}
                        >
                            <h3
                                style={{
                                    margin: '0 0 16px 0',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    color: '#1e40af',
                                }}
                            >
                                📊 Загальна статистика
                            </h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <p style={{ margin: 0, color: '#1e40af', fontSize: '14px' }}>
                                    Товарів:{' '}
                                    <strong style={{ fontSize: '18px' }}>
                                        {status.stats.total_items}
                                    </strong>
                                </p>
                                <p style={{ margin: 0, color: '#1e40af', fontSize: '14px' }}>
                                    Загальна кількість:{' '}
                                    <strong style={{ fontSize: '18px' }}>
                                        {status.stats.total_quantity} од.
                                    </strong>
                                </p>
                                <p style={{ margin: 0, color: '#1e40af', fontSize: '14px' }}>
                                    Сума залишків:{' '}
                                    <strong style={{ fontSize: '18px' }}>
                                        ${Number(status.stats.total_value ?? 0).toFixed(2)}
                                    </strong>
                                </p>
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: '#fef3c7',
                                padding: '24px',
                                borderRadius: '12px',
                                border: '1px solid #fcd34d',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                            }}
                        >
                            <h3
                                style={{
                                    margin: '0 0 16px 0',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    color: '#92400e',
                                }}
                            >
                                ⚠️ Низький запас
                            </h3>
                            <p style={{ margin: '0 0 12px 0', color: '#92400e', fontSize: '14px' }}>
                                Товарів з низьким запасом:{' '}
                                <strong style={{ fontSize: '18px' }}>
                                    {status.lowStockCount}
                                </strong>
                            </p>
                            {status.lowStockItems.length > 0 && (
                                <ul
                                    style={{
                                        margin: 0,
                                        paddingLeft: '20px',
                                        fontSize: '13px',
                                        color: '#92400e',
                                    }}
                                >
                                    {status.lowStockItems.slice(0, 3).map((item) => (
                                        <li key={item.id} style={{ marginBottom: '4px' }}>
                                            {item.name}: {item.quantity} од.
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div
                            style={{
                                backgroundColor: '#f3e8ff',
                                padding: '24px',
                                borderRadius: '12px',
                                border: '1px solid #e9d5ff',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                            }}
                        >
                            <h3
                                style={{
                                    margin: '0 0 16px 0',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    color: '#6b21a8',
                                }}
                            >
                                🔗 Швидкі посилання
                            </h3>
                            <ul
                                style={{
                                    margin: 0,
                                    paddingLeft: '20px',
                                    display: 'grid',
                                    gap: '8px',
                                }}
                            >
                                <li>
                                    <a
                                        href="/products"
                                        style={{
                                            color: '#6b21a8',
                                            textDecoration: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.textDecoration = 'underline';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.textDecoration = 'none';
                                        }}
                                    >
                                        📋 Переглянути товари
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/warehouse"
                                        style={{
                                            color: '#6b21a8',
                                            textDecoration: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.textDecoration = 'underline';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.textDecoration = 'none';
                                        }}
                                    >
                                        🏭 Управління рухом
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/reports"
                                        style={{
                                            color: '#6b21a8',
                                            textDecoration: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.textDecoration = 'underline';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.textDecoration = 'none';
                                        }}
                                    >
                                        📈 Звіти
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            padding: '40px',
                            textAlign: 'center',
                            backgroundColor: '#fee2e2',
                            borderRadius: '12px',
                            border: '1px solid #fecaca',
                            color: '#991b1b',
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>❌</div>
                        <p style={{ margin: 0, fontWeight: '600' }}>
                            Помилка при завантаженні даних
                        </p>
                        <p
                            style={{
                                margin: '8px 0 0 0',
                                fontSize: '13px',
                                opacity: 0.9,
                            }}
                        >
                            Перевірте підключення до API сервера
                        </p>
                    </div>
                )}
            </main>
        </>
    );
}