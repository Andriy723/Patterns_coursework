'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('adminRole');
        if (role !== 'SUPER_ADMIN') {
            router.push('/admin');
            return;
        }
        setIsSuperAdmin(true);
        fetchUsers();
    }, [router]);

    const fetchUsers = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const response = await axios.get(`${baseUrl}/auth/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            await axios.post(`${baseUrl}/auth/users`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData({ email: '', password: '', name: '' });
            setShowForm(false);
            await fetchUsers();
            alert('User created successfully');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Error creating user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Deactivate this user?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            await axios.delete(`${baseUrl}/auth/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchUsers();
        } catch (error) {
            alert('Error deactivating user');
        }
    };

    if (!isSuperAdmin) return null;

    return (
        <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>👤 User Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                    }}
                >
                    {showForm ? '✕ Cancel' : '➕ Create User'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreateUser} style={{
                    display: 'grid',
                    gap: '16px',
                    maxWidth: '400px',
                    padding: '24px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    marginBottom: '30px',
                }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                            Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                            Email
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
                            Password
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
                        {submitting ? 'Creating...' : 'Create'}
                    </button>
                </form>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>⏳ Loading...</p>
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
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Name</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Email</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Created</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>{user.name}</td>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>{user.email}</td>
                                <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                                        color: user.isActive ? '#166534' : '#991b1b',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                    }}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    {user.isActive && (
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
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
                                            🗑️ Deactivate
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

