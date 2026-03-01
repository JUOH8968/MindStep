import React, { useEffect, useRef } from 'react';

export default function ConfettiEffect({ taskTitle }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 150;
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

        class Particle {
            constructor() {
                this.x = canvas.width / 2;
                this.y = canvas.height / 2;
                this.vx = (Math.random() - 0.5) * 10;
                this.vy = (Math.random() - 0.5) * 10 - 5;
                this.gravity = 0.2;
                this.alpha = 1;
                this.decay = Math.random() * 0.015 + 0.005;
                this.size = Math.random() * 5 + 2;
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
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
            particles.push(new Particle());
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
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '30px 50px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', textAlign: 'center', animation: 'bounceIn 0.6s ease-out' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
                <h2 style={{ margin: '10px 0', color: '#2ecc71', fontSize: '24px' }}>완료!</h2>
                <p style={{ margin: '10px 0', color: '#333', fontSize: '16px' }}>'{taskTitle}'</p>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>정말 잘하셨어요!</p>
            </div>
            <style>{`
                @keyframes bounceIn {
                    0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.05); }
                    70% { transform: translate(-50%, -50%) scale(0.9); }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
