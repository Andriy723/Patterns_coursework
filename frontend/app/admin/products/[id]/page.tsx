'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import type { Product, Supplier } from '@/types';
import { Modal } from '@/components/Modal';
import Link from 'next/link';

export default function AdminProductEditPage({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
    const [formData, setFormData] = useState<Partial<Product>>({});
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.replace('/admin/login');
            return;
        }
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const [productRes, suppliersRes] = await Promise.all([
                axios.get(`${baseUrl}/products/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${baseUrl}/suppliers`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setProduct(productRes.data);
            setFormData(productRes.data);
            setSuppliers(suppliersRes.data);
        } catch (error: any) {
            console.error('Error:', error);
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
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            await axios.put(
                `${baseUrl}/products/${params.id}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setModalMessage('Товар успішно оновлено');
            setModalType('success');
            setShowModal(true);
            setTimeout(() => {
                router.push('/admin/products');
            }, 1500);
        } catch (error: any) {
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
            <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
                <div style={{ padding: '60px 40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '12px', color: '#6b7280' }}>
                    <p style={{ fontSize: '18px' }}>⏳ Завантаження...</p>
                </div>
            </main>
        );
    }

    if (!product) {
        return (
            <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fee2e2', borderRadius: '12px', color: '#991b1b' }}>
                    <p>Товар не знайдено</p>
                    <Link href="/admin/products" style={{ color: '#dc2626', textDecoration: 'underline', marginTop: '12px', display: 'inline-block' }}>
                        Повернутися до списку
                    </Link>
                </div>
            </main>
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
                    ✏️ Редагувати товар
                </h1>

                <form onSubmit={handleUpdate} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                                Назва товару
                            </label>
                            <input
                                type="text"
                                value={formData.name || ''}
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
                                value={formData.article || ''}
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
                                value={formData.supplierId || ''}
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

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button
                                type="submit"
                                disabled={updating}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: updating ? '#9ca3af' : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: updating ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                }}
                            >
                                {updating ? '⏳ Оновлення...' : '💾 Зберегти зміни'}
                            </button>
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

