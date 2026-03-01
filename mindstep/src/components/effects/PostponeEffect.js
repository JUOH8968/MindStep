import React, { useEffect, useRef } from 'react';

export default function PostponeEffect({ taskTitle }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 50;

        class ClockParticle {
            constructor() {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 100 + 50;
                this.x = canvas.width / 2 + Math.cos(angle) * distance;
                this.y = canvas.height / 2 + Math.sin(angle) * distance;
                this.targetX = canvas.width / 2;
                this.targetY = canvas.height / 2;
                this.speed = 0.02;
                this.alpha = 1;
                this.size = Math.random() * 8 + 4;
                this.color = '#9b59b6';
            }

            update() {
                this.x += (this.targetX - this.x) * this.speed;
                this.y += (this.targetY - this.y) * this.speed;
                const dist = Math.sqrt(Math.pow(this.x - this.targetX, 2) + Math.pow(this.y - this.targetY, 2));
                if (dist < 10) {
                    this.alpha -= 0.05;
                }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                particles.push(new ClockParticle());
            }, i * 50);
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((particle, index) => {
                if (particle.alpha <= 0) {
                    particles.splice(index, 1);
                } else {
                    particle.update();
                    particle.draw();
                }
            });
            if (particles.length > 0) {
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
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '30px 50px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(155, 89, 182, 0.4)', textAlign: 'center', animation: 'hourglassFlip 0.6s ease-out' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px', animation: 'spinSlow 3s linear infinite' }}>⏳</div>
                <h2 style={{ margin: '10px 0', color: '#9b59b6', fontSize: '24px' }}>미루기</h2>
                <p style={{ margin: '10px 0', color: '#333', fontSize: '16px' }}>'{taskTitle}'</p>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>나중에 다시 도전!</p>
            </div>
            <style>{`
                @keyframes hourglassFlip {
                    0% { transform: translate(-50%, -50%) rotateY(90deg); opacity: 0; }
                    100% { transform: translate(-50%, -50%) rotateY(0deg); opacity: 1; }
                }
                @keyframes spinSlow {
                    0% { transform: rotate(0deg); }
                    50% { transform: rotate(180deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
