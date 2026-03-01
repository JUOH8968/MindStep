import React from 'react';

export default function GiveUpEffect({ taskTitle }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
            animation: 'redOverlayFade 3s ease-in-out forwards'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(139, 0, 0, 0.3)',
                animation: 'overlayPulse 3s ease-in-out forwards'
            }} />
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(40, 20, 20, 0.9)',
                padding: '30px 50px',
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(139, 0, 0, 0.6)',
                textAlign: 'center',
                animation: 'cardFadeInOut 3s ease-in-out forwards',
                border: '1px solid rgba(139, 0, 0, 0.5)'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.8 }}>😔</div>
                <h2 style={{ margin: '10px 0', color: '#cd5c5c', fontSize: '24px' }}>포기</h2>
                <p style={{ margin: '10px 0', color: '#ddd', fontSize: '16px' }}>'{taskTitle}'</p>
                <p style={{ margin: '5px 0', color: '#999', fontSize: '14px' }}>괜찮아요, 다음 기회가 있어요</p>
            </div>
            <style>{`
                @keyframes redOverlayFade {
                    0% { opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes overlayPulse {
                    0% { background-color: rgba(139, 0, 0, 0); }
                    20% { background-color: rgba(139, 0, 0, 0.35); }
                    50% { background-color: rgba(139, 0, 0, 0.25); }
                    80% { background-color: rgba(139, 0, 0, 0.3); }
                    100% { background-color: rgba(139, 0, 0, 0); }
                }
                @keyframes cardFadeInOut {
                    0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
                    20% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
