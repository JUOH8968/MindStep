import React, { useEffect, useRef } from 'react';

export default function StartEffect({ taskTitle }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 80;
        const colors = ['#3498db', '#2980b9', '#00bcd4', '#03a9f4', '#4fc3f7', '#81d4fa'];

        class Particle {
            constructor() {
                this.x = canvas.width / 2;
                this.y = canvas.height / 2 + 50;
                this.vx = (Math.random() - 0.5) * 8;
                this.vy = Math.random() * 8 + 5;
                this.alpha = 1;
                this.decay = Math.random() * 0.02 + 0.01;
                this.size = Math.random() * 6 + 3;
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
                this.size *= 0.98;
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
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '30px 50px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(52, 152, 219, 0.4)', textAlign: 'center', animation: 'rocketLaunch 0.6s ease-out' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px', animation: 'rocketMove 1s ease-in-out infinite' }}>🚀</div>
                <h2 style={{ margin: '10px 0', color: '#3498db', fontSize: '24px' }}>시작!</h2>
                <p style={{ margin: '10px 0', color: '#333', fontSize: '16px' }}>'{taskTitle}'</p>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>화이팅! 멋지게 해봐요!</p>
            </div>
            <style>{`
                @keyframes rocketLaunch {
                    0% { transform: translate(-50%, 100%); opacity: 0; }
                    100% { transform: translate(-50%, -50%); opacity: 1; }
                }
                @keyframes rocketMove {
                    0%, 100% { transform: translateY(0) rotate(-5deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }
            `}</style>
        </div>
    );
}
