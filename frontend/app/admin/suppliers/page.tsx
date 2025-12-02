'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Supplier {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('adminRole');
        setIsSuperAdmin(role === 'SUPER_ADMIN');
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const response = await axios.get(`${baseUrl}/suppliers`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSuppliers(response.data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            await axios.post(
                `${baseUrl}/suppliers`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setFormData({ name: '', phone: '', email: '', address: '' });
            setShowForm(false);
            await fetchSuppliers();
            alert('Supplier added successfully');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Error adding supplier');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>🚚 Suppliers</h1>
                {isSuperAdmin && (
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
                        {showForm ? '✕ Cancel' : '➕ Add Supplier'}
                    </button>
                )}
            </div>
            {!isSuperAdmin && (<div style={{margin:'0 0 24px 0',background:'#e0f2fe',border:'1px solid #bae6fd',borderRadius:'8px',color:'#0369a1',fontSize:'13px',padding:12}}>Сторінка тільки для перегляду. CRUD постачальників дозволено лише Super Admin</div>)}
            {isSuperAdmin && showForm && (
                <form onSubmit={handleCreateSupplier} style={{
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
                            Phone
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
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
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                            Address
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                            }}
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
                        {submitting ? 'Adding...' : 'Add Supplier'}
                    </button>
                </form>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    ⏳ Loading...
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    {suppliers.length === 0 ? (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px',
                            color: '#6b7280',
                        }}>
                            No suppliers available
                        </div>
                    ) : (
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
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Phone</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Email</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#111827', fontSize: '14px' }}>Address</th>
                            </tr>
                            </thead>
                            <tbody>
                            {suppliers.map((supplier) => (
                                <tr key={supplier.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>{supplier.name}</td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>{supplier.phone}</td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>{supplier.email}</td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>{supplier.address}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {!isSuperAdmin && (
                <div style={{
                    marginTop: '20px',
                    padding: '12px',
                    backgroundColor: '#e0f2fe',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    color: '#0369a1',
                    fontSize: '13px',
                }}>
                    ℹ️ Only Super Admins can add or edit suppliers
                </div>
            )}
        </div>
    );
}