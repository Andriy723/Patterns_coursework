'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Supplier } from '@/types';
import { Modal } from '@/components/Modal';

interface ProductFormProps {
    onSuccess: () => void;
}

export function ProductForm({ onSuccess }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        article: '',
        quantity: 0,
        price: 0,
        supplierId: '',
        minStock: 10,
    });
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const data = await apiClient.getSuppliers();
                setSuppliers(data);
            } catch (error) {
                console.error('Error fetching suppliers:', error);
                setModalMessage('Помилка при завантаженні постачальників');
                setModalType('error');
                setShowModal(true);
            }
        };

        fetchSuppliers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.name.trim()) {
            setModalMessage('Будь ласка, введіть назву товару');
            setModalType('warning');
            setShowModal(true);
            setLoading(false);
            return;
        }

        if (!formData.article.trim()) {
            setModalMessage('Будь ласка, введіть артикул');
            setModalType('warning');
            setShowModal(true);
            setLoading(false);
            return;
        }

        if (!formData.supplierId) {
            setModalMessage('Будь ласка, виберіть постачальника');
            setModalType('warning');
            setShowModal(true);
            setLoading(false);
            return;
        }

        try {
            await apiClient.createProduct(formData);
            setFormData({ name: '', article: '', quantity: 0, price: 0, supplierId: '', minStock: 10 });
            setModalMessage('Товар успішно додано');
            setModalType('success');
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
                onSuccess();
            }, 2000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Помилка при створенні товару';
            setModalMessage(errorMessage);
            setModalType('error');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form
                onSubmit={handleSubmit}
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
                <h3
                    style={{
                        margin: '0 0 16px 0',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#111827',
                    }}
                >
                    📦 Додати новий товар
                </h3>

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
                        Назва товару
                    </label>
                    <input
                        type="text"
                        placeholder="Наприклад: Ноутбук Dell"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            opacity: loading ? 0.6 : 1,
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
                        value={formData.article}
                        onChange={(e) => setFormData({ ...formData, article: e.target.value })}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            opacity: loading ? 0.6 : 1,
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
                            placeholder="Наприклад: 100"
                            value={formData.quantity || ''}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value ? Number(e.target.value) : 0 })}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                opacity: loading ? 0.6 : 1,
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
                            onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : 0 })}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                opacity: loading ? 0.6 : 1,
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
                        Постачальник
                    </label>
                    <select
                        value={formData.supplierId}
                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        <option value="">-- Виберіть постачальника --</option>
                        {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                                {supplier.name} ({supplier.phone})
                            </option>
                        ))}
                    </select>
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
                        onChange={(e) => setFormData({ ...formData, minStock: e.target.value ? Number(e.target.value) : 10 })}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            opacity: loading ? 0.6 : 1,
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '12px 16px',
                        backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        marginTop: '8px',
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) {
                            e.currentTarget.style.backgroundColor = '#2563eb';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!loading) {
                            e.currentTarget.style.backgroundColor = '#3b82f6';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }
                    }}
                >
                    {loading ? 'Додавання...' : 'Додати товар'}
                </button>
            </form>

            {showModal && (
                <Modal message={modalMessage} type={modalType} onClose={() => setShowModal(false)} />
            )}
        </>
    );
}