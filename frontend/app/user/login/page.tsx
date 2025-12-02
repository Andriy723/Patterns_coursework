'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function UserLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e:any) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const resp = await axios.post(baseUrl + '/auth/user/login', { email, password });
            localStorage.setItem('userToken', resp.data.token);
            localStorage.setItem('userEmail', resp.data.email);
            localStorage.setItem('userRole', resp.data.role);
            router.replace('/products');
        } catch (e:any) {
            setError(e?.response?.data?.error || 'Помилка авторизації');
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <div style={{maxWidth:420,margin:'60px auto',background:'#fff',padding:32,borderRadius:12,boxShadow:'0 2px 8px #eee'}}>
            <h1 style={{fontSize:24,marginBottom:18}}>🔑 Вхід для користувача</h1>
            <form onSubmit={handleSubmit}>
                <label style={{display:'block',marginBottom:6,fontWeight:600}}>Електронна пошта</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',marginBottom:16,padding:10,borderRadius:6,border:'1px solid #dde0e6'}} required autoFocus disabled={submitting}/>
                <label style={{display:'block',marginBottom:6,fontWeight:600}}>Пароль</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',marginBottom:18,padding:10,borderRadius:6,border:'1px solid #dde0e6'}} required disabled={submitting}/>
                <button type="submit" disabled={submitting} style={{background:'#3b82f6',color:'#fff',padding:'12px 20px',border:'none',borderRadius:8,fontWeight:600,width:'100%',fontSize:'16px',letterSpacing:1,marginTop:8,cursor:submitting?'not-allowed':'pointer'}}>
                    {submitting ? 'Вхід...' : 'Увійти'}
                </button>
            </form>
            {error && <div style={{color:'#dc2626', marginTop:16}}>{error}</div>}
            <div style={{marginTop:24, fontSize:13, color:'#64748b'}}>Потрібен доступ адміністратора? <a href="/admin/login" style={{color:'#2563eb', marginLeft:8}}>Увійти як адміністратор</a></div>
        </div>
    );
}
