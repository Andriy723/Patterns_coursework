'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function AdminNav() {
    const router = useRouter();

    return (
        <nav
            style={{
                backgroundColor: '#1f2937',
                borderBottom: '2px solid #dc2626',
                padding: '16px 0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    gap: '24px',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 20px',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <Link
                        href="/admin"
                        style={{
                            textDecoration: 'none',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#ffffff';
                        }}
                    >
                        🏠 Адмін-панель
                    </Link>
                    <Link
                        href="/admin/products"
                        style={{
                            textDecoration: 'none',
                            color: '#d1d5db',
                            fontSize: '14px',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#d1d5db';
                        }}
                    >
                        📋 Товари
                    </Link>
                    <Link
                        href="/admin/suppliers"
                        style={{
                            textDecoration: 'none',
                            color: '#d1d5db',
                            fontSize: '14px',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#d1d5db';
                        }}
                    >
                        🚚 Постачальники
                    </Link>
                </div>

                <button
                    onClick={() => router.push('/')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s',
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
                    ← Назад до користувача
                </button>
            </div>
        </nav>
    );
}