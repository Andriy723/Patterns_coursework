'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const email = typeof window !== 'undefined' ? localStorage.getItem('adminEmail') : null;

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const response = await axios.get(`${baseUrl}/warehouse/status`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000,
            });

            setStats(response.data?.stats);
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '700' }}>
                    🏭 Admin Dashboard
                </h1>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    Logged in as: <strong>{email || 'Admin'}</strong>
                </p>
            </div>

            {error && (
                <div style={{
                    padding: '20px',
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
                <div style={{ padding: '60px 40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                    <p style={{ fontSize: '18px', color: '#6b7280' }}>⏳ Loading...</p>
                </div>
            ) : stats ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                }}>
                    <div style={{
                        backgroundColor: '#dbeafe',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid #bfdbfe',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1e40af' }}>
                            📦 Total Products
                        </h3>
                        <p style={{ margin: 0, fontSize: '36px', fontWeight: '700', color: '#1e40af' }}>
                            {stats?.total_items || 0}
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#dcfce7',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid #bbf7d0',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#166534' }}>
                            📊 Total Quantity
                        </h3>
                        <p style={{ margin: 0, fontSize: '36px', fontWeight: '700', color: '#166534' }}>
                            {stats?.total_quantity || 0} units
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#fef3c7',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid #fcd34d',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#92400e' }}>
                            💰 Total Value
                        </h3>
                        <p style={{ margin: 0, fontSize: '36px', fontWeight: '700', color: '#92400e' }}>
                            ${Number(stats?.total_value ?? 0).toFixed(2)}
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{
                    padding: '60px 40px',
                    textAlign: 'center',
                    backgroundColor: '#fee2e2',
                    borderRadius: '12px',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                }}>
                    <p style={{ margin: 0, fontWeight: '600' }}>No data available</p>
                </div>
            )}

            <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #e0f2fe' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700', color: '#0369a1' }}>
                    📚 Quick Links
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <a href="/admin/products" style={{
                        padding: '12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: '600',
                    }}>
                        📋 Manage Products
                    </a>
                    <a href="/admin/suppliers" style={{
                        padding: '12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: '600',
                    }}>
                        🚚 Manage Suppliers
                    </a>
                    <a href="/admin/reports" style={{
                        padding: '12px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: '600',
                    }}>
                        📈 View Reports
                    </a>
                    <a href="/admin/admins" style={{
                        padding: '12px',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: '600',
                    }}>
                        👥 Manage Admins
                    </a>
                </div>
            </div>
        </div>
    );
}