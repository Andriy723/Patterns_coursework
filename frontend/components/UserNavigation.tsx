'use client';

import { useState } from 'react';
import Link from 'next/link';

export function UserNavigation({ onLogout }: { onLogout: () => void }) {
    const [showMenu, setShowMenu] = useState(false);

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
                    <Link href="/products" style={{
                        textDecoration: 'none',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '600',
                    }}>
                        📋 Товари
                    </Link>
                </div>

                <div style={{ position: 'relative', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{
                        padding: '4px 12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                    }}>
                        👤 КОРИСТУВАЧ
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

