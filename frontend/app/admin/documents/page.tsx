'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal } from '@/components/Modal';
import { ConfirmationModal } from '@/components/ConfirmationModal';

interface DocumentItem {
    id?: string;
    productId: string;
    quantity: number;
    price: number;
    total?: number;
    notes?: string;
    product?: {
        id: string;
        name: string;
        article: string;
    };
}

interface Document {
    id: string;
    documentNumber: string;
    type: 'INVOICE' | 'ACT';
    documentDate: string;
    supplierId?: string;
    counterpartyId?: string;
    counterpartyName?: string;
    counterpartyPhone?: string;
    counterpartyEmail?: string;
    counterpartyAddress?: string;
    totalAmount: number;
    notes?: string;
    status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
    items?: DocumentItem[];
    supplier?: {
        id: string;
        name: string;
    };
    counterparty?: {
        id: string;
        name: string;
    };
}

interface Product {
    id: string;
    name: string;
    article: string;
    price: number;
}

interface Supplier {
    id: string;
    counterpartyId?: string;
    name: string;
    counterparty?: {
        id: string;
        name: string;
    };
}

interface Counterparty {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    
    const [filterType, setFilterType] = useState<'INVOICE' | 'ACT' | ''>('');
    const [filterStatus, setFilterStatus] = useState<'DRAFT' | 'CONFIRMED' | 'CANCELLED' | ''>('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const [formData, setFormData] = useState({
        documentNumber: '',
        type: 'INVOICE' as 'INVOICE' | 'ACT',
        documentDate: new Date().toISOString().split('T')[0],
        supplierId: '',
        counterpartyId: '',
        notes: '',
        items: [] as DocumentItem[],
    });

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                fetchDocuments(),
                fetchProducts(),
                fetchSuppliers(),
                fetchCounterparties(),
            ]);
        };
        loadData();
    }, [filterType, filterStatus, filterStartDate, filterEndDate]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const params: any = {};
            if (filterType) params.type = filterType;
            if (filterStatus) params.status = filterStatus;
            if (filterStartDate) params.startDate = filterStartDate;
            if (filterEndDate) params.endDate = filterEndDate;

            const response = await axios.get(`${baseUrl}/documents`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });

            setDocuments(response.data);
        } catch (err: any) {
            console.error('Error fetching documents:', err);
            let errorMessage = 'Помилка завантаження документів';
            
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                errorMessage = 'Не вдалося підключитися до сервера. Перевірте, чи запущений backend сервер на порту 3001.';
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
            } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                setModalMessage(errorMessage);
                setModalType('error');
                setShowModal(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                console.error('No admin token found');
                return;
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const response = await axios.get(`${baseUrl}/products`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 15000,
            });

            setProducts(response.data || []);
        } catch (err: any) {
            console.error('Error fetching products:', err);
            
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                console.warn('Network error when fetching products - server may be down');
            } else {
                const errorMessage = err.response?.data?.error || err.message || 'Помилка завантаження товарів';
                
                if (err.response?.status === 401 || err.response?.status === 403) {
                    setModalMessage('Помилка авторизації при завантаженні товарів. Перевірте права доступу.');
                    setModalType('error');
                    setShowModal(true);
                } else {
                    setModalMessage(`Помилка завантаження товарів: ${errorMessage}`);
                    setModalType('error');
                    setShowModal(true);
                }
            }
        }
    };

    const fetchSuppliers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const response = await axios.get(`${baseUrl}/suppliers`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 15000,
            });

            setSuppliers(response.data || []);
        } catch (err: any) {
            console.error('Error fetching suppliers:', err);
            
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                console.warn('Network error when fetching suppliers - server may be down');
            } else {
                const errorMessage = err.response?.data?.error || err.message || 'Помилка завантаження постачальників';
                setModalMessage(errorMessage);
                setModalType('error');
                setShowModal(true);
            }
        }
    };

    const fetchCounterparties = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const response = await axios.get(`${baseUrl}/counterparties`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 15000,
            });

            setCounterparties(response.data || []);
        } catch (err: any) {
            console.error('Error fetching counterparties:', err);
        }
    };

    const generateDocumentNumber = async (type: 'INVOICE' | 'ACT') => {
        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const response = await axios.get(`${baseUrl}/documents/generate-number`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { type },
            });

            setFormData(prev => ({
                ...prev,
                documentNumber: response.data.documentNumber,
            }));
        } catch (err) {
            console.error('Error generating number:', err);
        }
    };

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { productId: '', quantity: 1, price: 0 }],
        }));
    };

    const handleRemoveItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };

            if (field === 'productId' && value) {
                const product = products.find(p => p.id === value);
                if (product) {
                    newItems[index].price = product.price;
                }
            }

            if (field === 'quantity' || field === 'price') {
                newItems[index].total = newItems[index].quantity * newItems[index].price;
            }

            return { ...prev, items: newItems };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.documentNumber || formData.items.length === 0) {
            setModalMessage('Заповніть всі обов\'язкові поля');
            setModalType('error');
            setShowModal(true);
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            await axios.post(`${baseUrl}/documents`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setModalMessage('Документ успішно створено');
            setModalType('success');
            setShowModal(true);
            setShowCreateForm(false);
            resetForm();
            fetchDocuments();
        } catch (err: any) {
            setModalMessage(err.response?.data?.error || 'Помилка створення документа');
            setModalType('error');
            setShowModal(true);
        }
    };

    const resetForm = () => {
        setFormData({
            documentNumber: '',
            type: 'INVOICE',
            documentDate: new Date().toISOString().split('T')[0],
            supplierId: '',
            counterpartyId: '',
            notes: '',
            items: [],
        });
    };

    const handleCounterpartyChange = (counterpartyId: string) => {
        if (counterpartyId) {
            const supplierForCounterparty = suppliers.find(s => s.counterpartyId === counterpartyId);
            const newSupplierId = supplierForCounterparty ? supplierForCounterparty.id : '';
            
            setFormData(prev => ({
                ...prev,
                counterpartyId: counterpartyId,
                supplierId: newSupplierId,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                counterpartyId: '',
                supplierId: '',
            }));
        }
    };

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    const handleConfirm = async (documentId: string) => {
        setConfirmMessage('Підтвердити документ? Це створить рухи товарів на складі.');
        setConfirmAction(() => async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

                await axios.post(`${baseUrl}/documents/${documentId}/confirm`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setModalMessage('Документ підтверджено');
                setModalType('success');
                setShowModal(true);
                fetchDocuments();
            } catch (err: any) {
                setModalMessage(err.response?.data?.error || 'Помилка підтвердження документа');
                setModalType('error');
                setShowModal(true);
            }
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
    };

    const handleCancel = async (documentId: string) => {
        setConfirmMessage('Скасувати документ?');
        setConfirmAction(() => async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

                await axios.post(`${baseUrl}/documents/${documentId}/cancel`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setModalMessage('Документ скасовано');
                setModalType('success');
                setShowModal(true);
                fetchDocuments();
            } catch (err: any) {
                setModalMessage(err.response?.data?.error || 'Помилка скасування документа');
                setModalType('error');
                setShowModal(true);
            }
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
    };

    const handleViewDocument = async (documentId: string) => {
        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const response = await axios.get(`${baseUrl}/documents/${documentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSelectedDocument(response.data);
        } catch (err: any) {
            setModalMessage(err.response?.data?.error || 'Помилка завантаження документа');
            setModalType('error');
            setShowModal(true);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return '#6b7280';
            case 'CONFIRMED': return '#10b981';
            case 'CANCELLED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'Чернетка';
            case 'CONFIRMED': return 'Підтверджено';
            case 'CANCELLED': return 'Скасовано';
            default: return status;
        }
    };

    const getTypeLabel = (type: string) => {
        return type === 'INVOICE' ? 'Накладна' : 'Акт';
    };

    return (
        <div style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '20px' }}>
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
                    📄 Накладні та акти
                </h1>
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
                    ➕ Створити документ
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                            <strong>⚠️ {error}</strong>
                            {error.includes('підключитися до сервера') && (
                                <div style={{ marginTop: '12px', fontSize: '14px', lineHeight: '1.6' }}>
                                    <p style={{ margin: '8px 0 4px 0', fontWeight: '600' }}>Можливі причини:</p>
                                    <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                        <li>Backend сервер не запущений</li>
                                        <li>Сервер працює на іншому порту або адресі</li>
                                        <li>Проблеми з мережею або файрволом</li>
                                    </ul>
                                    <p style={{ margin: '12px 0 4px 0', fontWeight: '600' }}>Як виправити:</p>
                                    <ol style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                        <li>Перейдіть в папку <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>backend</code></li>
                                        <li>Запустіть сервер: <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>npm run dev</code> або <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>npm start</code></li>
                                        <li>Перевірте, чи сервер працює на <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>http://localhost:3001</code></li>
                                    </ol>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                setError('');
                                setLoading(true);
                                const loadData = async () => {
                                    await Promise.all([
                                        fetchDocuments(),
                                        fetchProducts(),
                                        fetchSuppliers(),
                                        fetchCounterparties(),
                                    ]);
                                };
                                loadData();
                            }}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                marginLeft: '16px',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            🔄 Спробувати знову
                        </button>
                    </div>
                </div>
            )}

            {/* Фільтри */}
            <div style={{
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        Тип документа
                    </label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                        }}
                    >
                        <option value="">Всі типи</option>
                        <option value="INVOICE">Накладна</option>
                        <option value="ACT">Акт</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        Статус
                    </label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                        }}
                    >
                        <option value="">Всі статуси</option>
                        <option value="DRAFT">Чернетка</option>
                        <option value="CONFIRMED">Підтверджено</option>
                        <option value="CANCELLED">Скасовано</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        Дата від
                    </label>
                    <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        Дата до
                    </label>
                    <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                        }}
                    />
                </div>
            </div>

            {/* Список документів */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <p style={{ fontSize: '18px', color: '#6b7280' }}>⏳ Завантаження...</p>
                </div>
            ) : documents.length === 0 ? (
                <div style={{
                    padding: '60px',
                    textAlign: 'center',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    color: '#6b7280',
                }}>
                    <p style={{ margin: 0, fontSize: '16px' }}>Документи не знайдено</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            style={{
                                padding: '20px',
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>
                                        {getTypeLabel(doc.type)} № {doc.documentNumber}
                                    </h3>
                                    <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
                                        Дата: {new Date(doc.documentDate).toLocaleDateString('uk-UA')}
                                    </p>
                                    {doc.supplier && (
                                        <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
                                            Постачальник: {doc.supplier.name}
                                        </p>
                                    )}
                                    {doc.counterparty && (
                                        <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
                                            Контрагент: {doc.counterparty.name}
                                        </p>
                                    )}
                                    {!doc.counterparty && doc.counterpartyName && (
                                        <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
                                            Контрагент: {doc.counterpartyName}
                                        </p>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        padding: '6px 12px',
                                        backgroundColor: getStatusColor(doc.status),
                                        color: 'white',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                    }}>
                                        {getStatusLabel(doc.status)}
                                    </span>
                                    <p style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                                        {doc.totalAmount.toFixed(2)} ₴
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => handleViewDocument(doc.id)}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                    }}
                                >
                                    👁️ Переглянути
                                </button>
                                {doc.status === 'DRAFT' && (
                                    <>
                                        <button
                                            onClick={() => handleConfirm(doc.id)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                            }}
                                        >
                                            ✅ Підтвердити
                                        </button>
                                        <button
                                            onClick={() => handleCancel(doc.id)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                            }}
                                        >
                                            ❌ Скасувати
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Модальне вікно створення документа */}
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
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                    }}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700' }}>
                            Створити документ
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                            Тип документа *
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => {
                                                const newType = e.target.value as 'INVOICE' | 'ACT';
                                                setFormData(prev => ({
                                                    ...prev,
                                                    type: newType,
                                                }));
                                                generateDocumentNumber(newType);
                                            }}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '6px',
                                                border: '1px solid #d1d5db',
                                            }}
                                        >
                                            <option value="INVOICE">Накладна</option>
                                            <option value="ACT">Акт</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                            Номер документа *
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                value={formData.documentNumber}
                                                onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                                                required
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #d1d5db',
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => generateDocumentNumber(formData.type)}
                                                style={{
                                                    padding: '10px 16px',
                                                    backgroundColor: '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    fontSize: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    transition: 'background-color 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                                            >
                                                <span>🔄</span>
                                                <span>Оновити</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        Дата документа *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.documentDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, documentDate: e.target.value }))}
                                        required
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
                                        Контрагент *
                                    </label>
                                    <select
                                        value={formData.counterpartyId}
                                        onChange={(e) => handleCounterpartyChange(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: '1px solid #d1d5db',
                                        }}
                                    >
                                        <option value="">Виберіть контрагента</option>
                                        {counterparties.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    {counterparties.length === 0 && (
                                        <p style={{ marginTop: '4px', fontSize: '12px', color: '#ef4444' }}>
                                            Немає доступних контрагентів. Спочатку додайте контрагента.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        Постачальник
                                    </label>
                                    <select
                                        value={formData.supplierId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                                        disabled={!formData.counterpartyId || counterparties.length === 0}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: '1px solid #d1d5db',
                                            backgroundColor: (!formData.counterpartyId || counterparties.length === 0) ? '#f3f4f6' : 'white',
                                            cursor: (!formData.counterpartyId || counterparties.length === 0) ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        <option value="">
                                            {!formData.counterpartyId || counterparties.length === 0 
                                                ? 'Спочатку виберіть контрагента' 
                                                : 'Виберіть постачальника'}
                                        </option>
                                        {formData.counterpartyId && suppliers
                                            .filter(s => s.counterpartyId === formData.counterpartyId)
                                            .map(s => {
                                                const isSelected = formData.supplierId === s.id;
                                                return (
                                                    <option key={s.id} value={s.id}>
                                                        {s.name}
                                                    </option>
                                                );
                                            })}
                                    </select>
                                    {formData.counterpartyId && suppliers.filter(s => s.counterpartyId === formData.counterpartyId).length === 0 && (
                                        <p style={{ marginTop: '4px', fontSize: '12px', color: '#f59e0b' }}>
                                            Для цього контрагента немає пов'язаного постачальника.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        Примітки
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={3}
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

                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                                        Позиції документа
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                        }}
                                    >
                                        ➕ Додати позицію
                                    </button>
                                </div>
                                {formData.items.length === 0 ? (
                                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                                        Додайте хоча б одну позицію
                                    </p>
                                ) : (
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {formData.items.map((item, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: '16px',
                                                    backgroundColor: '#f9fafb',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e5e7eb',
                                                }}
                                            >
                                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600' }}>
                                                            Товар *
                                                        </label>
                                                        <select
                                                            value={item.productId}
                                                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                                            required
                                                            style={{
                                                                width: '100%',
                                                                padding: '8px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #d1d5db',
                                                            }}
                                                        >
                                                            <option value="">Виберіть товар</option>
                                                            {products.map(p => (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.name} ({p.article})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600' }}>
                                                            Кількість *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                            min="1"
                                                            required
                                                            style={{
                                                                width: '100%',
                                                                padding: '8px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #d1d5db',
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600' }}>
                                                            Ціна *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                            min="0"
                                                            step="0.01"
                                                            required
                                                            style={{
                                                                width: '100%',
                                                                padding: '8px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #d1d5db',
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600' }}>
                                                            Сума
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={(item.quantity * item.price).toFixed(2)}
                                                            disabled
                                                            style={{
                                                                width: '100%',
                                                                padding: '8px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #d1d5db',
                                                                backgroundColor: '#f3f4f6',
                                                            }}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(index)}
                                                        style={{
                                                            padding: '8px 12px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {formData.items.length > 0 && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '16px',
                                        backgroundColor: '#dbeafe',
                                        borderRadius: '8px',
                                        textAlign: 'right',
                                    }}>
                                        <strong style={{ fontSize: '18px' }}>
                                            Загальна сума: {formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(2)} ₴
                                        </strong>
                                    </div>
                                )}
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
                                    Створити документ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Модальне вікно перегляду документа */}
            {selectedDocument && (
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
                        maxWidth: '900px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                                {getTypeLabel(selectedDocument.type)} № {selectedDocument.documentNumber}
                            </h2>
                            <button
                                onClick={() => setSelectedDocument(null)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                }}
                            >
                                ✕ Закрити
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <strong>Дата документа:</strong>
                                    <p style={{ margin: '4px 0' }}>{new Date(selectedDocument.documentDate).toLocaleDateString('uk-UA')}</p>
                                </div>
                                <div>
                                    <strong>Статус:</strong>
                                    <p style={{ margin: '4px 0' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            backgroundColor: getStatusColor(selectedDocument.status),
                                            color: 'white',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                        }}>
                                            {getStatusLabel(selectedDocument.status)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            {selectedDocument.supplier && (
                                <div>
                                    <strong>Постачальник:</strong>
                                    <p style={{ margin: '4px 0' }}>{selectedDocument.supplier.name}</p>
                                </div>
                            )}
                            {selectedDocument.counterparty && (
                                <>
                                    <div>
                                        <strong>Контрагент:</strong>
                                        <p style={{ margin: '4px 0' }}>{selectedDocument.counterparty.name}</p>
                                    </div>
                                </>
                            )}
                            {!selectedDocument.counterparty && selectedDocument.counterpartyName && (
                                <>
                                    <div>
                                        <strong>Контрагент:</strong>
                                        <p style={{ margin: '4px 0' }}>{selectedDocument.counterpartyName}</p>
                                    </div>
                                    {selectedDocument.counterpartyPhone && (
                                        <div>
                                            <strong>Телефон:</strong>
                                            <p style={{ margin: '4px 0' }}>{selectedDocument.counterpartyPhone}</p>
                                        </div>
                                    )}
                                    {selectedDocument.counterpartyEmail && (
                                        <div>
                                            <strong>Email:</strong>
                                            <p style={{ margin: '4px 0' }}>{selectedDocument.counterpartyEmail}</p>
                                        </div>
                                    )}
                                    {selectedDocument.counterpartyAddress && (
                                        <div>
                                            <strong>Адреса:</strong>
                                            <p style={{ margin: '4px 0' }}>{selectedDocument.counterpartyAddress}</p>
                                        </div>
                                    )}
                                </>
                            )}
                            {selectedDocument.notes && (
                                <div>
                                    <strong>Примітки:</strong>
                                    <p style={{ margin: '4px 0' }}>{selectedDocument.notes}</p>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>
                                Позиції документа
                            </h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Товар</th>
                                        <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #e5e7eb' }}>Кількість</th>
                                        <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #e5e7eb' }}>Ціна</th>
                                        <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #e5e7eb' }}>Сума</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedDocument.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                                                {item.product?.name || 'Невідомо'} ({item.product?.article || 'N/A'})
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #e5e7eb' }}>
                                                {item.quantity}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #e5e7eb' }}>
                                                {item.price.toFixed(2)} ₴
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #e5e7eb', fontWeight: '600' }}>
                                                {(item.total || item.quantity * item.price).toFixed(2)} ₴
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ backgroundColor: '#dbeafe', fontWeight: '700' }}>
                                        <td colSpan={3} style={{ padding: '12px', textAlign: 'right', border: '1px solid #e5e7eb' }}>
                                            Загальна сума:
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #e5e7eb' }}>
                                            {selectedDocument.totalAmount.toFixed(2)} ₴
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
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
            {showConfirmModal && confirmAction && (
                <ConfirmationModal
                    message={confirmMessage}
                    onConfirm={() => {
                        if (confirmAction) {
                            confirmAction();
                        }
                    }}
                    onCancel={() => {
                        setShowConfirmModal(false);
                        setConfirmAction(null);
                    }}
                    confirmText="Так"
                    cancelText="Ні"
                />
            )}
        </div>
    );
}

