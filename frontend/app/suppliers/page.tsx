'use client';

import { apiClient } from '@/lib/api';
import type { Supplier } from '@/types';
import { useEffect, useState } from 'react';
import { Navigation } from "@/components/Navigation.tsx";

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const data = await apiClient.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
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
                <div style={{
                    marginBottom: '30px',
                }}>
                    <h1 style={{
                        margin: '0 0 10px 0',
                        fontSize: '28px',
                        fontWeight: '700',
                    }}>
                        🚚 Постачальники
                    </h1>
                    <p style={{
                        margin: 0,
                        color: '#6b7280',
                        fontSize: '14px',
                    }}>
                        Список всіх постачальників товарів
                    </p>
                </div>

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
                ) : suppliers.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px',
                    }}>
                        {suppliers.map((supplier) => (
                            <div key={supplier.id} style={{
                                backgroundColor: '#ffffff',
                                padding: '24px',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.2s',
                            }}
                                 onMouseEnter={(e) => {
                                     e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                                     e.currentTarget.style.transform = 'translateY(-4px)';
                                 }}
                                 onMouseLeave={(e) => {
                                     e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                     e.currentTarget.style.transform = 'translateY(0)';
                                 }}>
                                <h3 style={{
                                    margin: '0 0 16px 0',
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#111827',
                                }}>
                                    {supplier.name}
                                </h3>

                                <div style={{
                                    display: 'grid',
                                    gap: '12px',
                                }}>
                                    {supplier.phone && (
                                        <div>
                                            <p style={{
                                                margin: '0 0 4px 0',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: '#6b7280',
                                                textTransform: 'uppercase',
                                            }}>
                                                📞 Телефон
                                            </p>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '14px',
                                                color: '#111827',
                                            }}>
                                                {supplier.phone}
                                            </p>
                                        </div>
                                    )}

                                    {supplier.email && (
                                        <div>
                                            <p style={{
                                                margin: '0 0 4px 0',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: '#6b7280',
                                                textTransform: 'uppercase',
                                            }}>
                                                ✉️ Email
                                            </p>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '14px',
                                                color: '#111827',
                                                wordBreak: 'break-word',
                                            }}>
                                                {supplier.email}
                                            </p>
                                        </div>
                                    )}

                                    {supplier.address && (
                                        <div>
                                            <p style={{
                                                margin: '0 0 4px 0',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: '#6b7280',
                                                textTransform: 'uppercase',
                                            }}>
                                                📍 Адреса
                                            </p>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '14px',
                                                color: '#111827',
                                            }}>
                                                {supplier.address}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        padding: '60px 40px',
                        textAlign: 'center',
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                        color: '#6b7280',
                    }}>
                        <p style={{ fontSize: '18px' }}>Постачальники не знайдені</p>
                    </div>
                )}

                <div style={{
                    marginTop: '40px',
                    padding: '20px',
                    backgroundColor: '#e0f2fe',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    color: '#0369a1',
                    fontSize: '13px',
                }}>
                    <p style={{ margin: 0 }}>
                        ℹ️ Ви можете переглядати інформацію про постачальників. Для редагування або додавання нових постачальників звертайтеся до адміністратора.
                    </p>
                </div>
            </main>
        </>
    );
}