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
        if (role !== 'SUPER_ADMIN') {
            router.push('/admin');
            return;
        }
        setIsSuperAdmin(true);
    }, [router]);

    const generateReport = async () => {
        setLoading(true);
        try {
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
                                {showJson ? JSON.stringify(reportData, null, 2) : 'Report data displayed here'}
                            </pre>
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