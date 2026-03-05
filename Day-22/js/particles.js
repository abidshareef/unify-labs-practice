/**
 * NEXUS — Particle System
 * Canvas-based ambient particle background with network connections.
 * Adapts colors to dark/light theme.
 */

export default class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: -1000, y: -1000 };
        this.animationId = null;
        this.isRunning = false;

        // Config
        this.config = {
            particleCount: 60,
            maxSpeed: 0.4,
            particleMinSize: 1,
            particleMaxSize: 3,
            connectionDistance: 150,
            mouseRadius: 200,
            colors: {
                dark: {
                    particle: 'rgba(99, 102, 241, 0.5)',
                    line: 'rgba(99, 102, 241, 0.08)',
                    glow: 'rgba(168, 85, 247, 0.3)',
                },
                light: {
                    particle: 'rgba(99, 102, 241, 0.35)',
                    line: 'rgba(99, 102, 241, 0.06)',
                    glow: 'rgba(168, 85, 247, 0.2)',
                },
            },
        };

        this.currentTheme = 'dark';
        this._bindEvents();
        this._resize();
        this._createParticles();
    }

    _bindEvents() {
        window.addEventListener('resize', () => this._resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });
    }

    _resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Adjust particle count for smaller screens
        const area = this.width * this.height;
        this.config.particleCount = Math.floor(Math.min(80, Math.max(25, area / 20000)));
    }

    _createParticles() {
        this.particles = [];
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * this.config.maxSpeed * 2,
                vy: (Math.random() - 0.5) * this.config.maxSpeed * 2,
                size: this.config.particleMinSize + Math.random() * (this.config.particleMaxSize - this.config.particleMinSize),
                opacity: 0.3 + Math.random() * 0.5,
                pulseSpeed: 0.005 + Math.random() * 0.01,
                pulseOffset: Math.random() * Math.PI * 2,
            });
        }
    }

    setTheme(theme) {
        this.currentTheme = theme;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this._animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    _animate() {
        if (!this.isRunning) return;

        const dpr = window.devicePixelRatio || 1;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const colors = this.config.colors[this.currentTheme];
        const time = Date.now() * 0.001;

        // Update & draw particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges
            if (p.x < 0 || p.x > this.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.height) p.vy *= -1;

            // Keep in bounds
            p.x = Math.max(0, Math.min(this.width, p.x));
            p.y = Math.max(0, Math.min(this.height, p.y));

            // Mouse interaction — subtle push
            const dx = p.x - this.mouse.x;
            const dy = p.y - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.config.mouseRadius) {
                const force = (1 - dist / this.config.mouseRadius) * 0.015;
                p.vx += dx * force;
                p.vy += dy * force;

                // Cap speed
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > this.config.maxSpeed * 3) {
                    p.vx = (p.vx / speed) * this.config.maxSpeed * 3;
                    p.vy = (p.vy / speed) * this.config.maxSpeed * 3;
                }
            } else {
                // Dampen back to normal speed
                p.vx *= 0.999;
                p.vy *= 0.999;
            }

            // Pulsing opacity
            const pulse = Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset) * 0.3 + 0.7;
            const currentOpacity = p.opacity * pulse;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = colors.particle.replace(/[\d.]+\)$/, `${currentOpacity})`);
            this.ctx.fill();

            // Draw glow
            if (p.size > 2) {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                this.ctx.fillStyle = colors.glow.replace(/[\d.]+\)$/, `${currentOpacity * 0.15})`);
                this.ctx.fill();
            }
        }

        // Draw connections
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const a = this.particles[i];
                const b = this.particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.config.connectionDistance) {
                    const opacity = (1 - dist / this.config.connectionDistance) * 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(a.x, a.y);
                    this.ctx.lineTo(b.x, b.y);
                    this.ctx.strokeStyle = colors.line.replace(/[\d.]+\)$/, `${opacity})`);
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }

        this.animationId = requestAnimationFrame(() => this._animate());
    }
}
