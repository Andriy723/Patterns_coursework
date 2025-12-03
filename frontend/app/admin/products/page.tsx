'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { Product, Supplier } from '@/types';
import { Modal } from '@/components/Modal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import Link from 'next/link';
import { AdminNav } from '@/components/AdminNav';
import axios from 'axios';

interface ProductWithSupplier extends Product {
    supplierName?: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<ProductWithSupplier[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        const role = localStorage.getItem('adminRole');
        setIsSuperAdmin(role === 'SUPER_ADMIN');
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            
            const [productsRes, suppliersRes] = await Promise.all([
                axios.get(`${baseUrl}/products`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${baseUrl}/suppliers`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            const productsData = productsRes.data || [];
            const suppliersData = suppliersRes.data || [];
            
            const productsWithSuppliers = productsData.map((product: Product) => {
                const supplier = suppliersData.find((s: Supplier) => s.id === product.supplierId);
                return {
                    ...product,
                    supplierName: supplier?.name || 'N/A'
                };
            });
            
            setProducts(productsWithSuppliers);
            setSuppliers(suppliersData);
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error('Error:', error);
            setModalMessage('Помилка при завантаженні товарів');
            setModalType('error');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string, name: string) => {
        setProductToDelete({ id, name });
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        
        setShowConfirmModal(false);
        setDeleting(productToDelete.id);
        
        try {
            await apiClient.deleteProduct(productToDelete.id);
            await fetchData();
            setModalMessage(`Товар "${productToDelete.name}" успішно видалено`);
            setModalType('success');
            setShowModal(true);
            setProductToDelete(null);
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Помилка при видаленні';
            setModalMessage(errorMessage);
            setModalType('error');
            setShowModal(true);
            setProductToDelete(null);
        } finally {
            setDeleting(null);
        }
    };

    return (
        <>
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
                        📋 Управління товарами
                    </h1>
                    {isSuperAdmin && (
                        <Link
                            href="/admin/products/create"
                            style={{
                                padding: '12px 20px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                display: 'inline-block',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#3b82f6';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            ➕ Додати новий товар
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div
                        style={{
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
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</p>
                            <p style={{ fontSize: '18px', color: '#6b7280' }}>Завантаження...</p>
                        </div>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <thead
                                style={{
                                    backgroundColor: '#f9fafb',
                                    borderBottom: '2px solid #e5e7eb',
                                }}
                            >
                            <tr>
                                <th
                                    style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        fontWeight: '700',
                                        color: '#111827',
                                        fontSize: '14px',
                                    }}
                                >
                                    Назва
                                </th>
                                <th
                                    style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        fontWeight: '700',
                                        color: '#111827',
                                        fontSize: '14px',
                                    }}
                                >
                                    Артикул
                                </th>
                                <th
                                    style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        fontWeight: '700',
                                        color: '#111827',
                                        fontSize: '14px',
                                    }}
                                >
                                    Кількість
                                </th>
                                <th
                                    style={{
                                        padding: '16px',
                                        textAlign: 'right',
                                        fontWeight: '700',
                                        color: '#111827',
                                        fontSize: '14px',
                                    }}
                                >
                                    Ціна
                                </th>
                                <th
                                    style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        fontWeight: '700',
                                        color: '#111827',
                                        fontSize: '14px',
                                    }}
                                >
                                    Постачальник
                                </th>
                                <th
                                    style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        fontWeight: '700',
                                        color: '#111827',
                                        fontSize: '14px',
                                    }}
                                >
                                    Дії
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {products.map((product, index) => (
                                <tr
                                    key={product.id}
                                    style={{
                                        borderBottom: '1px solid #e5e7eb',
                                        backgroundColor:
                                            index % 2 === 0 ? '#ffffff' : '#f9fafb',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            index % 2 === 0 ? '#ffffff' : '#f9fafb';
                                    }}
                                >
                                    <td
                                        style={{
                                            padding: '16px',
                                            fontSize: '14px',
                                            color: '#111827',
                                            fontWeight: '500',
                                        }}
                                    >
                                        {product.name}
                                    </td>
                                    <td
                                        style={{
                                            padding: '16px',
                                            fontSize: '13px',
                                            color: '#6b7280',
                                            fontFamily: 'monospace',
                                        }}
                                    >
                                        {product.article}
                                    </td>
                                    <td
                                        style={{
                                            padding: '16px',
                                            textAlign: 'center',
                                            fontSize: '14px',
                                            color:
                                                product.quantity <= product.minStock
                                                    ? '#dc2626'
                                                    : '#111827',
                                            fontWeight:
                                                product.quantity <= product.minStock
                                                    ? '700'
                                                    : 'normal',
                                        }}
                                    >
                                        {product.quantity} од.
                                    </td>
                                    <td
                                        style={{
                                            padding: '16px',
                                            textAlign: 'right',
                                            fontSize: '14px',
                                            color: '#111827',
                                        }}
                                    >
                                        ${Number(product.price || 0).toFixed(2)}
                                    </td>
                                    <td
                                        style={{
                                            padding: '16px',
                                            fontSize: '14px',
                                            color: '#111827',
                                        }}
                                    >
                                        {product.supplierName || 'N/A'}
                                    </td>
                                    <td
                                        style={{
                                            padding: '16px',
                                            textAlign: 'center',
                                            display: 'flex',
                                            gap: '8px',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Link
                                            href={`/admin/products/${product.id}`}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#e0e7ff',
                                                color: '#3b82f6',
                                                textDecoration: 'none',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                transition: 'all 0.2s',
                                                display: 'inline-block',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    '#c7d2fe';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    '#e0e7ff';
                                            }}
                                        >
                                            ✏️ Редагувати
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(product.id, product.name)
                                            }
                                            disabled={deleting === product.id}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor:
                                                    deleting === product.id
                                                        ? '#e5e7eb'
                                                        : '#fee2e2',
                                                color:
                                                    deleting === product.id
                                                        ? '#9ca3af'
                                                        : '#dc2626',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor:
                                                    deleting === product.id
                                                        ? 'not-allowed'
                                                        : 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (deleting !== product.id) {
                                                    e.currentTarget.style.backgroundColor =
                                                        '#fecaca';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (deleting !== product.id) {
                                                    e.currentTarget.style.backgroundColor =
                                                        '#fee2e2';
                                                }
                                            }}
                                        >
                                            {deleting === product.id ? '⏳' : '🗑️'} Видалити
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {products.length === 0 && (
                            <div
                                style={{
                                    padding: '60px 40px',
                                    textAlign: 'center',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '12px',
                                    color: '#6b7280',
                                }}
                            >
                                <p style={{ fontSize: '18px' }}>📭 Товари не знайдено</p>
                            </div>
                        )}
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

            {showConfirmModal && productToDelete && (
                <ConfirmationModal
                    message={`Ви впевнені, що хочете видалити "${productToDelete.name}"?`}
                    onConfirm={confirmDelete}
                    onCancel={() => {
                        setShowConfirmModal(false);
                        setProductToDelete(null);
                    }}
                    confirmText="Видалити"
                    cancelText="Скасувати"
                />
            )}
        </>
    );
}