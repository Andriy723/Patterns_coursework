'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Modal } from '@/components/Modal';
import { ConfirmationModal } from '@/components/ConfirmationModal';

interface Admin {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminsPage() {
    const router = useRouter();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState<{ id: string; role: string } | null>(null);

    useEffect(() => {
        const role = localStorage.getItem('adminRole');
        setIsSuperAdmin(role === 'SUPER_ADMIN');
        fetchAdmins();
    }, [router]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const response = await axios.get(`${baseUrl}/auth/admins`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setAdmins(response.data);
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error('Error fetching admins:', error);
            setModalMessage('Помилка при завантаженні адміністраторів');
            setModalType('error');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            await axios.post(
                `${baseUrl}/auth/admins`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setFormData({ email: '', password: '' });
            setShowForm(false);
            await fetchAdmins();
            setModalMessage('Адміністратора успішно створено');
            setModalType('success');
            setShowModal(true);
        } catch (error: any) {
            setModalMessage(error.response?.data?.error || 'Помилка при створенні адміністратора');
            setModalType('error');
            setShowModal(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAdmin = (id: string, role: string) => {
        if (role === 'SUPER_ADMIN') {
            setModalMessage('Неможливо деактивувати Super Admin');
            setModalType('warning');
            setShowModal(true);
            return;
        }

        setAdminToDelete({ id, role });
        setShowConfirmModal(true);
    };

    const confirmDeleteAdmin = async () => {
        if (!adminToDelete) return;
        
        setShowConfirmModal(false);
        
        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            await axios.delete(
                `${baseUrl}/auth/admins/${adminToDelete.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await fetchAdmins();
            setModalMessage('Адміністратора успішно деактивовано');
            setModalType('success');
            setShowModal(true);
            setAdminToDelete(null);
        } catch (error) {
            setModalMessage('Помилка при деактивації адміністратора');
            setModalType('error');
            setShowModal(true);
            setAdminToDelete(null);
        }
    };

    const handleActivateAdmin = async (id: string) => {
        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            await axios.put(
                `${baseUrl}/auth/admins/${id}/activate`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await fetchAdmins();
            setModalMessage('Адміністратора успішно активовано');
            setModalType('success');
            setShowModal(true);
        } catch (error) {
            setModalMessage('Помилка при активації адміністратора');
            setModalType('error');
            setShowModal(true);
        }
    };

    if (!isSuperAdmin) {
        return null;
    }

    return (
        <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>👥 Управління адміністраторами</h1>
                {isSuperAdmin && (
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ padding: '12px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                    {showForm ? '✕ Скасувати' : '➕ Створити адміністратора'}
                </button>
                )}
            </div>
            {!isSuperAdmin && (<div style={{margin:'0 0 24px 0',background:'#e0f2fe',border:'1px solid #bae6fd',borderRadius:'8px',color:'#0369a1',fontSize:'13px',padding:12}}>Перегляд списку адміністраторів лише для читання. CRUD дозволено тільки Super Admin</div>)}
            {isSuperAdmin && showForm && (
                <form onSubmit={handleCreateAdmin} style={{ display: 'grid', gap: '16px', maxWidth: '400px', padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '30px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                            Електронна пошта
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                            Пароль
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: '12px',
                            backgroundColor: submitting ? '#9ca3af' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                        }}
                    >
                        {submitting ? 'Створення...' : 'Створити'}
                    </button>
                </form>
            )}

            {loading ? (
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
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Електронна пошта</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Роль</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Статус</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Створено</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Дії</th>
                        </tr>
                        </thead>
                        <tbody>
                        {admins.map((admin) => (
                            <tr key={admin.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                                    {admin.email}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            backgroundColor: admin.role === 'SUPER_ADMIN' ? '#dc2626' : '#3b82f6',
                                            color: 'white',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                        }}>
                                            {admin.role === 'SUPER_ADMIN' ? '👑 SUPER' : '👤 ADMIN'}
                                        </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            backgroundColor: admin.isActive ? '#dcfce7' : '#fee2e2',
                                            color: admin.isActive ? '#166534' : '#991b1b',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                        }}>
                                            {admin.isActive ? 'Активний' : 'Неактивний'}
                                        </span>
                                </td>
                                <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>
                                    {new Date(admin.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    {isSuperAdmin && admin.role !== 'SUPER_ADMIN' && (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            {admin.isActive ? (
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin.id, admin.role)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#fee2e2',
                                                        color: '#dc2626',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    🗑️ Деактивувати
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleActivateAdmin(admin.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#dcfce7',
                                                        color: '#166534',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    ✅ Активувати
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <Modal
                    message={modalMessage}
                    type={modalType}
                    onClose={() => setShowModal(false)}
                />
            )}

            {showConfirmModal && (
                <ConfirmationModal
                    message="Деактивувати цього адміністратора?"
                    onConfirm={confirmDeleteAdmin}
                    onCancel={() => {
                        setShowConfirmModal(false);
                        setAdminToDelete(null);
                    }}
                    confirmText="Деактивувати"
                    cancelText="Скасувати"
                />
            )}
        </div>
    );
}