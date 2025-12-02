'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Modal } from '@/components/Modal';

interface SupplierFormProps {
    onSuccess: () => void;
}

export function SupplierForm({ onSuccess }: SupplierFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    });
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.name.trim()) {
            setModalMessage('Будь ласка, введіть назву компанії');
            setModalType('warning');
            setShowModal(true);
            setLoading(false);
            return;
        }

        try {
            await apiClient.createSupplier(formData);
            setFormData({ name: '', phone: '', email: '', address: '' });
            setModalMessage('Постачальник успішно додан');
            setModalType('success');
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
                onSuccess();
            }, 2000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Помилка при створенні';
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
                    🚚 Додати постачальника
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
                        Назва компанії
                    </label>
                    <input
                        type="text"
                        placeholder="Наприклад: ТОВ Глобус"
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
                        Телефон
                    </label>
                    <input
                        type="tel"
                        placeholder="Наприклад: +380 95 123 45 67"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder="Наприклад: info@company.ua"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                        Адреса
                    </label>
                    <input
                        type="text"
                        placeholder="Наприклад: Київ, вул. Пушкіна, 1"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                    {loading ? 'Додавання...' : 'Додати постачальника'}
                </button>
            </form>

            {showModal && (
                <Modal message={modalMessage} type={modalType} onClose={() => setShowModal(false)} />
            )}
        </>
    );
}