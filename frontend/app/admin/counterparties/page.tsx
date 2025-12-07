'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal } from '@/components/Modal';

interface Supplier {
    id: string;
    name: string;
}

interface Counterparty {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    taxId?: string;
    notes?: string;
    type?: 'SUPPLIER' | 'CLIENT' | 'PARTNER' | 'OTHER';
    suppliers?: Supplier[];
    createdAt: string;
    updatedAt: string;
}

export default function CounterpartiesPage() {
    const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingCounterparty, setEditingCounterparty] = useState<Counterparty | null>(null);
    const [deletingCounterparty, setDeletingCounterparty] = useState<Counterparty | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        taxId: '',
        notes: '',
    });

    useEffect(() => {
        fetchCounterparties();
    }, []);

    const fetchCounterparties = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                setError('Необхідна авторизація');
                setLoading(false);
                return;
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const response = await axios.get(`${baseUrl}/counterparties`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 15000,
            });

            setCounterparties(response.data || []);
            setError('');
        } catch (err: any) {
            console.error('Error fetching counterparties:', err);
            let errorMessage = 'Помилка завантаження контрагентів';
            
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                errorMessage = 'Не вдалося підключитися до сервера. Перевірте, чи запущений backend сервер.';
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            
            if (err.response?.status === 401 || err.response?.status === 403) {
                setModalMessage('Помилка авторизації. Будь ласка, увійдіть знову.');
                setModalType('error');
                setShowModal(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            address: '',
            taxId: '',
            notes: '',
        });
        setEditingCounterparty(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setModalMessage('Назва контрагента обов\'язкова');
            setModalType('error');
            setShowModal(true);
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            if (editingCounterparty) {
                await axios.put(`${baseUrl}/counterparties/${editingCounterparty.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setModalMessage('Контрагент успішно оновлено');
            } else {
                await axios.post(`${baseUrl}/counterparties`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setModalMessage('Контрагент успішно створено');
            }

            setModalType('success');
            setShowModal(true);
            setShowCreateForm(false);
            resetForm();
            fetchCounterparties();
        } catch (err: any) {
            setModalMessage(err.response?.data?.error || 'Помилка збереження контрагента');
            setModalType('error');
            setShowModal(true);
        }
    };

    const handleEdit = (counterparty: Counterparty) => {
        setEditingCounterparty(counterparty);
        setFormData({
            name: counterparty.name,
            phone: counterparty.phone || '',
            email: counterparty.email || '',
            address: counterparty.address || '',
            taxId: counterparty.taxId || '',
            notes: counterparty.notes || '',
        });
        setShowCreateForm(true);
    };

    const handleDelete = async () => {
        if (!deletingCounterparty) return;

        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            await axios.delete(`${baseUrl}/counterparties/${deletingCounterparty.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setModalMessage('Контрагент успішно видалено');
            setModalType('success');
            setShowModal(true);
            setDeletingCounterparty(null);
            fetchCounterparties();
        } catch (err: any) {
            setModalMessage(err.response?.data?.error || 'Помилка видалення контрагента');
            setModalType('error');
            setShowModal(true);
        }
    };

    return (
        <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '700' }}>
                        🤝 Контрагенти
                    </h1>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                        Управління контрагентами (клієнти, партнери, постачальники)
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowCreateForm(true);
                    }}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                    }}
                >
                    ➕ Додати контрагента
                </button>
            </div>

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

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <p style={{ fontSize: '18px', color: '#6b7280' }}>⏳ Завантаження...</p>
                </div>
            ) : counterparties.length === 0 ? (
                <div style={{
                    padding: '60px',
                    textAlign: 'center',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    color: '#6b7280',
                }}>
                    <p style={{ margin: 0, fontSize: '16px' }}>Контрагенти не знайдено</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Додайте першого контрагента, натиснувши кнопку вище</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {counterparties.map((counterparty) => (
                        <div
                            key={counterparty.id}
                            style={{
                                padding: '24px',
                                backgroundColor: '#ffffff',
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
                            }}
                        >
                            <h3 style={{
                                margin: '0 0 16px 0',
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#111827',
                            }}>
                                {counterparty.name}
                            </h3>

                            <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                                {counterparty.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>📞</span>
                                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{counterparty.phone}</span>
                                    </div>
                                )}
                                {counterparty.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>✉️</span>
                                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{counterparty.email}</span>
                                    </div>
                                )}
                                {counterparty.address && (
                                    <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                                        <span>📍</span>
                                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{counterparty.address}</span>
                                    </div>
                                )}
                                {counterparty.taxId && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>🆔</span>
                                        <span style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace' }}>{counterparty.taxId}</span>
                                    </div>
                                )}
                                {counterparty.notes && (
                                    <div style={{
                                        marginTop: '8px',
                                        padding: '8px',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        color: '#6b7280',
                                    }}>
                                        {counterparty.notes}
                                    </div>
                                )}
                                {counterparty.type && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            backgroundColor: counterparty.type === 'SUPPLIER' ? '#dbeafe' : 
                                                           counterparty.type === 'CLIENT' ? '#dcfce7' : 
                                                           counterparty.type === 'PARTNER' ? '#fef3c7' : '#f3f4f6',
                                            color: counterparty.type === 'SUPPLIER' ? '#1e40af' : 
                                                   counterparty.type === 'CLIENT' ? '#166534' : 
                                                   counterparty.type === 'PARTNER' ? '#92400e' : '#6b7280',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                        }}>
                                            {counterparty.type === 'SUPPLIER' ? '🚚 Постачальник' : 
                                             counterparty.type === 'CLIENT' ? '👤 Клієнт' : 
                                             counterparty.type === 'PARTNER' ? '🤝 Партнер' : '📋 Інше'}
                                        </span>
                                    </div>
                                )}
                                {counterparty.suppliers && counterparty.suppliers.length > 0 && (
                                    <div style={{
                                        marginTop: '12px',
                                        padding: '12px',
                                        backgroundColor: '#eff6ff',
                                        borderRadius: '6px',
                                        border: '1px solid #bfdbfe',
                                    }}>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#1e40af' }}>
                                            🚚 Постачальники ({counterparty.suppliers.length}):
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {counterparty.suppliers.map((supplier) => (
                                                <span key={supplier.id} style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#dbeafe',
                                                    color: '#1e40af',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                }}>
                                                    {supplier.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                                <button
                                    onClick={() => handleEdit(counterparty)}
                                    style={{
                                        flex: 1,
                                        padding: '8px 16px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                    }}
                                >
                                    ✏️ Редагувати
                                </button>
                                <button
                                    onClick={() => setDeletingCounterparty(counterparty)}
                                    style={{
                                        flex: 1,
                                        padding: '8px 16px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                    }}
                                >
                                    🗑️ Видалити
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Форма створення/редагування */}
            {showCreateForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px',
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '30px',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                    }}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700' }}>
                            {editingCounterparty ? 'Редагувати контрагента' : 'Додати контрагента'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        Назва контрагента *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Назва компанії або ПІБ"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: '1px solid #d1d5db',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        Телефон
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+380 XX XXX XX XX"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: '1px solid #d1d5db',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@example.com"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: '1px solid #d1d5db',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        Адреса
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Повна адреса"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: '1px solid #d1d5db',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        ІПН/ЄДРПОУ
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.taxId}
                                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                        placeholder="Ідентифікаційний номер"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: '1px solid #d1d5db',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        Примітки
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        placeholder="Додаткові примітки про контрагента"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: '1px solid #d1d5db',
                                            resize: 'vertical',
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        resetForm();
                                    }}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#6b7280',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                    }}
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                    }}
                                >
                                    {editingCounterparty ? 'Зберегти зміни' : 'Створити контрагента'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Модальне вікно підтвердження видалення */}
            {deletingCounterparty && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px',
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '30px',
                        maxWidth: '400px',
                        width: '100%',
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>
                            Підтвердження видалення
                        </h3>
                        <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>
                            Ви впевнені, що хочете видалити контрагента <strong>{deletingCounterparty.name}</strong>?
                            Цю дію неможливо скасувати.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setDeletingCounterparty(null)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                }}
                            >
                                Скасувати
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                }}
                            >
                                Видалити
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <Modal
                    message={modalMessage}
                    type={modalType}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}

