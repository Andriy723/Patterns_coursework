'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { Modal } from '@/components/Modal';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
    const [recentMovements, setRecentMovements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statusData, movementsData] = await Promise.all([
                apiClient.getWarehouseStatus(),
                apiClient.getMovements(),
            ]);

            setStats(statusData.stats);
            setLowStockProducts(statusData.lowStockItems);
            setRecentMovements(movementsData.slice(0, 5));
        } catch (error) {
            console.error('Error:', error);
            setModalMessage('Помилка при завантаженні даних');
            setModalType('error');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const getMovementTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            INCOME: '#10b981',
            OUTCOME: '#f59e0b',
            WRITE_OFF: '#ef4444',
        };
        return colors[type] || '#6b7280';
    };

    const getMovementTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            INCOME: '📥 Поповнення',
            OUTCOME: '📤 Відвантаження',
            WRITE_OFF: '🗑️ Списання',
        };
        return labels[type] || type;
    };

    return (
        <>
            <Navigation />
            <main style={{
                flex: 1,
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                padding: '20px',
            }}>
                <h1 style={{ margin: '0 0 30px 0', fontSize: '28px', fontWeight: '700' }}>
                    📊 Панель керування складом
                </h1>

                {loading ? (
                    <div style={{
                        padding: '60px 40px',
                        textAlign: 'center',
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                        color: '#6b7280',
                    }}>
                        <p style={{ fontSize: '18px' }}>⏳ Завантаження...</p>
                    </div>
                ) : stats ? (
                    <div style={{ display: 'grid', gap: '30px' }}>
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
                                <h3 style={{
                                    margin: '0 0 16px 0',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    color: '#1e40af',
                                }}>
                                    📦 Загально товарів
                                </h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: '36px',
                                    fontWeight: '700',
                                    color: '#1e40af',
                                }}>
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
                                <h3 style={{
                                    margin: '0 0 16px 0',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    color: '#166534',
                                }}>
                                    📊 Загальна кількість
                                </h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: '36px',
                                    fontWeight: '700',
                                    color: '#166534',
                                }}>
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
                                <h3 style={{
                                    margin: '0 0 16px 0',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    color: '#92400e',
                                }}>
                                    💰 Сума залишків
                                </h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: '36px',
                                    fontWeight: '700',
                                    color: '#92400e',
                                }}>
                                    ${Number(stats?.total_value ?? 0).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                                    📝 Останні операції
                                </h2>
                                {recentMovements.length > 0 ? (
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {recentMovements.map((movement) => (
                                            <div key={movement.id} style={{
                                                padding: '12px',
                                                backgroundColor: '#f9fafb',
                                                borderLeft: `4px solid ${getMovementTypeColor(movement.type)}`,
                                                borderRadius: '8px',
                                            }}>
                                                <p style={{
                                                    margin: '0 0 4px 0',
                                                    fontWeight: '600',
                                                    color: getMovementTypeColor(movement.type),
                                                }}>
                                                    {getMovementTypeLabel(movement.type)} — {movement.quantity} од.
                                                </p>
                                                <p style={{
                                                    margin: '0 0 4px 0',
                                                    fontSize: '13px',
                                                    color: '#6b7280',
                                                }}>
                                                    Документ: {movement.documentNumber}
                                                </p>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '12px',
                                                    color: '#9ca3af',
                                                }}>
                                                    {new Date(movement.date).toLocaleString('uk-UA')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#6b7280', margin: 0 }}>Нема операцій</p>
                                )}
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: '#f0f9ff',
                            padding: '24px',
                            borderRadius: '12px',
                            border: '1px solid #e0f2fe',
                        }}>
                            <h3 style={{
                                margin: '0 0 16px 0',
                                fontSize: '16px',
                                fontWeight: '700',
                                color: '#0369a1',
                            }}>
                                📚 Швидкі посилання
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '12px',
                            }}>
                                <a href="/products" style={{
                                    padding: '12px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                }}
                                   onMouseEnter={(e) => {
                                       e.currentTarget.style.backgroundColor = '#2563eb';
                                       e.currentTarget.style.transform = 'translateY(-2px)';
                                   }}
                                   onMouseLeave={(e) => {
                                       e.currentTarget.style.backgroundColor = '#3b82f6';
                                       e.currentTarget.style.transform = 'translateY(0)';
                                   }}>
                                    📋 Товари
                                </a>
                                <a href="/warehouse" style={{
                                    padding: '12px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                }}
                                   onMouseEnter={(e) => {
                                       e.currentTarget.style.backgroundColor = '#059669';
                                       e.currentTarget.style.transform = 'translateY(-2px)';
                                   }}
                                   onMouseLeave={(e) => {
                                       e.currentTarget.style.backgroundColor = '#10b981';
                                       e.currentTarget.style.transform = 'translateY(0)';
                                   }}>
                                    🏭 Управління рухом
                                </a>
                                <a href="/suppliers" style={{
                                    padding: '12px',
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                }}
                                   onMouseEnter={(e) => {
                                       e.currentTarget.style.backgroundColor = '#d97706';
                                       e.currentTarget.style.transform = 'translateY(-2px)';
                                   }}
                                   onMouseLeave={(e) => {
                                       e.currentTarget.style.backgroundColor = '#f59e0b';
                                       e.currentTarget.style.transform = 'translateY(0)';
                                   }}>
                                    🚚 Постачальники
                                </a>
                            </div>
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
                        <p style={{ margin: 0, fontWeight: '600' }}>
                            Помилка при завантаженні даних
                        </p>
                    </div>
                )}
            </main>

            {showModal && (
                <Modal
                    message={modalMessage}
                    type={modalType}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}