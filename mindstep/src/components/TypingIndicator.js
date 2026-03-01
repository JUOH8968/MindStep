import React from 'react';

// 타이핑 인디케이터 컴포넌트
function TypingIndicator({ personaTheme }) {
    return (
        <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div style={{
                minWidth: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                border: `2px solid ${personaTheme?.point || '#ccc'}`,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <img
                    src={personaTheme?.img || '/Strategist_D.png'}
                    alt="AI"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{
                    padding: '14px 18px',
                    backgroundColor: '#fff',
                    borderRadius: '0 20px 20px 20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    borderLeft: `4px solid ${personaTheme?.point || '#ccc'}`,
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: personaTheme?.point || '#ccc',
                        animation: 'typing 1.4s infinite ease-in-out',
                        animationDelay: '0s'
                    }} />
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: personaTheme?.point || '#ccc',
                        animation: 'typing 1.4s infinite ease-in-out',
                        animationDelay: '0.2s'
                    }} />
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: personaTheme?.point || '#ccc',
                        animation: 'typing 1.4s infinite ease-in-out',
                        animationDelay: '0.4s'
                    }} />
                </div>
                <style>{`
                    @keyframes typing {
                        0%, 60%, 100% { 
                            transform: translateY(0); 
                            opacity: 0.7;
                        }
                        30% { 
                            transform: translateY(-10px); 
                            opacity: 1;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}

export default TypingIndicator;
