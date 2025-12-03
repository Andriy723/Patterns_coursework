'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function UserLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminRole');

        const token = localStorage.getItem('userToken');
        if (token) {
            router.push('/');
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
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const resp = await axios.post(`${baseUrl}/auth/user/login`, { email, password }, { timeout: 10000 });
            
            localStorage.setItem('userToken', resp.data.token);
            localStorage.setItem('userEmail', resp.data.email);
            localStorage.setItem('userRole', resp.data.role);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminEmail');
            localStorage.removeItem('adminRole');
            
            router.push('/');
        } catch (e: any) {
            if (e.code === 'ECONNABORTED') {
                setError('Connection timeout. Is backend running?');
            } else if (e.response?.status === 401) {
                setError('Invalid email or password');
            } else if (e.response?.data?.error) {
                setError(e.response.data.error);
            } else if (e.message === 'Network Error') {
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
                    🔑 User Login
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
                            placeholder="user@example.com"
                            required
                            autoFocus
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
                    textAlign: 'center',
                }}>
                    <p style={{ margin: 0 }}>
                        Потрібен доступ адміністратора?{' '}
                        <a href="/admin/login" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>
                            Увійти як адміністратор
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
