'use client';

import Link from 'next/link';

export function Navigation() {
    return (
        <nav style={{
            backgroundColor: '#1f2937',
            borderBottom: '2px solid #3b82f6',
            padding: '16px 0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}>
            <div style={{
                display: 'flex',
                gap: '24px',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <Link href="/" style={{
                        textDecoration: 'none',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '16px',
                    }}>
                        🏭 Складський облік
                    </Link>
                    <Link href="/dashboard" style={{
                        textDecoration: 'none',
                        color: '#d1d5db',
                        fontSize: '14px',
                    }}>
                        📊 Панель
                    </Link>
                    <Link href="/products" style={{
                        textDecoration: 'none',
                        color: '#d1d5db',
                        fontSize: '14px',
                    }}>
                        📋 Товари
                    </Link>
                    <Link href="/warehouse" style={{
                        textDecoration: 'none',
                        color: '#d1d5db',
                        fontSize: '14px',
                    }}>
                        🏭 Склад
                    </Link>
                    <Link href="/suppliers" style={{
                        textDecoration: 'none',
                        color: '#d1d5db',
                        fontSize: '14px',
                    }}>
                        🚚 Постачальники
                    </Link>
                </div>

                <Link href="/admin/login" style={{
                    padding: '10px 20px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                }}
                      onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#b91c1c';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                          e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                    👤 Адмін
                </Link>
            </div>
        </nav>
    );
}