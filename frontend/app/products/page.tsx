// !! Ця сторінка призначена виключно для ролі USER. Для ролей ADMIN, SUPER_ADMIN використовуйте admin/products/page.tsx. Для неавторизованого доступу — public-simple API.
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface PublicProduct {
    id: string;
    name: string;
    article: string;
    quantity: number;
    minStock: number;
}

export default function UserProductsPage() {
    const [products, setProducts] = useState<PublicProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            router.replace('/user/login');
            return;
        }
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const resp = await axios.get(`${baseUrl}/products/public-simple`);
            setProducts(resp.data);
        } catch (err) {
            setError('Не вдалось завантажити список товарів');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px #d3d6db', padding: 24 }}>
            <div style={{textAlign:'right', marginBottom:12}}>
                <button onClick={() => { localStorage.removeItem('userToken'); window.location.href = '/user/login'; }} style={{background:'#e5e7eb',border:'none',padding:'8px 18px',borderRadius:6,cursor:'pointer',fontWeight:600}}>Вийти</button>
            </div>
            <h1 style={{ marginBottom: 20, fontSize: 26, fontWeight: 700 }}>📋 Склад: Cписок товарів</h1>
            <p style={{color:'#64748b',margin:'10px 0 15px 0'}}>Тут відображаються всі товари на складі (без цін). Ви увійшли як користувач.<br/>Якщо вам потрібен доступ до адміністративних функцій — натисніть "Адмін вхід" у верхньому рядку.</p>
            {loading && <div>Завантаження...</div>}
            {error && <div style={{color:'#b91c1c', margin:'12px 0'}}>{error}</div>}
            <table style={{ width: '100%', borderCollapse:'collapse', background: '#f9fafb' }}>
                <thead><tr>
                    <th style={{padding:12, textAlign:'left'}}>Назва</th>
                    <th style={{padding:12, textAlign:'left'}}>Артикул</th>
                    <th style={{padding:12, textAlign:'center'}}>Залишок</th>
                    <th style={{padding:12, textAlign:'center'}}>Мінімум</th>
                </tr></thead>
                <tbody>
                {products.map((p) => (
                    <tr key={p.id} style={{borderBottom:'1px solid #e4e7ed'}}>
                        <td style={{padding:10}}>{p.name}</td>
                        <td style={{padding:10}}>{p.article}</td>
                        <td style={{padding:10, textAlign:'center'}}>{p.quantity}</td>
                        <td style={{padding:10, textAlign:'center'}}>{p.minStock}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            {products.length === 0 && !loading && <div style={{marginTop: 22}}>Товарів немає</div>}
        </div>
    );
}