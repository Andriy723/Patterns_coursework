'use client';

import React, { useState, useEffect } from 'react';

interface Settings {
    minStock: number;
    currency: string;
    apiUrl: string;
    theme: 'light' | 'dark';
    itemsPerPage: number;
    dateFormat: string;
    language: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Settings>({
        minStock: 10,
        currency: 'USD',
        apiUrl: 'http://localhost:3001/api',
        theme: 'light',
        itemsPerPage: 20,
        dateFormat: 'DD.MM.YYYY',
        language: 'uk',
    });

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        const saved = localStorage?.getItem('warehouseSettings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }, []);

    const handleSave = () => {
        try {
            localStorage?.setItem('warehouseSettings', JSON.stringify(settings));
            setModalMessage('✅ Налаштування збережені успішно');
            setShowModal(true);
            setTimeout(() => setShowModal(false), 2000);
        } catch (error) {
            setModalMessage('❌ Помилка при збереженні налаштувань');
            setShowModal(true);
        }
    };

    const handleReset = () => {
        const defaultSettings: Settings = {
            minStock: 10,
            currency: 'USD',
            apiUrl: 'http://localhost:3001/api',
            theme: 'light',
            itemsPerPage: 20,
            dateFormat: 'DD.MM.YYYY',
            language: 'uk',
        };
        setSettings(defaultSettings);
        localStorage?.setItem('warehouseSettings', JSON.stringify(defaultSettings));
        setModalMessage('✅ Налаштування скинуті на типові');
        setShowModal(true);
        setTimeout(() => setShowModal(false), 2000);
    };

    return (
        <>
            <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
                <h1>⚙️ Налаштування системи</h1>

                <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                    <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <h3>📦 Основні параметри</h3>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Мінімальний запас (од.)</label>
                                <input
                                    type="number"
                                    value={settings.minStock}
                                    onChange={(e) => setSettings({ ...settings, minStock: Number(e.target.value) })}
                                    min="0"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                    Базова кількість для оповіщення про низький запас
                                </small>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Валюта</label>
                                <select
                                    value={settings.currency}
                                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                >
                                    <option value="USD">💵 USD (Американський долар)</option>
                                    <option value="EUR">💶 EUR (Євро)</option>
                                    <option value="UAH">₴ UAH (Українська гривня)</option>
                                    <option value="PLN">zł PLN (Польський злотий)</option>
                                    <option value="GBP">£ GBP (Британський фунт)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>API URL</label>
                                <input
                                    type="text"
                                    value={settings.apiUrl}
                                    onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
                                    placeholder="http://localhost:3001/api"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                    Адреса сервера API
                                </small>
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <h3>🎨 Вигляд та мова</h3>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Тема</label>
                                <select
                                    value={settings.theme}
                                    onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                >
                                    <option value="light">☀️ Світла тема</option>
                                    <option value="dark">🌙 Темна тема</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Мова</label>
                                <select
                                    value={settings.language}
                                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                >
                                    <option value="uk">🇺🇦 Українська</option>
                                    <option value="en">🇬🇧 English</option>
                                    <option value="ru">🇷🇺 Русский</option>
                                    <option value="pl">🇵🇱 Polski</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Формат дати</label>
                                <select
                                    value={settings.dateFormat}
                                    onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                >
                                    <option value="DD.MM.YYYY">📅 DD.MM.YYYY (01.01.2024)</option>
                                    <option value="MM/DD/YYYY">📅 MM/DD/YYYY (01/01/2024)</option>
                                    <option value="YYYY-MM-DD">📅 YYYY-MM-DD (2024-01-01)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <h3>📋 Інші параметри</h3>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Елементів на сторінці</label>
                                <input
                                    type="number"
                                    value={settings.itemsPerPage}
                                    onChange={(e) => setSettings({ ...settings, itemsPerPage: Number(e.target.value) })}
                                    min="5"
                                    max="100"
                                    step="5"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                    Кількість рядків у таблицях
                                </small>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '12px',
                                backgroundColor: '#00aa00',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                        >
                            💾 Зберегти
                        </button>
                        <button
                            onClick={handleReset}
                            style={{
                                padding: '12px',
                                backgroundColor: '#666',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                        >
                            🔄 Скинути типові
                        </button>
                    </div>

                    <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', border: '1px solid #bbdefb' }}>
                        <h4>ℹ️ Про налаштування</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                            <li>Мінімальний запас використовується для автоматичних оповіщень</li>
                            <li>Валюта відображається у всіх звітах і таблицях</li>
                            <li>API URL потрібно змінити, якщо сервер запущено на іншому хості</li>
                            <li>Всі налаштування зберігаються локально у браузері</li>
                        </ul>
                    </div>
                </div>
            </main>

            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#d4edda',
                    border: '2px solid #c3e6cb',
                    borderRadius: '8px',
                    padding: '20px',
                    maxWidth: '400px',
                    zIndex: 1000,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    textAlign: 'center',
                    color: '#155724',
                }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>{modalMessage}</p>
                    <button
                        onClick={() => setShowModal(false)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#155724',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Закрити
                    </button>
                </div>
            )}
        </>
    );
}