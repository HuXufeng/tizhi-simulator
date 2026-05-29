const CHAR_SPRITES = {
    laozhang: {
        emoji: '👴',
        accessory: '🧣☕',
        name: '老张',
        color: '#d4c5b0',
        accentColor: '#8b7355',
        moodEmojis: { idle: '👴', happy: '😊', angry: '😤', slacking: '😴', thinking: '🤔', surprised: '😲', speaking: '👴💬' },
        poseClass: 'pose-gentle'
    },
    lijie: {
        emoji: '👩',
        accessory: '💃📱',
        name: '李姐',
        color: '#f0a8a8',
        accentColor: '#e8a87c',
        moodEmojis: { idle: '👩', happy: '😄', angry: '😠', slacking: '😏', thinking: '🤔', surprised: '😱', speaking: '👩💬' },
        poseClass: 'pose-dramatic'
    },
    wangzhuren: {
        emoji: '😈',
        accessory: '📋😤',
        name: '王主任',
        color: '#f7d794',
        accentColor: '#e8a87c',
        moodEmojis: { idle: '😈', happy: '😏', angry: '🤬', slacking: '🧐', thinking: '🤨', surprised: '😳', speaking: '😈💬' },
        poseClass: 'pose-intense'
    },
    xiaohong: {
        emoji: '😊',
        accessory: '🌸✨',
        name: '小红',
        color: '#a8d8b9',
        accentColor: '#7ec8e3',
        moodEmojis: { idle: '😊', happy: '🥳', angry: '😤', slacking: '😴', thinking: '🤔', surprised: '😍', speaking: '😊💬' },
        poseClass: 'pose-bouncy'
    },
    laoli: {
        emoji: '🧐',
        accessory: '🍵😏',
        name: '老李',
        color: '#c9b1ff',
        accentColor: '#9b59b6',
        moodEmojis: { idle: '🧐', happy: '😌', angry: '😒', slacking: '😴', thinking: '🤔', surprised: '😮', speaking: '🧐💬' },
        poseClass: 'pose-zen'
    }
};

const NPC_SPRITES = [
    { id: 'colleague_wang', emoji: '🧑‍💻', name: '小王', desc: '程序员', color: '#7ec8e3' },
    { id: 'colleague_chen', emoji: '👩‍💼', name: '小陈', desc: '行政', color: '#f0a8a8' },
    { id: 'colleague_zhao', emoji: '👨‍🔧', name: '老赵', desc: '后勤', color: '#a8d8b9' },
    { id: 'colleague_liu', emoji: '🧑‍🏫', name: '小刘', desc: '新人', color: '#f7d794' },
    { id: 'colleague_mei', emoji: '👩‍🎨', name: '小美', desc: '设计', color: '#c9b1ff' },
    { id: 'colleague_zhou', emoji: '🧑‍🌾', name: '老周', desc: '老油条', color: '#d4c5b0' },
    { id: 'leader_wang', emoji: '🎩', name: '王处长', desc: '领导', color: '#8b7355' },
    { id: 'leader_li', emoji: '👔', name: '李局长', desc: '领导', color: '#5c4a3a' }
];

class CharSpriteRenderer {
    constructor() {
        this.container = null;
        this.currentChar = null;
        this.currentMood = 'idle';
        this.isVisible = false;
        this.moodInterval = null;
        this.hideTimeout = null;
        this._inited = false;
    }

    init() {
        if (this._inited) return;
        this._inited = true;
        
        this.container = document.createElement('div');
        this.container.id = 'char-sprite-container';
        this.container.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            z-index: 5;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        const mainScreen = document.getElementById('main-screen');
        if (mainScreen) {
            mainScreen.appendChild(this.container);
        } else {
            document.body.appendChild(this.container);
            this.container.style.position = 'fixed';
            this.container.style.bottom = '80px';
        }

        this.bindEvents();
        this.hideCharacter();
    }

    bindEvents() {
        eventBus.on('narrator:message', (data) => {
            if (data.narrator && CHAR_SPRITES[data.narrator]) {
                this.showCharacter(data.narrator, 'speaking');
                if (data.mood && CHAR_SPRITES[data.narrator].moodEmojis[data.mood]) {
                    this.showMoodBubble(data.narrator, data.mood);
                }
            }
        });
        eventBus.on('narrator:mood', (data) => {
            if (data.narrator && data.mood) {
                this.showMoodBubble(data.narrator, data.mood);
            }
        });
        eventBus.on('char:highlight', (data) => {
            if (data.id && CHAR_SPRITES[data.id]) {
                this.showCharacter(data.id, data.mood || 'idle', 3000);
            }
        });
        eventBus.on('char:hide', () => this.hideCharacter());
    }

    showCharacter(charId, mood = 'idle', duration = 3000) {
        const sprite = CHAR_SPRITES[charId];
        if (!sprite) return;

        if (!this.container) {
            this.init();
            if (!this.container) return;
        }

        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        this.currentChar = charId;
        this.currentMood = mood;

        if (this.moodInterval) {
            clearInterval(this.moodInterval);
            this.moodInterval = null;
        }

        const moodEmoji = sprite.moodEmojis[mood] || sprite.moodEmojis.idle;
        const animClass = this._getMoodAnimClass(mood);

        this.container.innerHTML = `
            <div class="char-sprite ${animClass}" style="
                text-align: center;
                position: relative;
            ">
                <div class="char-accessory" style="
                    font-size: 14px;
                    margin-bottom: -4px;
                    opacity: 0.7;
                ">${sprite.accessory}</div>
                <div class="char-emoji" style="
                    font-size: 56px;
                    line-height: 1;
                    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
                ">${moodEmoji}</div>
                <div class="char-name" style="
                    font-size: 11px;
                    color: ${sprite.color};
                    margin-top: 4px;
                    font-weight: bold;
                    letter-spacing: 2px;
                    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
                ">${sprite.name}</div>
                <div style="
                    width: 60px;
                    height: 2px;
                    margin: 4px auto 0;
                    background: ${sprite.color};
                    opacity: 0.4;
                "></div>
            </div>
        `;

        this.container.style.opacity = '1';
        this.isVisible = true;

        if (mood === 'speaking') {
            this.moodInterval = setInterval(() => {
                const current = this.container.querySelector('.char-emoji');
                if (current) {
                    const baseEmoji = sprite.moodEmojis.idle;
                    current.textContent = current.textContent === baseEmoji ? sprite.moodEmojis.speaking : baseEmoji;
                }
            }, 600);
        }

        if (duration > 0) {
            this.hideTimeout = setTimeout(() => {
                this.hideCharacter();
            }, duration);
        }
    }

    showMoodBubble(charId, mood) {
        const sprite = CHAR_SPRITES[charId];
        if (!sprite) return;

        const moodEmoji = sprite.moodEmojis[mood] || '🤔';
        const bubble = document.createElement('div');
        bubble.className = 'mood-bubble';
        bubble.textContent = moodEmoji;

        const spriteEl = this.container.querySelector('.char-sprite');
        if (spriteEl) {
            spriteEl.appendChild(bubble);
        } else {
            this.container.appendChild(bubble);
            setTimeout(() => {
                if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
            }, 1500);
        }
    }

    hideCharacter() {
        this.container.style.opacity = '0';
        this.isVisible = false;
        if (this.moodInterval) {
            clearInterval(this.moodInterval);
            this.moodInterval = null;
        }
    }

    showNPC(npcId) {
        const npc = NPC_SPRITES.find(n => n.id === npcId);
        if (!npc) return;

        this.container.innerHTML = `
            <div class="char-sprite pose-gentle" style="
                text-align: center;
                position: relative;
            ">
                <div class="char-emoji" style="
                    font-size: 48px;
                    line-height: 1;
                ">${npc.emoji}</div>
                <div class="char-name" style="
                    font-size: 10px;
                    color: ${npc.color};
                    margin-top: 2px;
                    font-weight: bold;
                ">${npc.name}</div>
                <div style="font-size: 9px; color: var(--text-dim);">${npc.desc}</div>
            </div>
        `;
        this.container.style.opacity = '1';
        this.isVisible = true;
    }

    _getMoodAnimClass(mood) {
        switch (mood) {
            case 'happy': case 'surprised': return 'char-bounce';
            case 'angry': return 'char-shake';
            case 'slacking': return 'char-sway';
            case 'thinking': return 'char-think';
            case 'speaking': case 'idle': default: return 'char-float';
        }
    }
}

const charSpriteRenderer = new CharSpriteRenderer();
window.charSpriteRenderer = charSpriteRenderer;

(function injectCharStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #char-sprite-container {
            user-select: none;
        }

        .char-sprite {
            transition: transform 0.3s ease;
        }

        .char-float {
            animation: charFloat 3s ease-in-out infinite;
        }

        @keyframes charFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }

        .char-bounce {
            animation: charBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes charBounce {
            0% { transform: translateY(0) scale(1); }
            30% { transform: translateY(-16px) scale(1.1); }
            50% { transform: translateY(-8px) scale(1.05); }
            70% { transform: translateY(-12px) scale(1.08); }
            100% { transform: translateY(0) scale(1); }
        }

        .char-shake {
            animation: charShake 0.5s ease-in-out;
        }

        @keyframes charShake {
            0%, 100% { transform: translateX(0); }
            15% { transform: translateX(-6px) rotate(-3deg); }
            30% { transform: translateX(6px) rotate(3deg); }
            45% { transform: translateX(-4px) rotate(-2deg); }
            60% { transform: translateX(4px) rotate(2deg); }
            75% { transform: translateX(-2px); }
        }

        .char-sway {
            animation: charSway 4s ease-in-out infinite;
        }

        @keyframes charSway {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            25% { transform: translateX(-3px) rotate(-2deg); }
            50% { transform: translateX(0) rotate(0deg); }
            75% { transform: translateX(3px) rotate(2deg); }
        }

        .char-think {
            animation: charThink 2s ease-in-out infinite;
        }

        @keyframes charThink {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-4px) rotate(-2deg); }
            75% { transform: translateY(-2px) rotate(2deg); }
        }
    `;
    document.head.appendChild(style);
})();