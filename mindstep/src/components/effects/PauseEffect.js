import React, { useEffect, useRef } from 'react';

export default function PauseEffect({ taskTitle }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let wave = 0;
        const waves = [];

        class WaveRing {
            constructor() {
                this.x = canvas.width / 2;
                this.y = canvas.height / 2;
                this.radius = 20;
                this.maxRadius = 150;
                this.alpha = 1;
                this.color = '#f39c12';
            }

            update() {
                this.radius += 2;
                this.alpha = 1 - (this.radius / this.maxRadius);
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }

        let frameCount = 0;
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            frameCount++;
            if (frameCount % 20 === 0 && waves.length < 5) {
                waves.push(new WaveRing());
            }

            waves.forEach((wave, index) => {
                if (wave.alpha <= 0 || wave.radius >= wave.maxRadius) {
                    waves.splice(index, 1);
                } else {
                    wave.update();
                    wave.draw();
                }
            });

            if (frameCount < 150) {
                requestAnimationFrame(animate);
            }
        }

        animate();

        return () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
    }, []);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
            <canvas ref={canvasRef} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '30px 50px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(243, 156, 18, 0.4)', textAlign: 'center', animation: 'breathe 2s ease-in-out infinite' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>⏸️</div>
                <h2 style={{ margin: '10px 0', color: '#f39c12', fontSize: '24px' }}>일시정지</h2>
                <p style={{ margin: '10px 0', color: '#333', fontSize: '16px' }}>'{taskTitle}'</p>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>잠시 숨 고르기...</p>
            </div>
            <style>{`
                @keyframes breathe {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.05); }
                }
            `}</style>
        </div>
    );
}
