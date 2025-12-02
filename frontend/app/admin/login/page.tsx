'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);

        const token = localStorage.getItem('adminToken');
        if (token) {
            router.push('/admin');
        }
    }, [router]);

    if (!mounted) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const response = await axios.post(
                `${apiUrl}/auth/login`,
                { email, password },
                { timeout: 10000 }
            );

            localStorage.setItem('adminToken', response.data.token);
            localStorage.setItem('adminEmail', response.data.email);
            localStorage.setItem('adminRole', response.data.role);
            router.push('/admin');
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.code === 'ECONNABORTED') {
                setError('Connection timeout. Is backend running?');
            } else if (err.response?.status === 401) {
                setError('Invalid email or password');
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.message === 'Network Error') {
                setError('Cannot connect to backend. Is it running on http://localhost:3001?');
            } else {
                setError('Login failed. Try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                width: '100%',
                maxWidth: '400px',
            }}>
                <h1 style={{
                    margin: '0 0 10px 0',
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#111827',
                    textAlign: 'center',
                }}>
                    🔐 Admin Panel
                </h1>
                <p style={{
                    margin: '0 0 30px 0',
                    fontSize: '13px',
                    color: '#6b7280',
                    textAlign: 'center',
                }}>
                    Warehouse Management System
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#6b7280',
                            marginBottom: '6px',
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                opacity: loading ? 0.6 : 1,
                            }}
                            placeholder="admin@warehouse.local"
                            required
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#6b7280',
                            marginBottom: '6px',
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                opacity: loading ? 0.6 : 1,
                            }}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            color: '#991b1b',
                            fontSize: '13px',
                            fontWeight: '500',
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px',
                            backgroundColor: loading ? '#9ca3af' : '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            marginTop: '8px',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = '#5568d3';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = '#667eea';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {loading ? '⏳ Logging in...' : '🔓 Login'}
                    </button>
                </form>

                <div style={{
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e5e7eb',
                    fontSize: '12px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>📝 Demo Credentials:</p>
                    <p style={{ margin: '0 0 4px 0' }}>👑 Super Admin:</p>
                    <p style={{ margin: '0 0 10px 0', fontSize: '11px', marginLeft: '12px' }}>
                        admin@warehouse.local / Admin123!
                    </p>
                </div>
            </div>
        </div>
    );
}