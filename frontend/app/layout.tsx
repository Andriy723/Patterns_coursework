import type { Metadata } from 'next';
import './globals.css';

import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Складський облік',
    description: 'Система обліку товарів на складі',
};

function TopHeader() {
    if (typeof window === 'undefined') return null;
    
    const pathname = window.location.pathname;
    // Не показувати хедер на адмін-роутах (вони мають свою навігацію)
    if (pathname.startsWith('/admin')) return null;
    
    const userToken = localStorage.getItem('userToken');
    const adminToken = localStorage.getItem('adminToken');
    if (userToken || adminToken) return null;
    
    return (
        <div style={{ width: '100%', background: '#e0e7ef', padding: '6px 0', textAlign: 'right' }}>
            <Link href="/user/login" style={{ marginRight: 16, color: '#2563eb', fontWeight: 700 }}>Користувач</Link>
            <Link href="/admin/login" style={{ color: '#dc2626', fontWeight: 700 }}>Адмін вхід</Link>
        </div>
    );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="uk">
        <body>
        <TopHeader />
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {children}
        </div>
        </body>
        </html>
    );
}