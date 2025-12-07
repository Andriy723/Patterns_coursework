'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

function AdminNavigation({ onLogout, role }: { onLogout: () => void; role: string }) {
    const [showMenu, setShowMenu] = useState(false);
    const [showProductsDropdown, setShowProductsDropdown] = useState(false);
    const [showDocumentsDropdown, setShowDocumentsDropdown] = useState(false);
    const [showCounterpartiesDropdown, setShowCounterpartiesDropdown] = useState(false);
    const isSuperAdmin = role === 'SUPER_ADMIN';
    const isAdmin = role === 'ADMIN';

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-dropdown]')) {
                setShowProductsDropdown(false);
                setShowDocumentsDropdown(false);
                setShowCounterpartiesDropdown(false);
                setShowMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

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
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Link href="/admin" style={{
                        textDecoration: 'none',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '16px',
                    }}>
                        🏭 Адмін-панель
                    </Link>
                    
                    {/* Дропдаун: Склад та Товари */}
                    <div style={{ position: 'relative' }} data-dropdown>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const newState = !showProductsDropdown;
                                setShowProductsDropdown(newState);
                                if (newState) {
                                    setShowDocumentsDropdown(false);
                                    setShowCounterpartiesDropdown(false);
                                    setShowMenu(false);
                                }
                            }}
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#d1d5db',
                                fontSize: '14px',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}
                        >
                            📦 Склад
                            <span style={{ fontSize: '10px' }}>{showProductsDropdown ? '▲' : '▼'}</span>
                        </button>
                        {showProductsDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                marginTop: '4px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                zIndex: 1000,
                                minWidth: '140px',
                            }}>
                                <Link href="/admin/products" style={{
                                    display: 'block',
                                    padding: '8px 12px',
                                    textDecoration: 'none',
                                    color: '#111827',
                                    fontSize: '13px',
                                    transition: 'background-color 0.2s',
                                }}
                                onClick={() => setShowProductsDropdown(false)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    📋 Товари
                                </Link>
                                <Link href="/admin/warehouse" style={{
                                    display: 'block',
                                    padding: '8px 12px',
                                    textDecoration: 'none',
                                    color: '#111827',
                                    fontSize: '13px',
                                    transition: 'background-color 0.2s',
                                }}
                                onClick={() => setShowProductsDropdown(false)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    📦 Склад
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Дропдаун: Накладні та Акти (для адмінів та супер адмінів) */}
                    {(isAdmin || isSuperAdmin) && (
                        <div style={{ position: 'relative' }} data-dropdown>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newState = !showDocumentsDropdown;
                                    setShowDocumentsDropdown(newState);
                                    if (newState) {
                                        setShowProductsDropdown(false);
                                        setShowCounterpartiesDropdown(false);
                                        setShowMenu(false);
                                    }
                                }}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#d1d5db',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                📄 Документи
                                {isSuperAdmin && ' / Звіти'}
                                <span style={{ fontSize: '10px' }}>{showDocumentsDropdown ? '▲' : '▼'}</span>
                            </button>
                            {showDocumentsDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    marginTop: '4px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                    zIndex: 1000,
                                    minWidth: '140px',
                                }}>
                                    <Link href="/admin/documents" style={{
                                        display: 'block',
                                        padding: '8px 12px',
                                        textDecoration: 'none',
                                        color: '#111827',
                                        fontSize: '13px',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onClick={() => setShowDocumentsDropdown(false)}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        📄 Накладні
                                    </Link>
                                    {isSuperAdmin && (
                                        <Link href="/admin/reports" style={{
                                            display: 'block',
                                            padding: '8px 12px',
                                            textDecoration: 'none',
                                            color: '#111827',
                                            fontSize: '13px',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onClick={() => setShowDocumentsDropdown(false)}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            📈 Звіти
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {isSuperAdmin && (
                        <>
                            {/* Дропдаун: Контрагенти та Постачальники */}
                            <div style={{ position: 'relative' }} data-dropdown>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newState = !showCounterpartiesDropdown;
                                        setShowCounterpartiesDropdown(newState);
                                        if (newState) {
                                            setShowProductsDropdown(false);
                                            setShowDocumentsDropdown(false);
                                            setShowMenu(false);
                                        }
                                    }}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: '#d1d5db',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    🤝 Контрагенти
                                    <span style={{ fontSize: '10px' }}>{showCounterpartiesDropdown ? '▲' : '▼'}</span>
                                </button>
                                {showCounterpartiesDropdown && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        marginTop: '4px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                        zIndex: 1000,
                                        minWidth: '160px',
                                    }}>
                                        <Link href="/admin/counterparties" style={{
                                            display: 'block',
                                            padding: '8px 12px',
                                            textDecoration: 'none',
                                            color: '#111827',
                                            fontSize: '13px',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onClick={() => setShowCounterpartiesDropdown(false)}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            🤝 Контрагенти
                                        </Link>
                                        <Link href="/admin/suppliers" style={{
                                            display: 'block',
                                            padding: '8px 12px',
                                            textDecoration: 'none',
                                            color: '#111827',
                                            fontSize: '13px',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onClick={() => setShowCounterpartiesDropdown(false)}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            🚚 Постачальники
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link href="/admin/admins" style={{
                                textDecoration: 'none',
                                color: '#d1d5db',
                                fontSize: '14px',
                            }}>
                                👥 Адміністратори
                            </Link>
                            <Link href="/admin/users" style={{
                                textDecoration: 'none',
                                color: '#d1d5db',
                                fontSize: '14px',
                            }}>
                                👤 Користувачі
                            </Link>
                        </>
                    )}
                </div>

                <div style={{ position: 'relative', display: 'flex', gap: '12px', alignItems: 'center' }} data-dropdown>
                    <span style={{
                        padding: '4px 12px',
                        backgroundColor: isSuperAdmin ? '#dc2626' : '#3b82f6',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}>
                        {isSuperAdmin ? '👑' : '👤'} АДМІН
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const newState = !showMenu;
                            setShowMenu(newState);
                            if (newState) {
                                setShowProductsDropdown(false);
                                setShowDocumentsDropdown(false);
                                setShowCounterpartiesDropdown(false);
                            }
                        }}
                        style={{
                            backgroundColor: '#374151',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
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
                                    width: 'calc(100% - 16px)',
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
                                    boxSizing: 'border-box',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                🚪 Вийти
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
    const [isAdminRoute, setIsAdminRoute] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            setIsAdminRoute(currentPath.startsWith('/admin'));
        }
    }, [pathname]);

    if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/admin')) {
            return <>{children}</>;
        }
    }

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const currentPath = window.location.pathname;
        
        if (currentPath === '/admin/login') {
            setIsCheckingAuth(false);
            setIsAuthenticated(false);
            return;
        }

        if (!currentPath.startsWith('/admin')) {
            setIsCheckingAuth(false);
            return;
        }

        const checkAuth = async () => {
            const token = localStorage.getItem('adminToken');
            let storedRole = localStorage.getItem('adminRole');
            
            if (!token) {
                setIsAuthenticated(false);
                router.replace('/admin/login');
                setIsCheckingAuth(false);
                return;
            }

            if (!storedRole || storedRole === 'undefined' || storedRole === 'null') {
                try {
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                    const response = await fetch(`${baseUrl}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const newRole = data.role || 'ADMIN';
                        storedRole = newRole;
                        localStorage.setItem('adminRole', newRole);
                    }
                } catch (error) {
                    console.error('Error fetching role:', error);
                }
            }

            setIsAuthenticated(true);
            const finalRole = storedRole || 'ADMIN';
            setRole(finalRole);
            
            if (finalRole !== 'SUPER_ADMIN' && (pathname.includes('/admin/admins') || pathname.includes('/admin/reports') || pathname.includes('/admin/users'))) {
                router.replace('/admin');
            }
            
            
            setIsCheckingAuth(false);
        };
        checkAuth();
    }, [router, pathname]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminRole');
        router.push('/user/login');
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