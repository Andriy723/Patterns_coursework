'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { Movement, Product } from '@/types';
import { Navigation } from '@/components/Navigation';
import { Modal } from '@/components/Modal';

export default function WarehousePage() {
    const [movements, setMovements] = useState<Movement[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAllMovements, setShowAllMovements] = useState(false);
    const [formData, setFormData] = useState({
        productId: '',
        type: 'INCOME' as 'INCOME' | 'OUTCOME' | 'WRITE_OFF',
        quantity: 0,
        documentNumber: '',
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

    const itemsPerPage = showAllMovements ? 5 : 5;
    const totalPages = showAllMovements ? Math.ceil(movements.length / itemsPerPage) : 0;
    const startIdx = showAllMovements ? (currentPage - 1) * itemsPerPage : 0;
    const endIdx = showAllMovements ? startIdx + itemsPerPage : 5;
    const displayedMovements = movements.slice(startIdx, endIdx);
    const showPagination = showAllMovements && movements.length > 5;

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [showAllMovements]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [movementsData, productsData] = await Promise.all([
                apiClient.getMovements(),
                apiClient.getProducts(),
            ]);
            setMovements(movementsData);
            setProducts(productsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setModalMessage('Помилка при завантаженні даних');
            setModalType('error');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.productId.trim()) {
            setModalMessage('Будь ласка, виберіть товар');
            setModalType('warning');
            setShowModal(true);
            return;
        }

        if (formData.quantity <= 0) {
            setModalMessage('Кількість повинна бути більшою за 0');
            setModalType('warning');
            setShowModal(true);
            return;
        }

        if (!formData.documentNumber.trim()) {
            setModalMessage('Будь ласка, введіть номер документа');
            setModalType('warning');
            setShowModal(true);
            return;
        }

        setSubmitting(true);
        try {
            await apiClient.recordMovement(
                formData.productId,
                formData.type,
                formData.quantity,
                formData.documentNumber
            );
            setFormData({ productId: '', type: 'INCOME', quantity: 0, documentNumber: '' });
            await fetchData();
            setModalMessage('Рух успішно записаний');
            setModalType('success');
            setShowModal(true);
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Помилка при записуванні руху';
            setModalMessage(errorMessage);
            setModalType('error');
            setShowModal(true);
        } finally {
            setSubmitting(false);
        }
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            INCOME: '📥 Поповнення',
            OUTCOME: '📤 Відвантаження',
            WRITE_OFF: '🗑️ Списання',
        };
        return labels[type] || type;
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            INCOME: '#10b981',
            OUTCOME: '#f59e0b',
            WRITE_OFF: '#ef4444',
        };
        return colors[type] || '#6b7280';
    };

    const getProductName = (productId: string): string => {
        const product = products.find((p) => p.id === productId);
        return product ? product.name : productId;
    };

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
                <h1 style={{ margin: '0 0 30px 0', fontSize: '28px', fontWeight: '700' }}>
                    🏭 Управління рухом товарів
                </h1>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '24px',
                        marginTop: '20px',
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#ffffff',
                            padding: '24px',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <h2
                            style={{
                                margin: '0 0 20px 0',
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#111827',
                            }}
                        >
                            📝 Нова операція
                        </h2>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
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
                                    Товар
                                </label>
                                <select
                                    value={formData.productId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, productId: e.target.value })
                                    }
                                    disabled={submitting}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        opacity: submitting ? 0.6 : 1,
                                    }}
                                >
                                    <option value="">-- Виберіть товар --</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} ({product.article})
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
                                    Тип операції
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            type: e.target.value as any,
                                        })
                                    }
                                    disabled={submitting}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        opacity: submitting ? 0.6 : 1,
                                    }}
                                >
                                    <option value="INCOME">📥 Поповнення</option>
                                    <option value="OUTCOME">📤 Відвантаження</option>
                                    <option value="WRITE_OFF">🗑️ Списання</option>
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
                                    disabled={submitting}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        opacity: submitting ? 0.6 : 1,
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
                                    Номер документа
                                </label>
                                <input
                                    type="text"
                                    placeholder="Наприклад: ПН-2024-001"
                                    value={formData.documentNumber}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            documentNumber: e.target.value,
                                        })
                                    }
                                    disabled={submitting}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        opacity: submitting ? 0.6 : 1,
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    padding: '12px 16px',
                                    backgroundColor: submitting ? '#9ca3af' : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    marginTop: '8px',
                                }}
                                onMouseEnter={(e) => {
                                    if (!submitting) {
                                        e.currentTarget.style.backgroundColor = '#2563eb';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!submitting) {
                                        e.currentTarget.style.backgroundColor = '#3b82f6';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                {submitting ? 'Записування...' : 'Записати'}
                            </button>
                        </form>
                    </div>

                    <div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px',
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#111827',
                                }}
                            >
                                📊 Операції
                            </h2>
                            {movements.length > 5 && (
                                <button
                                    onClick={() => setShowAllMovements(!showAllMovements)}
                                    style={{
                                        padding: '10px 16px',
                                        backgroundColor: showAllMovements ? '#ef4444' : '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {showAllMovements ? '✕ Згорнути' : '⊕ Показати всі'}
                                </button>
                            )}
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
                                <p>⏳ Завантаження...</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '16px' }}>
                                    {displayedMovements && displayedMovements.length > 0 ? (
                                        displayedMovements.map((movement) => (
                                            <div
                                                key={movement.id}
                                                style={{
                                                    backgroundColor: '#ffffff',
                                                    padding: '16px',
                                                    marginBottom: '12px',
                                                    borderRadius: '8px',
                                                    border: `2px solid ${getTypeColor(movement.type)}`,
                                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        margin: '0 0 8px 0',
                                                        fontWeight: '600',
                                                        color: getTypeColor(movement.type),
                                                    }}
                                                >
                                                    {getTypeLabel(movement.type)} — {movement.quantity} од.
                                                </p>
                                                <p
                                                    style={{
                                                        margin: '0 0 4px 0',
                                                        fontSize: '13px',
                                                        color: '#111827',
                                                        fontWeight: '500',
                                                    }}
                                                >
                                                    {getProductName(movement.productId)}
                                                </p>
                                                <p
                                                    style={{
                                                        margin: '0 0 4px 0',
                                                        fontSize: '12px',
                                                        color: '#6b7280',
                                                    }}
                                                >
                                                    Документ: {movement.documentNumber}
                                                </p>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontSize: '12px',
                                                        color: '#9ca3af',
                                                    }}
                                                >
                                                    {new Date(movement.date).toLocaleString('uk-UA')}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div
                                            style={{
                                                padding: '40px',
                                                textAlign: 'center',
                                                backgroundColor: '#f9fafb',
                                                borderRadius: '12px',
                                                color: '#6b7280',
                                            }}
                                        >
                                            <p>Нема операцій</p>
                                        </div>
                                    )}
                                </div>

                                {showPagination && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            marginTop: '16px',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: currentPage === 1 ? '#e5e7eb' : '#3b82f6',
                                                color: currentPage === 1 ? '#9ca3af' : 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (currentPage !== 1) {
                                                    e.currentTarget.style.backgroundColor = '#2563eb';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (currentPage !== 1) {
                                                    e.currentTarget.style.backgroundColor = '#3b82f6';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }
                                            }}
                                        >
                                            ← Назад
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: currentPage === page ? '#3b82f6' : '#e5e7eb',
                                                    color: currentPage === page ? 'white' : '#374151',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    transition: 'all 0.2s',
                                                    minWidth: '36px',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (currentPage !== page) {
                                                        e.currentTarget.style.backgroundColor = '#d1d5db';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (currentPage !== page) {
                                                        e.currentTarget.style.backgroundColor = '#e5e7eb';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }
                                                }}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#3b82f6',
                                                color: currentPage === totalPages ? '#9ca3af' : 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (currentPage !== totalPages) {
                                                    e.currentTarget.style.backgroundColor = '#2563eb';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (currentPage !== totalPages) {
                                                    e.currentTarget.style.backgroundColor = '#3b82f6';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }
                                            }}
                                        >
                                            Вперед →
                                        </button>
                                    </div>
                                )}

                                {showPagination && (
                                    <div
                                        style={{
                                            marginTop: '12px',
                                            textAlign: 'center',
                                            fontSize: '12px',
                                            color: '#6b7280',
                                        }}
                                    >
                                        Сторінка {currentPage} з {totalPages}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
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