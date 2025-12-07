'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import type { Supplier } from '@/types';
import { Modal } from '@/components/Modal';
import Link from 'next/link';

export default function AdminProductCreatePage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
    const [formData, setFormData] = useState({
        name: '',
        article: '',
        quantity: 0,
        price: 0,
        supplierId: '',
        minStock: 10,
    });
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const role = localStorage.getItem('adminRole');
        if (!token || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
            router.replace('/admin');
            return;
        }
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const suppliersRes = await axios.get(`${baseUrl}/suppliers`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuppliers(suppliersRes.data);
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error: any) {
            console.error('Error:', error);
            setModalMessage('Помилка при завантаженні постачальників');
            setModalType('error');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            await axios.post(
                `${baseUrl}/products`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setModalMessage('Товар успішно створено');
            setModalType('success');
            setShowModal(true);
            setTimeout(() => {
                router.push('/admin/products');
            }, 1500);
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Помилка при створенні';
            setModalMessage(errorMessage);
            setModalType('error');
            setShowModal(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
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
        );
    }

    return (
        <>
            <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%', padding: '20px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <Link href="/admin/products" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}>
                        ← Назад до товарів
                    </Link>
                </div>
                <h1 style={{ margin: '0 0 30px 0', fontSize: '28px', fontWeight: '700' }}>
                    ➕ Створити новий товар
                </h1>

                <form onSubmit={handleCreate} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', height: 'auto', minHeight: 'auto' }}>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                                Назва товару
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                                Артикул
                            </label>
                            <input
                                type="text"
                                value={formData.article}
                                onChange={(e) => setFormData({ ...formData, article: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                                    Кількість
                                </label>
                                <input
                                    type="number"
                                    value={formData.quantity || 0}
                                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                    required
                                    min="0"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                                    Ціна
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price || 0}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                                Постачальник
                            </label>
                            <select
                                value={formData.supplierId}
                                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                required
                            >
                                <option value="">-- Виберіть постачальника --</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                                Мінімальний запас
                            </label>
                            <input
                                type="number"
                                value={formData.minStock || 10}
                                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                                required
                                min="0"
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                            <Link
                                href="/admin/products"
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#e5e7eb',
                                    color: '#374151',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    display: 'inline-block',
                                }}
                            >
                                Скасувати
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: submitting ? '#9ca3af' : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                }}
                            >
                                {submitting ? '⏳ Створення...' : '💾 Створити товар'}
                            </button>
                        </div>
                    </div>
                </form>
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

