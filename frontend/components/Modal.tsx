'use client';

interface ModalProps {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
}

export function Modal({ message, type, onClose }: ModalProps) {
    const styles = {
        success: {
            bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            icon: '✅',
            borderColor: '#047857',
        },
        error: {
            bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            icon: '❌',
            borderColor: '#991b1b',
        },
        warning: {
            bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            icon: '⚠️',
            borderColor: '#b45309',
        },
        info: {
            bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            icon: 'ℹ️',
            borderColor: '#1e40af',
        },
    };

    const style = styles[type];

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                animation: 'fadeIn 0.3s ease-out',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: style.bg,
                    borderLeft: `4px solid ${style.borderColor}`,
                    borderRadius: '12px',
                    padding: '32px',
                    maxWidth: '500px',
                    width: '90%',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
                    color: 'white',
                    textAlign: 'center',
                    animation: 'slideUp 0.3s ease-out',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    {style.icon}
                </div>
                <p
                    style={{
                        margin: '0 0 24px 0',
                        fontSize: '16px',
                        fontWeight: '500',
                        lineHeight: '1.6',
                    }}
                >
                    {message}
                </p>
                <button
                    onClick={onClose}
                    style={{
                        padding: '12px 32px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        backdropFilter: 'blur(10px)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    Закрити
                </button>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes slideUp {
                    from {
                        transform: translateY(30px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}