const PIXEL_PALETTE = {
    cream:      '#f5f0e8',
    lightBeige: '#e8ddd0',
    midBeige:   '#d4c5b0',
    brown:      '#8b7355',
    darkBrown:  '#5c4a3a',
    black:      '#000000',
    white:      '#ffffff',
    pink:       '#f0a8a8',
    yellow:     '#f7d794',
    mint:       '#a8d8b9',
    skyBlue:    '#7ec8e3',
    orange:     '#e8a87c',
    lavender:   '#c9b1ff'
};

const PIXEL_W = 320;
const PIXEL_H = 192;
const SCALE = 2;

class PixelSceneRenderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.container = null;
        this.currentScene = 'office';
        this.currentTimePart = 'afternoon';
        this.isInitialized = false;
        this.animFrame = 0;
        this.animationId = null;
        this.dynamicElements = [];
        this.easterEggs = {
            mouseActive: false,
            rainbowActive: false,
            slackMaster: false,
            fridayMode: false,
            comboActive: false
        };
        this._lastDrawTime = 0;
    }

    init() {
        if (this.isInitialized) return;

        this.container = document.getElementById('main-screen');
        if (!this.container) return;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'pixel-scene-canvas';
        this.canvas.width = PIXEL_W;
        this.canvas.height = PIXEL_H;
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            object-fit: cover;
            image-rendering: pixelated;
            image-rendering: crisp-edges;
        `;
        this.ctx = this.canvas.getContext('2d');

        const containerStyle = window.getComputedStyle(this.container);
        if (containerStyle.position === 'static') {
            this.container.style.position = 'relative';
        }

        const atmosphereCanvas = document.getElementById('atmosphere-canvas');
        if (atmosphereCanvas) {
            atmosphereCanvas.insertAdjacentElement('afterend', this.canvas);
        } else {
            this.container.insertBefore(this.canvas, this.container.firstChild);
        }

        this.isInitialized = true;
        this.bindEvents();
        this.startLoop();
    }

    bindEvents() {
        eventBus.on('game:start', () => {
            setTimeout(() => this.init(), 100);
        });
        eventBus.on('scene:change', (scene) => this.changeScene(scene));
        eventBus.on('phase:changed', (data) => {
            this.currentTimePart = data.phase === 'early' ? 'morning' : data.phase === 'mid' ? 'afternoon' : 'evening';
        });
        eventBus.on('canvas:setWeather', () => {});
        eventBus.on('combo:update', (data) => {
            if (data.count >= 5) this.easterEggs.comboActive = true;
        });
        eventBus.on('combo:reset', () => {
            this.easterEggs.comboActive = false;
        });
    }

    changeScene(sceneId) {
        if (['office','meeting','cafeteria','corridor','leader_office','rest_area','entrance','rooftop'].includes(sceneId)) {
            this.currentScene = sceneId;
        }
    }

    startLoop() {
        const loop = (timestamp) => {
            if (timestamp - this._lastDrawTime < 66) {
                this.animationId = requestAnimationFrame(loop);
                return;
            }
            this._lastDrawTime = timestamp;
            this.animFrame = (this.animFrame + 1) % 60;
            this.draw();
            this.animationId = requestAnimationFrame(loop);
        };
        this.animationId = requestAnimationFrame(loop);
    }

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;

        ctx.save();

        switch (this.currentScene) {
            case 'office':      this.drawOffice(ctx); break;
            case 'meeting':     this.drawMeeting(ctx); break;
            case 'cafeteria':   this.drawCafeteria(ctx); break;
            case 'corridor':    this.drawCorridor(ctx); break;
            case 'leader_office': this.drawLeaderOffice(ctx); break;
            case 'rest_area':   this.drawRestArea(ctx); break;
            case 'entrance':    this.drawEntrance(ctx); break;
            case 'rooftop':     this.drawRooftop(ctx); break;
            default:            this.drawOffice(ctx); break;
        }

        this.applyTimeLighting(ctx);

        this.drawDynamicElements(ctx);
        this.drawEasterEggs(ctx);

        ctx.restore();
    }

    applyTimeLighting(ctx) {
        ctx.save();
        switch (this.currentTimePart) {
            case 'morning':
                ctx.fillStyle = 'rgba(255, 200, 100, 0.06)';
                ctx.fillRect(0, 0, PIXEL_W, PIXEL_H);
                break;
            case 'afternoon':
                ctx.fillStyle = 'rgba(255, 180, 80, 0.03)';
                ctx.fillRect(0, 0, PIXEL_W, PIXEL_H);
                break;
            case 'evening':
                ctx.fillStyle = 'rgba(200, 180, 220, 0.08)';
                ctx.fillRect(0, 0, PIXEL_W, PIXEL_H);
                const gradient = ctx.createRadialGradient(280, 30, 0, 280, 30, 200);
                gradient.addColorStop(0, 'rgba(255, 200, 100, 0.08)');
                gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, PIXEL_W, PIXEL_H);
                break;
        }
        ctx.restore();
    }

    drawDynamicElements(ctx) {
        for (const el of this.dynamicElements) {
            if (typeof this[el.drawMethod] === 'function') {
                this[el.drawMethod](ctx, el);
            }
        }
    }

    addDynamicElement(drawMethod, params = {}) {
        const id = Date.now() + Math.random();
        this.dynamicElements.push({ id, drawMethod, ...params });
        return id;
    }

    removeDynamicElement(id) {
        this.dynamicElements = this.dynamicElements.filter(e => e.id !== id);
    }

    drawEasterEggs(ctx) {
        if (this.easterEggs.mouseActive) {
            this.drawMouseEasterEgg(ctx);
        }
        if (this.easterEggs.rainbowActive) {
            this.drawRainbow(ctx);
        }
        if (this.easterEggs.comboActive) {
            this.drawComboSparkles(ctx);
        }
    }

    mouseEasterEgg(active) {
        this.easterEggs.mouseActive = active;
    }

    rainbowEasterEgg(active) {
        this.easterEggs.rainbowActive = active;
    }

    drawMouseEasterEgg(ctx) {
        const x = 48, y = 150;
        const bobY = Math.sin(this.animFrame * 0.15) * 2;
        ctx.fillStyle = PIXEL_PALETTE.brown;
        ctx.fillRect(x, y + bobY, 6, 4);
        ctx.fillRect(x - 2, y + 2 + bobY, 10, 2);
        ctx.fillStyle = PIXEL_PALETTE.pink;
        ctx.fillRect(x, y - 2 + bobY, 4, 2);
        ctx.fillRect(x + 6, y - 1 + bobY, 2, 2);
        ctx.fillStyle = PIXEL_PALETTE.white;
        ctx.fillRect(x + 5, y + bobY, 1, 1);
        ctx.fillStyle = PIXEL_PALETTE.black;
        ctx.fillRect(x + 1, y + 1 + bobY, 1, 1);
    }

    drawRainbow(ctx) {
        const colors = ['#f0a8a8','#f7d794','#a8d8b9','#7ec8e3','#c9b1ff'];
        for (let i = 0; i < colors.length; i++) {
            ctx.fillStyle = colors[i];
            ctx.globalAlpha = 0.3;
            ctx.fillRect(20 + i * 6, 10, 6, 3);
        }
        ctx.globalAlpha = 1;
    }

    drawComboSparkles(ctx) {
        const count = 6 + (this.animFrame % 3);
        for (let i = 0; i < count; i++) {
            const x = 40 + (this.animFrame * 3 + i * 47) % 240;
            const y = 20 + (this.animFrame * 7 + i * 31) % 120;
            const size = 2 + (this.animFrame + i) % 2;
            ctx.fillStyle = PIXEL_PALETTE.yellow;
            ctx.globalAlpha = 0.5 + Math.sin(this.animFrame * 0.3 + i) * 0.2;
            ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1;
    }

    drawRect(ctx, x, y, w, h, color) {
        ctx.fillStyle = color || PIXEL_PALETTE.midBeige;
        ctx.fillRect(x, y, w, h);
    }

    drawPixelChar(ctx, x, y, color, isSlacking = false) {
        const c = color || PIXEL_PALETTE.black;
        const bobY = Math.sin(this.animFrame * 0.1) * (isSlacking ? 0 : 1);
        const sagY = isSlacking ? 2 : 0;
        ctx.fillStyle = c;
        ctx.fillRect(x + 2, y - 6 + bobY - sagY, 4, 4);
        ctx.fillRect(x + 1, y - 2 + bobY - sagY, 6, 6);
        ctx.fillRect(x, y + 4 + bobY - sagY, 3, 9);
        ctx.fillRect(x + 5, y + 4 + bobY - sagY, 3, 9);
        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.fillRect(x + 2, y - 5 + bobY - sagY, 2, 2);
    }

    drawPixelPlant(ctx, x, y, tall = true) {
        ctx.fillStyle = PIXEL_PALETTE.brown;
        ctx.fillRect(x + 2, y + (tall ? 8 : 4), 6, 4);
        ctx.fillStyle = PIXEL_PALETTE.mint;
        const sway = Math.sin(this.animFrame * 0.08) * (tall ? 1 : 0);
        ctx.fillRect(x + 1 + sway, y + (tall ? 2 : 0), 4, tall ? 8 : 6);
        ctx.fillRect(x + 3 + sway, y + (tall ? 0 : -1), 2, 4);
    }

    drawPixelWindow(ctx, x, y, w, h, showSky = true) {
        ctx.fillStyle = PIXEL_PALETTE.white;
        ctx.fillRect(x, y, w, h);
        if (showSky) {
            const skyColor = this.currentTimePart === 'evening' ? '#2c3e50' : PIXEL_PALETTE.skyBlue;
            ctx.fillStyle = skyColor;
            ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
            if (this.currentTimePart === 'morning') {
                ctx.fillStyle = PIXEL_PALETTE.yellow;
                ctx.fillRect(x + w - 14, y + 4, 8, 8);
            } else if (this.currentTimePart === 'evening') {
                ctx.fillStyle = 'rgba(255,200,100,0.15)';
                ctx.fillRect(x + w - 16, y + 4, 12, 12);
            }
            const birdPhase = this.animFrame % 80;
            if (birdPhase < 60) {
                ctx.fillStyle = PIXEL_PALETTE.black;
                const bx = x + 10 + birdPhase * 0.5;
                const by = y + 8 + Math.sin(birdPhase * 0.05) * 3;
                ctx.fillRect(bx, by, 4, 1);
                ctx.fillRect(bx - 2, by - 1, 2, 1);
                ctx.fillRect(bx + 4, by - 1, 2, 1);
            }
        }
        ctx.fillStyle = PIXEL_PALETTE.midBeige;
        ctx.fillRect(x + w / 2 - 1, y + 2, 2, h - 4);
        ctx.fillRect(x + 2, y + h / 2 - 1, w - 4, 2);
    }

    drawPixelClock(ctx, x, y) {
        ctx.fillStyle = PIXEL_PALETTE.black;
        ctx.fillRect(x, y, 10, 10);
        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.fillRect(x + 1, y + 1, 8, 8);
        const angle = (this.animFrame % 60) * (Math.PI * 2 / 60);
        ctx.fillStyle = PIXEL_PALETTE.black;
        ctx.fillRect(x + 4, y + 4, 1, 1);
        ctx.fillRect(x + 4 + Math.cos(angle) * 3, y + 4 + Math.sin(angle) * 3, 1, 1);
    }

    drawOffice(ctx) {
        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.fillRect(0, 0, PIXEL_W, PIXEL_H);
        ctx.fillStyle = PIXEL_PALETTE.lightBeige;
        ctx.fillRect(0, 0, PIXEL_W, 2);
        ctx.fillRect(0, PIXEL_H - 2, PIXEL_W, 2);

        this.drawPixelWindow(ctx, 4, 8, 60, 48);
        ctx.fillStyle = PIXEL_PALETTE.midBeige;
        ctx.fillRect(0, 68, 68, 4);
        ctx.fillRect(0, 120, 68, 4);

        ctx.fillStyle = PIXEL_PALETTE.midBeige;
        ctx.fillRect(80, 45, 100, 55);
        ctx.fillRect(78, 43, 104, 4);
        ctx.fillRect(78, 95, 104, 4);
        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(90, 50, 36, 30);
        ctx.fillRect(130, 50, 36, 30);
        const screenFlicker = this.animFrame % 4 === 0 ? 0.8 : 1;
        ctx.globalAlpha = screenFlicker;
        ctx.fillStyle = PIXEL_PALETTE.skyBlue;
        ctx.fillRect(92, 52, 32, 26);
        ctx.fillRect(132, 52, 32, 26);
        ctx.globalAlpha = 1;
        const textShift = this.animFrame % 40;
        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(96 + textShift * 0.1, 58, 12, 2);
        ctx.fillRect(100, 62, 16, 2);
        ctx.fillRect(98, 66, 8, 2);
        ctx.fillRect(98, 74, 20, 2);
        ctx.fillRect(96, 78, 8, 2);
        ctx.fillStyle = PIXEL_PALETTE.midBeige;
        ctx.fillRect(90, 80, 100, 3);

        ctx.fillStyle = PIXEL_PALETTE.mint;
        ctx.fillRect(135, 82, 30, 6);
        ctx.fillRect(140, 82, 2, 3);

        this.drawPixelPlant(ctx, 188, 30);
        this.drawPixelClock(ctx, 210, 50);
        this.drawPixelChar(ctx, 110, 150, PIXEL_PALETTE.darkBrown);
        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.fillRect(105, 152, 5, 3);
        this.drawPixelChar(ctx, 160, 150, PIXEL_PALETTE.brown);
    }

    drawMeeting(ctx) {
        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.fillRect(0, 0, PIXEL_W, PIXEL_H);
        ctx.fillStyle = PIXEL_PALETTE.lightBeige;
        ctx.fillRect(0, 0, PIXEL_W, 2);

        this.drawPixelWindow(ctx, 200, 8, 80, 48);

        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(160, 75, 120, 4);
        ctx.fillRect(80, 75, 80, 4);

        ctx.fillStyle = PIXEL_PALETTE.midBeige;
        ctx.fillRect(72, 30, 8, 50);
        ctx.fillRect(72, 85, 8, 60);

        ctx.fillStyle = PIXEL_PALETTE.white;
        const slideW = Math.sin(this.animFrame * 0.02) * 5 + 50;
        ctx.fillRect(90, 40, slideW, 30);
        ctx.fillText('📊', 100, 55);

        ctx.fillStyle = PIXEL_PALETTE.midBeige;
        ctx.fillRect(48, 90, 8, 8);
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(52, 98, 4, 3);
        }

        const chairColors = [PIXEL_PALETTE.darkBrown, PIXEL_PALETTE.brown, PIXEL_PALETTE.pink, PIXEL_PALETTE.mint, PIXEL_PALETTE.black, PIXEL_PALETTE.lavender];
        for (let i = 0; i < 6; i++) {
            const cx = 60 + i * 38;
            this.drawPixelChar(ctx, cx, 155, chairColors[i % chairColors.length]);
        }

        this.drawPixelClock(ctx, 5, 5);
        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(5, 168, 48, 16);
        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.fillRect(9, 172, 40, 8);
    }

    drawCafeteria(ctx) {
        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.fillRect(0, 0, PIXEL_W, PIXEL_H);
        ctx.fillStyle = PIXEL_PALETTE.lightBeige;

        ctx.fillStyle = PIXEL_PALETTE.midBeige;
        ctx.fillRect(0, 30, PIXEL_W, 50);
        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(0, 28, PIXEL_W, 4);

        ctx.fillStyle = PIXEL_PALETTE.orange;
        ctx.fillRect(20, 36, 40, 36);
        ctx.fillRect(70, 36, 40, 36);
        ctx.fillRect(120, 36, 40, 36);
        ctx.fillRect(170, 36, 40, 36);

        const steamOffset = this.animFrame % 30;
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = PIXEL_PALETTE.white;
            ctx.globalAlpha = 0.3;
            const sx = 40 + i * 50;
            ctx.fillRect(sx, 30 - (steamOffset + i * 5) % 12, 4, 6);
        }
        ctx.globalAlpha = 1;

        for (let i = 0; i < 8; i++) {
            const tx = 8 + i * 38;
            ctx.fillStyle = PIXEL_PALETTE.darkBrown;
            ctx.fillRect(tx, 85, 30, 20);
            ctx.fillRect(tx + 1, 82, 28, 3);
            ctx.fillStyle = PIXEL_PALETTE.brown;
            ctx.fillRect(tx + 2, 88, 26, 14);
            ctx.fillStyle = PIXEL_PALETTE.black;
            ctx.fillRect(tx + 28, 90, 2, 10);
        }

        for (let i = 0; i < 4; i++) {
            this.drawPixelChar(ctx, 20 + i * 72, 160, (i % 2 === 0) ? PIXEL_PALETTE.darkBrown : PIXEL_PALETTE.brown);
        }

        ctx.fillStyle = PIXEL_PALETTE.lightBeige;
        ctx.fillRect(0, 180, PIXEL_W, 12);
    }

    drawCorridor(ctx) {
        ctx.fillStyle = PIXEL_PALETTE.lightBeige;
        ctx.fillRect(0, 0, PIXEL_W, PIXEL_H);

        for (let i = 0; i < 5; i++) {
            const dx = 10 + i * 64;
            ctx.fillStyle = PIXEL_PALETTE.midBeige;
            ctx.fillRect(dx, 30, 50, 110);
            ctx.fillStyle = PIXEL_PALETTE.darkBrown;
            ctx.fillRect(dx + 10, 35, 30, 60);
            ctx.fillStyle = PIXEL_PALETTE.cream;
            ctx.fillRect(dx + 12, 37, 26, 56);
        }

        ctx.fillStyle = PIXEL_PALETTE.brown;
        ctx.fillRect(0, 140, PIXEL_W, 10);

        const plantOffset = Math.sin(this.animFrame * 0.06) * 1;
        this.drawPixelPlant(ctx, 150 + plantOffset, 115, false);

        ctx.fillStyle = PIXEL_PALETTE.skyBlue;
        ctx.fillRect(280, 40, 30, 70);
        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.fillRect(282, 42, 26, 66);
        ctx.fillStyle = PIXEL_PALETTE.skyBlue;
        const bubblePhase = this.animFrame % 40;
        ctx.fillRect(286, 50 + bubblePhase * 0.3, 2, 2);
        ctx.fillRect(290, 55 + bubblePhase * 0.2, 2, 2);

        this.drawPixelChar(ctx, 60, 148, PIXEL_PALETTE.darkBrown);
        this.drawPixelChar(ctx, 180, 148, PIXEL_PALETTE.brown);
        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.fillRect(170, 145, 8, 3);
        ctx.fillRect(55, 140, 12, 2);
    }

    drawLeaderOffice(ctx) {
        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.fillRect(0, 0, PIXEL_W, PIXEL_H);
        ctx.fillStyle = PIXEL_PALETTE.lightBeige;
        ctx.fillRect(0, 0, PIXEL_W, 4);

        this.drawPixelWindow(ctx, 180, 6, 120, 60);

        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(100, 80, 120, 60);
        ctx.fillRect(97, 76, 126, 6);
        ctx.fillStyle = PIXEL_PALETTE.midBeige;
        ctx.fillRect(100, 86, 120, 48);

        ctx.fillStyle = PIXEL_PALETTE.brown;
        ctx.fillRect(105, 90, 30, 20);
        ctx.fillRect(140, 90, 30, 20);

        ctx.fillStyle = PIXEL_PALETTE.mint;
        ctx.fillRect(20, 100, 40, 40);
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = PIXEL_PALETTE.brown;
            ctx.fillRect(28 + i * 12, 110, 8, 10);
        }

        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(250, 60, 50, 80);
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = ['#f0a8a8','#f7d794','#a8d8b9','#7ec8e3','#c9b1ff'][i % 5];
            ctx.fillRect(254, 64 + i * 14, 42, 10);
        }

        this.drawPixelPlant(ctx, 250, 130, true);
        this.drawPixelClock(ctx, 4, 150);

        const teaSteam = this.animFrame % 20;
        ctx.fillStyle = PIXEL_PALETTE.white;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(84, 72 - teaSteam * 0.2, 4, 6);
        ctx.globalAlpha = 1;

        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(80, 80, 20, 16);
    }

    drawRestArea(ctx) {
        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.fillRect(0, 0, PIXEL_W, PIXEL_H);

        ctx.fillStyle = PIXEL_PALETTE.midBeige;
        ctx.fillRect(40, 30, 80, 70);
        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(38, 28, 84, 4);
        ctx.fillRect(100, 50, 4, 20);
        ctx.fillRect(38, 90, 84, 4);

        ctx.fillStyle = PIXEL_PALETTE.midBeige;
        ctx.fillRect(160, 40, 60, 60);
        ctx.fillRect(158, 38, 64, 4);
        ctx.fillStyle = PIXEL_PALETTE.brown;
        ctx.fillRect(165, 50, 8, 12);
        ctx.fillRect(170, 44, 40, 40);
        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.fillRect(174, 48, 32, 32);
        const microSteam = this.animFrame % 25;
        ctx.fillStyle = PIXEL_PALETTE.white;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(190, 40 - microSteam * 0.2, 6, 8);
        ctx.globalAlpha = 1;

        ctx.fillStyle = PIXEL_PALETTE.orange;
        ctx.fillRect(230, 50, 30, 50);
        ctx.fillStyle = PIXEL_PALETTE.pink;
        ctx.fillRect(240, 60, 10, 10);
        ctx.fillRect(240, 75, 10, 10);

        ctx.fillStyle = PIXEL_PALETTE.mint;
        ctx.fillRect(10, 20, 20, 50);
        this.drawPixelPlant(ctx, 14, 22, false);

        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(0, 140, PIXEL_W, 4);
        this.drawPixelChar(ctx, 80, 160, PIXEL_PALETTE.darkBrown, true);
        this.drawPixelChar(ctx, 180, 160, PIXEL_PALETTE.brown, true);

        ctx.fillStyle = PIXEL_PALETTE.lightBeige;
        ctx.fillRect(0, 180, PIXEL_W, 12);
    }

    drawEntrance(ctx) {
        ctx.fillStyle = PIXEL_PALETTE.skyBlue;
        ctx.fillRect(0, 0, PIXEL_W, PIXEL_H);

        ctx.fillStyle = PIXEL_PALETTE.mint;
        ctx.fillRect(0, 120, PIXEL_W, 40);
        ctx.fillStyle = PIXEL_PALETTE.midBeige;
        ctx.fillRect(40, 50, 180, 70);
        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(38, 48, 184, 6);
        ctx.fillRect(38, 110, 184, 6);

        ctx.fillStyle = PIXEL_PALETTE.brown;
        ctx.fillRect(58, 56, 144, 52);
        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.fillRect(60, 58, 140, 48);

        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(180, 40, 24, 50);

        ctx.fillStyle = PIXEL_PALETTE.black;
        ctx.fillRect(260, 30, 30, 60);
        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(258, 28, 34, 4);
        const signText = '单 位 大 门';
        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.font = '8px monospace';
        ctx.fillText(signText, 220, 120);

        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(120, 130, 8, 12);
        ctx.fillRect(110, 132, 28, 4);
        ctx.fillStyle = PIXEL_PALETTE.white;
        ctx.fillRect(122, 132, 4, 4);

        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = PIXEL_PALETTE.darkBrown;
            ctx.fillRect(10 + i * 62, 155, 8, 8);
        }

        this.drawPixelChar(ctx, 70, 145, PIXEL_PALETTE.darkBrown);
        this.drawPixelChar(ctx, 200, 145, PIXEL_PALETTE.brown);

        ctx.fillStyle = PIXEL_PALETTE.cream;
        ctx.fillRect(0, 160, PIXEL_W, 32);
    }

    drawRooftop(ctx) {
        ctx.fillStyle = PIXEL_PALETTE.skyBlue;
        ctx.fillRect(0, 0, PIXEL_W, PIXEL_H);

        const sunAngle = this.animFrame * 0.01;
        const sx = 160 + Math.cos(sunAngle) * 100;
        const sy = 100 + Math.sin(sunAngle) * 60;
        ctx.fillStyle = PIXEL_PALETTE.yellow;
        ctx.fillRect(sx - 6, sy - 6, 12, 12);

        ctx.fillStyle = PIXEL_PALETTE.white;
        ctx.globalAlpha = 0.2;
        for (let i = 0; i < 4; i++) {
            const cx = 30 + (this.animFrame * 2 + i * 80) % PIXEL_W;
            const cy = 20 + (this.animFrame + i * 30) % 60;
            ctx.fillRect(cx, cy, 20, 8);
            ctx.fillRect(cx + 4, cy - 3, 12, 3);
        }
        ctx.globalAlpha = 1;

        ctx.fillStyle = PIXEL_PALETTE.midBeige;
        ctx.fillRect(0, 130, PIXEL_W, 62);
        ctx.fillStyle = PIXEL_PALETTE.lightBeige;
        ctx.fillRect(0, 130, PIXEL_W, 4);

        ctx.fillStyle = PIXEL_PALETTE.darkBrown;
        ctx.fillRect(0, 130, 8, 62);
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = PIXEL_PALETTE.brown;
            ctx.fillRect(8, 132 + i * 6, 2, 4);
        }

        this.drawPixelPlant(ctx, 30, 155, false);
        this.drawPixelPlant(ctx, 270, 155, false);

        ctx.fillStyle = PIXEL_PALETTE.white;
        ctx.fillStyle = PIXEL_PALETTE.brown;
        ctx.fillRect(150, 150, 8, 8);
        ctx.fillRect(148, 155, 12, 4);

        this.drawPixelChar(ctx, 120, 160, PIXEL_PALETTE.darkBrown, true);
        this.drawPixelChar(ctx, 200, 160, PIXEL_PALETTE.brown, true);

        const cloudOffset = (this.animFrame * 0.5) % (PIXEL_W + 40) - 40;
        ctx.fillStyle = PIXEL_PALETTE.white;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(cloudOffset, 12, 28, 8);
        ctx.fillRect(cloudOffset + 6, 6, 16, 6);
        ctx.fillRect(cloudOffset + 40, 28, 20, 6);
        ctx.fillRect(cloudOffset + 44, 24, 12, 4);
        ctx.globalAlpha = 1;

        ctx.fillStyle = PIXEL_PALETTE.lightBeige;
        ctx.fillRect(0, 185, PIXEL_W, 7);
    }

    drawZzzEffect(ctx, x, y, active = true) {
        if (!active) return;
        const phase = this.animFrame % 30;
        const opacity = 1 - phase / 30;
        ctx.globalAlpha = opacity * 0.5;
        ctx.fillStyle = PIXEL_PALETTE.mint;
        ctx.font = '8px monospace';
        ctx.fillText('Z', x - phase * 0.5, y - phase * 0.8);
        ctx.fillText('z', x + 6 - phase * 0.3, y - 6 - phase * 0.6);
        ctx.fillText('z', x + 12 - phase * 0.2, y - 12 - phase * 0.4);
        ctx.globalAlpha = 1;
    }

    drawConfettiEffect(ctx) {
        const colors = ['#f0a8a8','#f7d794','#a8d8b9','#7ec8e3','#c9b1ff'];
        const count = 12;
        for (let i = 0; i < count; i++) {
            const x = (this.animFrame * 5 + i * 27) % PIXEL_W;
            const y = (this.animFrame * 3 + i * 13 + PIXEL_H * 0.3) % PIXEL_H;
            const size = 2 + i % 3;
            ctx.fillStyle = colors[i % colors.length];
            ctx.globalAlpha = 0.6;
            ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1;
    }

    drawSparkleEffect(ctx, cx, cy) {
        const colors = ['#f7d794','#ffffff','#f0a8a8'];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + this.animFrame * 0.05;
            const dist = 4 + Math.sin(this.animFrame * 0.1 + i) * 3;
            const x = cx + Math.cos(angle) * dist;
            const y = cy + Math.sin(angle) * dist;
            ctx.fillStyle = colors[i % colors.length];
            ctx.globalAlpha = 0.5 + Math.sin(this.animFrame * 0.2 + i) * 0.2;
            ctx.fillRect(x - 1, y - 1, 2, 2);
        }
        ctx.globalAlpha = 1;
    }

    drawSadEffect(ctx, x, y) {
        const dropPhase = this.animFrame % 20;
        ctx.fillStyle = '#7ec8e3';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x - 2 + dropPhase * 0.1, y + dropPhase * 0.3, 1, 3);
        ctx.fillRect(x + 4 + dropPhase * 0.05, y + 3 + dropPhase * 0.2, 1, 2);
        ctx.globalAlpha = 1;
    }

    drawAngryEffect(ctx, x, y) {
        const shake = this.animFrame % 3;
        ctx.fillStyle = '#f0a8a8';
        ctx.globalAlpha = 0.4;
        ctx.fillRect(x - 1 + shake, y, 3, 3);
        ctx.fillRect(x + 4 - shake, y - 2, 3, 3);
        ctx.globalAlpha = 1;
    }
}

const pixelSceneRenderer = new PixelSceneRenderer();
window.pixelSceneRenderer = pixelSceneRenderer;

(function injectPixelStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #pixel-scene-canvas {
            transition: opacity 0.5s ease;
        }
        #pixel-scene-canvas.fade-in {
            opacity: 1;
        }
        #pixel-scene-canvas.fade-out {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);
})();