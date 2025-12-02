'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminReportsPage() {
    const router = useRouter();
    const [selectedReport, setSelectedReport] = useState<'status' | 'dynamics' | 'financial'>('status');
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showJson, setShowJson] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('adminRole');
        setIsSuperAdmin(role === 'SUPER_ADMIN');
        if (role !== 'SUPER_ADMIN') return;
    }, [router]);

    if (!isSuperAdmin) {
        return <div style={{margin:40,padding:36,maxWidth:500,borderRadius:12,background:'#e0f2fe',color:'#0369a1',border:'1px solid #bae6fd'}}>
          Доступ до звітів має лише Super Admin.<br/>Зверніться до власника системи, якщо необхідна ця функція.
        </div>;
    }

    const generateReport = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            const response = await axios.get(
                `${baseUrl}/reports/${selectedReport}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setReportData(response.data);
        } catch (error) {
            alert('Error loading report');
        } finally {
            setLoading(false);
        }
    };

    if (!isSuperAdmin) {
        return null;
    }

    return (
        <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
            <h1 style={{ margin: '0 0 30px 0', fontSize: '28px', fontWeight: '700' }}>
                📈 Reports (Super Admin Only)
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px', marginTop: '20px' }}>
                <div style={{
                    backgroundColor: '#ffffff',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    height: 'fit-content',
                }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: '#111827', textTransform: 'uppercase' }}>
                        Select Report
                    </h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {(['status', 'dynamics', 'financial'] as const).map((report) => (
                            <button
                                key={report}
                                onClick={() => setSelectedReport(report)}
                                disabled={loading}
                                style={{
                                    padding: '12px',
                                    backgroundColor: selectedReport === report ? '#3b82f6' : '#f3f4f6',
                                    color: selectedReport === report ? 'white' : '#374151',
                                    border: selectedReport === report ? '2px solid #1d4ed8' : '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    opacity: loading ? 0.6 : 1,
                                }}
                            >
                                {report === 'status' && '📊 Status'}
                                {report === 'dynamics' && '📉 Dynamics'}
                                {report === 'financial' && '💰 Financial'}
                            </button>
                        ))}
                        <button
                            onClick={generateReport}
                            disabled={loading}
                            style={{
                                padding: '12px',
                                backgroundColor: loading ? '#9ca3af' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                marginTop: '8px',
                            }}
                        >
                            {loading ? '⏳ Generating...' : '✅ Generate'}
                        </button>
                    </div>
                </div>

                <div style={{
                    backgroundColor: '#ffffff',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    maxHeight: '600px',
                    overflowY: 'auto',
                }}>
                    {reportData ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                                    📊 Report
                                </h2>
                                <button
                                    onClick={() => setShowJson(!showJson)}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: showJson ? '#ef4444' : '#e5e7eb',
                                        color: showJson ? 'white' : '#374151',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                    }}
                                >
                                    {showJson ? '📋 Format' : '👁️ JSON'}
                                </button>
                            </div>

                            {showJson ? (
                                <pre style={{
                                    whiteSpace: 'pre-wrap',
                                    wordWrap: 'break-word',
                                    fontSize: '12px',
                                    backgroundColor: '#f9fafb',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    color: '#374151',
                                    margin: 0,
                                    fontFamily: 'monospace',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                }}>
                                    {JSON.stringify(reportData, null, 2)}
                                </pre>
                            ) : (
                                <div style={{ fontSize: '14px', color: '#374151' }}>
                                    {reportData.reportType === 'WAREHOUSE_STATUS' && (
                                        <div>
                                            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>
                                                Стан складу на {reportData.date}
                                            </h3>
                                            <p style={{ margin: '0 0 8px 0' }}>Загальна кількість товарів: <strong>{reportData.totalProducts}</strong></p>
                                            <p style={{ margin: '0 0 16px 0' }}>Загальна вартість: <strong>${reportData.totalValue}</strong></p>
                                            {reportData.products && reportData.products.length > 0 && (
                                                <div style={{ marginTop: '20px' }}>
                                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Товари:</h4>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                                        <thead>
                                                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                                                <th style={{ padding: '8px', textAlign: 'left' }}>Назва</th>
                                                                <th style={{ padding: '8px', textAlign: 'left' }}>Артикул</th>
                                                                <th style={{ padding: '8px', textAlign: 'center' }}>Кількість</th>
                                                                <th style={{ padding: '8px', textAlign: 'right' }}>Ціна</th>
                                                                <th style={{ padding: '8px', textAlign: 'right' }}>Вартість</th>
                                                                <th style={{ padding: '8px', textAlign: 'left' }}>Постачальник</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {reportData.products.map((p: any) => (
                                                                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                                    <td style={{ padding: '8px' }}>{p.name}</td>
                                                                    <td style={{ padding: '8px' }}>{p.article}</td>
                                                                    <td style={{ padding: '8px', textAlign: 'center' }}>{p.quantity}</td>
                                                                    <td style={{ padding: '8px', textAlign: 'right' }}>${Number(p.price || 0).toFixed(2)}</td>
                                                                    <td style={{ padding: '8px', textAlign: 'right' }}>${Number(p.total_value || 0).toFixed(2)}</td>
                                                                    <td style={{ padding: '8px' }}>{p.supplierName || 'N/A'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {reportData.reportType === 'MOVEMENT_DYNAMICS' && (
                                        <div>
                                            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>
                                                Динаміка руху товарів ({reportData.period?.start} - {reportData.period?.end})
                                            </h3>
                                            {reportData.summary && reportData.summary.length > 0 && (
                                                <div style={{ marginBottom: '20px' }}>
                                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Підсумок:</h4>
                                                    {reportData.summary.map((s: any) => (
                                                        <p key={s.type} style={{ margin: '4px 0' }}>
                                                            {s.type}: {s.total_quantity} од. ({s.count} операцій)
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {reportData.reportType === 'FINANCIAL' && (
                                        <div>
                                            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>
                                                Фінансова оцінка на {reportData.date}
                                            </h3>
                                            <p style={{ margin: '0 0 16px 0' }}>Загальна вартість складу: <strong>${reportData.totalInventoryValue}</strong></p>
                                            {reportData.products && reportData.products.length > 0 && (
                                                <div style={{ marginTop: '20px' }}>
                                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Товари:</h4>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                                        <thead>
                                                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                                                <th style={{ padding: '8px', textAlign: 'left' }}>Назва</th>
                                                                <th style={{ padding: '8px', textAlign: 'left' }}>Артикул</th>
                                                                <th style={{ padding: '8px', textAlign: 'center' }}>Кількість</th>
                                                                <th style={{ padding: '8px', textAlign: 'right' }}>Ціна</th>
                                                                <th style={{ padding: '8px', textAlign: 'right' }}>Вартість</th>
                                                                <th style={{ padding: '8px', textAlign: 'left' }}>Постачальник</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {reportData.products.map((p: any) => (
                                                                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                                    <td style={{ padding: '8px' }}>{p.name}</td>
                                                                    <td style={{ padding: '8px' }}>{p.article}</td>
                                                                    <td style={{ padding: '8px', textAlign: 'center' }}>{p.quantity}</td>
                                                                    <td style={{ padding: '8px', textAlign: 'right' }}>${Number(p.price || 0).toFixed(2)}</td>
                                                                    <td style={{ padding: '8px', textAlign: 'right' }}>${Number(p.total_value || 0).toFixed(2)}</td>
                                                                    <td style={{ padding: '8px' }}>{p.supplierName || 'N/A'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                            <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>
                                Select report type and click Generate
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}