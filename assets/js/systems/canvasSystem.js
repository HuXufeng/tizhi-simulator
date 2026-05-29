class CanvasSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.container = null;
        this.isInitialized = false;
        this.animationId = null;
        this.particles = [];
        this.currentPhase = 'early';
        this.currentWeather = 'clear';
        this.gameMonth = 1;
        
        this.phaseConfigs = {
            early: {
                bgGradient: ['#1a1a2e', '#16213e', '#1c2a4a'],
                overlayColor: 'rgba(100, 200, 255, 0.05)',
                particleColor: '#64c8ff',
                ambientIntensity: 0.3
            },
            mid: {
                bgGradient: ['#1a1a2e', '#1f2847', '#253352'],
                overlayColor: 'rgba(255, 200, 100, 0.08)',
                particleColor: '#ffcc66',
                ambientIntensity: 0.5
            },
            late: {
                bgGradient: ['#0f0f1a', '#1a1a2e', '#2a1f3d'],
                overlayColor: 'rgba(165, 94, 234, 0.1)',
                particleColor: '#a55eea',
                ambientIntensity: 0.2
            }
        };
        
        this.weatherConfigs = {
            clear: { opacity: 0, type: 'none' },
            cloudy: { opacity: 0.3, type: 'cloud' },
            rainy: { opacity: 0.6, type: 'rain' }
        };
    }

    init() {
        if (this.isInitialized) return;
        
        this.container = document.getElementById('main-screen');
        if (!this.container) return;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'atmosphere-canvas';
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            opacity: 0.7;
        `;
        
        this.container.insertBefore(this.canvas, this.container.firstChild);
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.isInitialized = true;
        this.bindEvents();
        this.startAnimation();
        
        this.createAmbientParticles();
    }

    resize() {
        if (!this.canvas || !this.container) return;
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    bindEvents() {
        eventBus.on('game:start', () => {
            setTimeout(() => this.init(), 100);
        });
        
        eventBus.on('phase:changed', (data) => {
            if (data.phase) {
                this.setPhase(data.phase);
            }
        });

        eventBus.on('month:changed', (data) => {
            this.gameMonth = data.month;
        });

        eventBus.on('canvas:setWeather', (weather) => {
            this.setWeather(weather);
        });

        eventBus.on('ui:showModal', () => this.dimForModal(true));
        eventBus.on('ui:hideModal', () => this.dimForModal(false));
    }

    setPhase(phase) {
        if (this.currentPhase !== phase) {
            this.currentPhase = phase;
            this.transitionToNewPhase();
        }
    }

    transitionToNewPhase() {
        this.fadeParticlesOut();
        setTimeout(() => {
            this.updateParticleColors();
            this.fadeParticlesIn();
        }, 500);
    }

    setWeather(weather) {
        this.currentWeather = weather;
    }

    createAmbientParticles() {
        this.particles = [];
        const count = 20;
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * (this.canvas?.width || 400),
                y: Math.random() * (this.canvas?.height || 700),
                size: 1 + Math.random() * 2,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: -0.1 - Math.random() * 0.2,
                opacity: 0.2 + Math.random() * 0.4,
                color: this.getParticleColor(),
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.02 + Math.random() * 0.02
            });
        }
    }

    getParticleColor() {
        const config = this.phaseConfigs[this.currentPhase];
        return config?.particleColor || '#64c8ff';
    }

    fadeParticlesOut() {
        this.particles.forEach(p => {
            p.targetOpacity = 0;
        });
    }

    fadeParticlesIn() {
        this.particles.forEach(p => {
            p.targetOpacity = 0.2 + Math.random() * 0.4;
        });
    }

    updateParticleColors() {
        const newColor = this.getParticleColor();
        this.particles.forEach(p => {
            p.color = newColor;
        });
    }

    startAnimation() {
        const animate = () => {
            this.draw();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    draw() {
        if (!this.ctx || !this.canvas) return;
        
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        
        this.drawBackground(width, height);
        this.drawTimeOverlay(width, height);
        this.drawParticles(width, height);

        if (this.currentWeather === 'rainy') {
            this.drawRain(width, height);
        }
    }

    drawBackground(width, height) {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        const colors = this.phaseConfigs[this.currentPhase]?.bgGradient || this.phaseConfigs.early.bgGradient;
        
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.5, colors[1]);
        gradient.addColorStop(1, colors[2]);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
    }

    drawTimeOverlay(width, height) {
        const config = this.phaseConfigs[this.currentPhase];
        if (!config?.overlayColor) return;
        
        this.ctx.fillStyle = config.overlayColor;
        this.ctx.fillRect(0, 0, width, height);
    }

    drawParticles(width, height) {
        this.particles.forEach(p => {
            p.wobble += p.wobbleSpeed;
            p.x += p.speedX + Math.sin(p.wobble) * 0.2;
            p.y += p.speedY;
            
            if (p.y < -10) {
                p.y = height + 10;
                p.x = Math.random() * width;
            }
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;
            
            if (p.targetOpacity !== undefined) {
                p.opacity += (p.targetOpacity - p.opacity) * 0.05;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });
    }

    getAtmosphereDescription() {
        const descriptions = {
            early: {
                clear: '月初的阳光透过窗户洒进来，充满希望',
                cloudy: '上旬的天空有些阴沉',
                rainy: '淅淅沥沥的春雨敲打着窗户'
            },
            mid: {
                clear: '中旬的阳光温暖而慵懒',
                cloudy: '中旬的云层遮住了阳光',
                rainy: '中旬的阵雨带来了片刻清凉'
            },
            late: {
                clear: '月末的天空格外宁静',
                cloudy: '下旬的天空灰蒙蒙的',
                rainy: '夜幕降临，雨声潺潺'
            }
        };
        
        return descriptions[this.currentPhase]?.[this.currentWeather] || descriptions.early.clear;
    }

    drawRain(width, height) {
        const raindrops = 50;
        
        this.ctx.strokeStyle = 'rgba(150, 180, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < raindrops; i++) {
            const x = Math.random() * width;
            const y = (Date.now() * 0.5 + i * 50) % height;
            const length = 10 + Math.random() * 20;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x - 2, y + length);
            this.ctx.stroke();
        }
    }

    dimForModal(show) {
        if (!this.canvas) return;
        this.canvas.style.transition = 'opacity 0.3s ease';
        this.canvas.style.opacity = show ? '0.2' : '0.7';
    }
}

const canvasSystem = new CanvasSystem();
window.canvasSystem = canvasSystem;
