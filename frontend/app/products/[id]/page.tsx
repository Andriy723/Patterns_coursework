'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { Product } from '@/types';
import { Navigation } from '@/components/Navigation';
import { Modal } from '@/components/Modal';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [updating, setUpdating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
    const router = useRouter();

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getProduct(params.id);
            setProduct(data);
            setFormData(data);
        } catch (error) {
            console.error('Error fetching product:', error);
            setModalMessage('Помилка при завантаженні товару');
            setModalType('error');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const dataToSend = {
                name: formData.name,
                article: formData.article,
                quantity: formData.quantity,
                price: formData.price,
                minStock: formData.minStock,
                supplierId: formData.supplierId,
            };

            await apiClient.updateProduct(params.id, dataToSend);
            setProduct({ ...product, ...formData } as Product);
            setEditing(false);
            setModalMessage('Товар успішно оновлено');
            setModalType('success');
            setShowModal(true);
        } catch (error: any) {
            console.error('Update error:', error);
            const errorMessage = error.response?.data?.error || 'Помилка при оновленні';
            setModalMessage(errorMessage);
            setModalType('error');
            setShowModal(true);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
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
                    <div
                        style={{
                            padding: '60px 40px',
                            textAlign: 'center',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            color: '#6b7280',
                        }}
                    >
                        <p style={{ fontSize: '18px' }}>⏳ Завантаження...</p>
                    </div>
                </main>
            </>
        );
    }

    if (!product) {
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
                    <div
                        style={{
                            padding: '60px 40px',
                            textAlign: 'center',
                            backgroundColor: '#fee2e2',
                            borderRadius: '12px',
                            border: '1px solid #fecaca',
                            color: '#991b1b',
                        }}
                    >
                        <p style={{ margin: 0, fontWeight: '600' }}>Товар не знайдено</p>
                    </div>
                </main>
            </>
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
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '30px',
                    }}
                >
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
                        {product.name}
                    </h1>
                    <button
                        onClick={() => setEditing(!editing)}
                        disabled={updating}
                        style={{
                            padding: '12px 20px',
                            backgroundColor:
                                editing || updating ? '#9ca3af' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: updating ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!editing && !updating) {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!editing && !updating) {
                                e.currentTarget.style.backgroundColor = '#3b82f6';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {editing ? 'Скасувати' : 'Редагувати'}
                    </button>
                </div>

                {editing ? (
                    <form
                        onSubmit={handleUpdate}
                        style={{
                            display: 'grid',
                            gap: '16px',
                            maxWidth: '500px',
                            padding: '24px',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#6b7280',
                                    marginBottom: '6px',
                                }}
                            >
                                Назва
                            </label>
                            <input
                                type="text"
                                placeholder="Наприклад: Ноутбук Dell"
                                value={formData.name || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                disabled={updating}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    opacity: updating ? 0.6 : 1,
                                }}
                            />
                        </div>

                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#6b7280',
                                    marginBottom: '6px',
                                }}
                            >
                                Артикул
                            </label>
                            <input
                                type="text"
                                placeholder="Наприклад: NB-2024-001"
                                value={formData.article || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, article: e.target.value })
                                }
                                disabled={updating}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    opacity: updating ? 0.6 : 1,
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#6b7280',
                                        marginBottom: '6px',
                                    }}
                                >
                                    Кількість (од.)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Наприклад: 50"
                                    value={formData.quantity || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            quantity: e.target.value ? Number(e.target.value) : 0,
                                        })
                                    }
                                    disabled={updating}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        opacity: updating ? 0.6 : 1,
                                    }}
                                />
                            </div>

                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#6b7280',
                                        marginBottom: '6px',
                                    }}
                                >
                                    Ціна (USD)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Наприклад: 1299.99"
                                    step="0.01"
                                    value={formData.price || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            price: e.target.value ? Number(e.target.value) : 0,
                                        })
                                    }
                                    disabled={updating}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        opacity: updating ? 0.6 : 1,
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#6b7280',
                                    marginBottom: '6px',
                                }}
                            >
                                Мінімальний запас (од.)
                            </label>
                            <input
                                type="number"
                                placeholder="Наприклад: 20"
                                value={formData.minStock || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        minStock: e.target.value ? Number(e.target.value) : 10,
                                    })
                                }
                                disabled={updating}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    opacity: updating ? 0.6 : 1,
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={updating}
                            style={{
                                padding: '12px 16px',
                                backgroundColor: updating ? '#9ca3af' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: updating ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                marginTop: '8px',
                            }}
                            onMouseEnter={(e) => {
                                if (!updating) {
                                    e.currentTarget.style.backgroundColor = '#059669';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!updating) {
                                    e.currentTarget.style.backgroundColor = '#10b981';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            {updating ? 'Збереження...' : 'Зберегти'}
                        </button>
                    </form>
                ) : (
                    <div
                        style={{
                            backgroundColor: '#ffffff',
                            padding: '24px',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <p
                                    style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Артикул
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#111827',
                                        fontFamily: 'monospace',
                                    }}
                                >
                                    {product.article}
                                </p>
                            </div>
                            <div>
                                <p
                                    style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Кількість
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color:
                                            product.quantity <= product.minStock
                                                ? '#dc2626'
                                                : '#111827',
                                    }}
                                >
                                    {product.quantity} од.
                                </p>
                            </div>
                            <div>
                                <p
                                    style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Ціна
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#111827',
                                    }}
                                >
                                    ${Number(product.price || 0).toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p
                                    style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Мінімальний запас
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#111827',
                                    }}
                                >
                                    {product.minStock} од.
                                </p>
                            </div>
                            <div>
                                <p
                                    style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    ID постачальника
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        color: '#111827',
                                        fontFamily: 'monospace',
                                    }}
                                >
                                    {product.supplierId || '—'}
                                </p>
                            </div>
                            <div>
                                <p
                                    style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Створено
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        color: '#111827',
                                    }}
                                >
                                    {new Date(product.createdAt).toLocaleString('uk-UA')}
                                </p>
                            </div>
                        </div>
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