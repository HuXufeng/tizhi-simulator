const SCENE_CARD_STYLES = {
    emergency: {
        icon: '⚡',
        borderColor: '#f0a8a8',
        bgGradient: 'linear-gradient(135deg, rgba(240,168,168,0.15), rgba(255,71,87,0.08))',
        accentColor: '#f0a8a8',
        pixelPattern: '🔴',
        label: '紧急'
    },
    opportunity: {
        icon: '🌟',
        borderColor: '#f7d794',
        bgGradient: 'linear-gradient(135deg, rgba(247,215,148,0.15), rgba(255,165,2,0.08))',
        accentColor: '#f7d794',
        pixelPattern: '⭐',
        label: '机遇'
    },
    daily: {
        icon: '📋',
        borderColor: '#7ec8e3',
        bgGradient: 'linear-gradient(135deg, rgba(126,200,227,0.15), rgba(55,66,250,0.08))',
        accentColor: '#7ec8e3',
        pixelPattern: '📄',
        label: '日常'
    },
    personal: {
        icon: '💚',
        borderColor: '#a8d8b9',
        bgGradient: 'linear-gradient(135deg, rgba(168,216,185,0.15), rgba(46,213,115,0.08))',
        accentColor: '#a8d8b9',
        pixelPattern: '🌿',
        label: '个人'
    },
    hidden: {
        icon: '❓',
        borderColor: '#c9b1ff',
        bgGradient: 'linear-gradient(135deg, rgba(201,177,255,0.15), rgba(165,94,234,0.08))',
        accentColor: '#c9b1ff',
        pixelPattern: '✨',
        label: '隐藏'
    },
    mischievous: {
        icon: '😏',
        borderColor: '#f5a0a0',
        bgGradient: 'linear-gradient(135deg, rgba(245,160,160,0.15), rgba(255,71,87,0.08))',
        accentColor: '#f5a0a0',
        pixelPattern: '😏',
        label: '摸鱼'
    }
};

class SceneCardRenderer {
    constructor() {
        this.currentCard = null;
        this.isAnimating = false;
        this.cardQueue = [];
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        eventBus.on('event:triggered', (event) => {
            const category = this._getCategoryForEvent(event);
            this.showCard(event, category);
        });
        eventBus.on('event:resolved', (data) => {
            this.showResultAnimation(data.result);
        });
        eventBus.on('combo:update', (data) => {
            this.showComboEffect(data.count);
        });
        eventBus.on('slack:success', () => {
            this.showSlackCard('success');
        });
        eventBus.on('slack:fail', () => {
            this.showSlackCard('fail');
        });
    }

    _getCategoryForEvent(event) {
        const emergencyEvents = ['fire_inspection', 'urgent_report', 'inspection_visit', 'hygiene_inspection',
                              'urgent_material', 'petition_visit', 'public_opinion', 'public_opinion_crisis'];
        const opportunityEvents = ['training_notice', 'promotion_opportunity', 'media_interview',
                                'party_activist', 'team_building', 'secretary_vacancy', 'excellence_award'];
        const slackEvents = ['slack_opportunity', 'gossip_spread', 'afternoon_tea'];
        const personalEvents = ['colleague_help', 'lunch_break', 'overtime_notice'];
        
        if (emergencyEvents.includes(event.id)) return 'emergency';
        if (opportunityEvents.includes(event.id)) return 'opportunity';
        if (slackEvents.includes(event.id)) return 'mischievous';
        if (personalEvents.includes(event.id)) return 'personal';
        if (event.rarity === 'hidden' || event.isHidden) return 'hidden';
        return 'daily';
    }

    showCard(event, category) {
        if (this.isAnimating) {
            this.cardQueue.push({ event, category });
            return;
        }

        this.isAnimating = true;
        const style = SCENE_CARD_STYLES[category] || SCENE_CARD_STYLES.daily;

        const cardContainer = document.createElement('div');
        cardContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 150;
            pointer-events: none;
            width: 300px;
            max-width: 85vw;
        `;

        const pixelBlocks = [];
        const rows = 8, cols = 8;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const block = document.createElement('div');
                block.style.cssText = `
                    position: absolute;
                    width: ${100/cols}%;
                    height: ${100/rows}%;
                    top: ${r * 100/rows}%;
                    left: ${c * 100/cols}%;
                    background: ${style.bgGradient};
                    border: 1px solid ${style.borderColor}44;
                    opacity: 0;
                    transform: scale(0.5);
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    transition-delay: ${(r * cols + c) * 20}ms;
                `;
                cardContainer.appendChild(block);
                pixelBlocks.push(block);
            }
        }

        const cardContent = document.createElement('div');
        cardContent.style.cssText = `
            position: relative;
            padding: 20px;
            border-radius: 0;
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            transition-delay: 0.6s;
        `;

        const iconEl = style.icon === '😏' ? '🐱' : style.icon;
        cardContent.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 8px;">${iconEl}</div>
            <div style="
                display: inline-block;
                padding: 2px 10px;
                font-size: 9px;
                background: ${style.borderColor}22;
                border: 1px solid ${style.borderColor}55;
                color: ${style.accentColor};
                margin-bottom: 8px;
                letter-spacing: 2px;
            ">${style.label}</div>
            <div style="
                font-size: 14px;
                font-weight: bold;
                color: var(--text-primary);
                margin-bottom: 8px;
                line-height: 1.4;
            ">${event.name || ''}</div>
            <div style="
                font-size: 11px;
                color: var(--text-secondary);
                line-height: 1.6;
            ">${event.description || ''}</div>
        `;

        cardContainer.appendChild(cardContent);
        document.body.appendChild(cardContainer);

        pixelBlocks.forEach((block, i) => {
            setTimeout(() => {
                block.style.opacity = '1';
                block.style.transform = 'scale(1)';
            }, i * 20);
        });

        setTimeout(() => {
            cardContent.style.opacity = '1';
        }, 500);

        this.currentCard = {
            container: cardContainer,
            blocks: pixelBlocks,
            content: cardContent,
            timeout: setTimeout(() => {
                this.hideCard();
            }, 3000)
        };
    }

    hideCard() {
        if (!this.currentCard) {
            this._processQueue();
            return;
        }

        const { container, blocks, content } = this.currentCard;
        content.style.opacity = '0';
        content.style.transform = 'translateY(10px)';

        blocks.forEach((block, i) => {
            setTimeout(() => {
                block.style.opacity = '0';
                block.style.transform = 'scale(0.3)';
            }, i * 15);
        });

        setTimeout(() => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
            this.currentCard = null;
            this.isAnimating = false;
            this._processQueue();
        }, 600);
    }

    _processQueue() {
        if (this.cardQueue.length > 0) {
            const next = this.cardQueue.shift();
            this.showCard(next.event, next.category);
        }
    }

    showResultAnimation(result) {
        const isSuccess = result && (result.outcome === 'success' || result.performance >= 1);
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 151;
            pointer-events: none;
            font-size: 48px;
            animation: resultPop 1s ease-out forwards;
        `;
        container.textContent = isSuccess ? '✅' : '❌';

        const style = document.createElement('style');
        style.textContent = `
            @keyframes resultPop {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                30% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
                60% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -70%) scale(1); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(container);

        setTimeout(() => {
            if (container.parentNode) container.parentNode.removeChild(container);
            if (style.parentNode) style.parentNode.removeChild(style);
        }, 1000);
    }

    showComboEffect(count) {
        if (count < 2) return;
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 40%;
            right: 20px;
            z-index: 150;
            pointer-events: none;
            text-align: center;
        `;

        const fireCount = Math.min(Math.floor(count / 2), 3);
        const fireEmojis = ['🔥', '🔥🔥', '🔥🔥🔥', '🔥🔥🔥🔥'];
        const comboScale = 0.8 + count * 0.05;

        container.innerHTML = `
            <div style="
                font-size: ${14 + count * 1.5}px;
                font-weight: bold;
                color: #f7d794;
                text-shadow: 0 0 10px rgba(247,215,148,0.5);
                transform: scale(${comboScale});
                animation: comboSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            ">
                ${fireEmojis[fireCount] || '🔥🔥🔥🔥'}
                <div style="margin-top:2px;">✕${count}</div>
                <div style="font-size:9px;color:var(--text-secondary);margin-top:2px;">连击</div>
            </div>
        `;

        document.body.appendChild(container);

        const slideStyle = document.createElement('style');
        slideStyle.textContent = `
            @keyframes comboSlideIn {
                0% { transform: translateX(50px) scale(0.5); opacity: 0; }
                100% { transform: translateX(0) scale(${comboScale}); opacity: 1; }
            }
        `;
        document.head.appendChild(slideStyle);

        setTimeout(() => {
            if (container.parentNode) container.parentNode.removeChild(container);
            if (slideStyle.parentNode) slideStyle.parentNode.removeChild(slideStyle);
        }, 2000);
    }

    showSlackCard(type) {
        const icon = type === 'success' ? '😏🐟' : '😳';
        const text = type === 'success' ? '摸鱼成功！' : '被抓包了！';
        const color = type === 'success' ? '#a8d8b9' : '#f0a8a8';

        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 35%;
            left: 50%;
            transform: translateX(-50%);
            z-index: 150;
            pointer-events: none;
            text-align: center;
            animation: slackPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;

        container.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 4px;">${icon}</div>
            <div style="
                display: inline-block;
                padding: 4px 16px;
                font-size: 13px;
                font-weight: bold;
                color: ${color};
                background: ${color}15;
                border: 2px solid ${color}44;
            ">${text}</div>
        `;

        document.body.appendChild(container);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slackPop {
                0% { transform: translateX(-50%) scale(0); opacity: 0; }
                60% { transform: translateX(-50%) scale(1.15); }
                100% { transform: translateX(-50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            container.style.transition = 'all 0.3s ease';
            container.style.opacity = '0';
            container.style.transform = 'translateX(-50%) scale(0.5)';
            setTimeout(() => {
                if (container.parentNode) container.parentNode.removeChild(container);
                if (style.parentNode) style.parentNode.removeChild(style);
            }, 300);
        }, 1500);
    }
}

const sceneCardRenderer = new SceneCardRenderer();
window.sceneCardRenderer = sceneCardRenderer;

(function autoInit() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => sceneCardRenderer.init());
    } else {
        sceneCardRenderer.init();
    }
})();