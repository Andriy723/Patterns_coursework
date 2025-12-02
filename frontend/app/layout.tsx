import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Складський облік',
    description: 'Система обліку товарів на складі',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="uk">
        <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {children}
        </div>
        </body>
        </html>
    );
}