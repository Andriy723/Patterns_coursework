// frontend/app/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

function AdminNavigation({ onLogout, role }: { onLogout: () => void; role: string }) {
    const [showMenu, setShowMenu] = useState(false);
    const isSuperAdmin = role === 'SUPER_ADMIN';
    const isAdmin = role === 'ADMIN';

    return (
        <nav style={{
            backgroundColor: '#1f2937',
            borderBottom: `2px solid ${isSuperAdmin ? '#dc2626' : '#3b82f6'}`,
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
                    <Link href="/admin" style={{
                        textDecoration: 'none',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '16px',
                    }}>
                        🏭 Admin
                    </Link>
                    <Link href="/admin/products" style={{
                        textDecoration: 'none',
                        color: '#d1d5db',
                        fontSize: '14px',
                    }}>
                        📋 Products
                    </Link>
                    <Link href="/admin/suppliers" style={{
                        textDecoration: 'none',
                        color: '#d1d5db',
                        fontSize: '14px',
                    }}>
                        🚚 Suppliers
                    </Link>
                    <Link href="/admin/warehouse" style={{
                        textDecoration: 'none',
                        color: '#d1d5db',
                        fontSize: '14px',
                    }}>
                        📦 Warehouse
                    </Link>
                    {isSuperAdmin && (
                        <>
                            <Link href="/admin/admins" style={{
                                textDecoration: 'none',
                                color: '#d1d5db',
                                fontSize: '14px',
                            }}>
                                👥 Admins
                            </Link>
                            <Link href="/admin/reports" style={{
                                textDecoration: 'none',
                                color: '#d1d5db',
                                fontSize: '14px',
                            }}>
                                📈 Reports
                            </Link>
                        </>
                    )}
                </div>

                <div style={{ position: 'relative', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{
                        padding: '4px 12px',
                        backgroundColor: isSuperAdmin ? '#dc2626' : '#3b82f6',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                    }}>
                        {isSuperAdmin ? '👑 SUPER ADMIN' : '👤 ADMIN'}
                    </span>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        style={{
                            backgroundColor: '#374151',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                        }}
                    >
                        ⚙️
                    </button>

                    {showMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '8px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                            minWidth: '150px',
                        }}>
                            <button
                                onClick={onLogout}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    backgroundColor: '#fee2e2',
                                    color: '#dc2626',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    borderRadius: '8px',
                                    margin: '8px',
                                    textAlign: 'left',
                                }}
                            >
                                🚪 Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('adminToken');
            const storedRole = localStorage.getItem('adminRole');

            if (!token) {
                setIsAuthenticated(false);
                if (pathname !== '/admin/login') {
                    router.replace('/admin/login');
                }
            } else {
                setIsAuthenticated(true);
                setRole(storedRole || 'ADMIN');

                if (pathname === '/admin/login') {
                    router.replace('/admin');
                }

                if (storedRole !== 'SUPER_ADMIN' && (pathname.includes('/admin/admins') || pathname.includes('/admin/reports'))) {
                    router.replace('/admin');
                }
            }

            setIsCheckingAuth(false);
        };

        checkAuth();
    }, [router, pathname]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminRole');
        router.push('/admin/login');
    };

    if (isCheckingAuth) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '40px',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <p style={{ fontSize: '18px', color: '#6b7280' }}>⏳ Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated && pathname !== '/admin/login') {
        return null;
    }

    if (pathname === '/admin/login') {
        return children;
    }

    return (
        <>
            <AdminNavigation onLogout={handleLogout} role={role} />
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </>
    );
}