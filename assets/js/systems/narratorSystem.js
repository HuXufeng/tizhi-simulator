class NarratorSystem {
    constructor() {
        this.narrators = {
            laozhang: {
                id: 'laozhang',
                name: '老张',
                title: '退休老同志',
                personality: '稳扎稳打',
                description: '按部就班，稳中求进。新人的引路人，体制内的老黄牛。',
                icon: '👴',
                avatar: '🧓',
                color: '#7f8c8d',
                accentColor: '#95a5a6',
                bgColor: 'rgba(127, 140, 141, 0.15)',
                borderColor: 'rgba(127, 140, 141, 0.4)',
                eventFrequency: 0.7,
                criticalEventChance: 0.08,
                difficultyMultiplier: 0.8,
                mistakePenalty: 0.8,
                rewardMultiplier: 1.0,
                sameEventCooldown: 21,
                similarTypeCooldown: 14,
                trait: '保守',
                speakingStyle: '温和叮嘱型',
                moodMessages: {
                    positive: ['不错不错', '稳当', '继续努力'],
                    negative: ['没关系', '慢慢来', '别着急']
                },
                greetingTemplates: [
                    '今天又是新的一天，小同志。',
                    '年轻人，来，咱不急。',
                    '我看你今天精神不错嘛。',
                    '记住，稳比快重要。'
                ],
                interventionStyle: 'subtle',
                visualEffect: 'gentle-pulse'
            },
            lijie: {
                id: 'lijie',
                name: '李姐',
                title: '机关老阿姨',
                personality: '跌宕起伏',
                description: '见证了太多大起大落，人生就像过山车，有起有落才精彩。',
                icon: '👩',
                avatar: '💃',
                color: '#3498db',
                accentColor: '#5dade2',
                bgColor: 'rgba(52, 152, 219, 0.15)',
                borderColor: 'rgba(52, 152, 219, 0.4)',
                eventFrequency: 1.0,
                criticalEventChance: 0.15,
                difficultyMultiplier: 1.0,
                mistakePenalty: 1.0,
                rewardMultiplier: 1.0,
                sameEventCooldown: 14,
                similarTypeCooldown: 7,
                trait: '平衡',
                speakingStyle: '戏剧感慨型',
                moodMessages: {
                    positive: ['哟，不错哦', '有戏', '有搞头'],
                    negative: ['哎呦', '这可咋整', '别慌别慌']
                },
                greetingTemplates: [
                    '哟，今天气色不错嘛！',
                    '来来来，让我看看你今天怎么样。',
                    '又来啦？让我给你把把脉。',
                    '嘿，今天有什么新鲜事？'
                ],
                interventionStyle: 'dramatic',
                visualEffect: 'sparkle'
            },
            wangzhuren: {
                id: 'wangzhuren',
                name: '王主任',
                title: '严厉主任',
                personality: '残酷无情',
                description: '高压模式，每一步都如履薄冰。但严师出高徒，熬过去就是蜕变。',
                icon: '😈',
                avatar: '🎭',
                color: '#e74c3c',
                accentColor: '#ec7063',
                bgColor: 'rgba(231, 76, 60, 0.15)',
                borderColor: 'rgba(231, 76, 60, 0.4)',
                eventFrequency: 1.5,
                criticalEventChance: 0.25,
                difficultyMultiplier: 1.3,
                mistakePenalty: 1.5,
                rewardMultiplier: 1.3,
                sameEventCooldown: 7,
                similarTypeCooldown: 3,
                trait: '严苛',
                speakingStyle: '严厉鞭策型',
                moodMessages: {
                    positive: ['哼，还行', '勉强及格', '别得意太早'],
                    negative: ['废物！', '怎么搞的！', '给我反省！']
                },
                greetingTemplates: [
                    '来了？不错，继续保持。',
                    '今天的表现我可是盯着呢。',
                    '别以为我不知道你在想什么。',
                    '准备好了吗？我可不会手软。'
                ],
                interventionStyle: 'intense',
                visualEffect: 'shake'
            },
            xiaohong: {
                id: 'xiaohong',
                name: '小红',
                title: '乐观小妹',
                personality: '阳光向上',
                description: '永远充满希望，相信一切都会好起来的。体制内的一股清流。',
                icon: '😊',
                avatar: '🌸',
                color: '#e91e63',
                accentColor: '#f48fb1',
                bgColor: 'rgba(233, 30, 99, 0.15)',
                borderColor: 'rgba(233, 30, 99, 0.4)',
                eventFrequency: 0.9,
                criticalEventChance: 0.1,
                difficultyMultiplier: 0.9,
                mistakePenalty: 0.9,
                rewardMultiplier: 1.1,
                sameEventCooldown: 16,
                similarTypeCooldown: 10,
                trait: '乐观',
                speakingStyle: '积极鼓励型',
                moodMessages: {
                    positive: ['太棒啦！', '加油加油！', '你能行的！'],
                    negative: ['没关系的！', '振作起来！', '明天会更好！']
                },
                greetingTemplates: [
                    '早呀！今天也要元气满满哦！',
                    '嘿，你来啦！今天感觉怎么样？',
                    '新的一天，新的希望！',
                    '快来快来，今天一定有好事发生！'
                ],
                interventionStyle: 'encouraging',
                visualEffect: 'bounce'
            },
            laoli: {
                id: 'laoli',
                name: '老李',
                title: '摸鱼达人',
                personality: '佛系躺平',
                description: '看透了一切，不争不抢，只想安稳到退休。体制内生存智慧大师。',
                icon: '🧐',
                avatar: '🍵',
                color: '#9b59b6',
                accentColor: '#bb8fce',
                bgColor: 'rgba(155, 89, 182, 0.15)',
                borderColor: 'rgba(155, 89, 182, 0.4)',
                eventFrequency: 0.6,
                criticalEventChance: 0.05,
                difficultyMultiplier: 0.75,
                mistakePenalty: 0.7,
                rewardMultiplier: 0.95,
                sameEventCooldown: 25,
                similarTypeCooldown: 18,
                trait: '佛系',
                speakingStyle: '淡定点拨型',
                moodMessages: {
                    positive: ['嗯，还行', '稳住', '不急'],
                    negative: ['哎，随缘吧', '看开点', '没啥大不了的']
                },
                greetingTemplates: [
                    '来了啊，随便坐。',
                    '今天能摸鱼就摸鱼吧。',
                    '急什么，慢慢来。',
                    '记住，命里有时终须有。'
                ],
                interventionStyle: 'zen',
                visualEffect: 'fade'
            }
        };

        this.currentNarrator = null;
        this.dailyEventCount = 0;
        this.lastEventDay = 0;
        this.lastGreetingDay = 0;
        this.narratorMood = 'neutral';
        this.interventionCooldowns = new Map();
        this.interventionCooldown = 5;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._init());
        } else {
            this._init();
        }
    }

    _init() {
        eventBus.on('narrator:select', (narratorId) => this.selectNarrator(narratorId));
        eventBus.on('game:newGame', () => this.onNewGame());
        eventBus.on('month:changed', (data) => this.onDayChanged(data));
        eventBus.on('phase:changed', () => this.onSlotAdvanced());
        eventBus.on('task:completed', (data) => this.onTaskCompleted(data));
        eventBus.on('task:started', (task) => this.onTaskStarted(task));
        eventBus.on('event:resolved', (data) => this.onEventResolved(data));
        eventBus.on('stat:changed', (data) => this.onStatChanged(data));
        eventBus.on('game:monthStart', () => this.onDayStart());
    }

    selectNarrator(narratorId) {
        if (this.narrators[narratorId]) {
            this.currentNarrator = this.narrators[narratorId];
            gameState.narrator = narratorId;
            this.showNarratorSelectionEffect();
            eventBus.emit('ui:showToast', { 
                text: `🎭 ${this.currentNarrator.icon} 选择了叙述者: ${this.currentNarrator.name}`, 
                type: 'info' 
            });
            setTimeout(() => {
                this.playNarratorGreeting();
                if (gameState.phase === 'intro' || !gameState.phase) {
                    gameState.phase = 'intro';
                    eventBus.emit('game:start');
                }
            }, 800);
        }
    }

    showNarratorSelectionEffect() {
        if (typeof mainUI !== 'undefined' && mainUI.showScreenFlash) {
            const color = this.currentNarrator.color;
            const flash = document.createElement('div');
            flash.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: ${color};
                opacity: 0;
                z-index: 9999;
                pointer-events: none;
                animation: narratorFlash 1s ease-out forwards;
            `;
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 1000);
        }
    }

    playNarratorGreeting() {
        const narrator = this.getCurrentNarrator();
        const templates = narrator.greetingTemplates;
        const greeting = templates[Math.floor(Math.random() * templates.length)];
        
        this.showNarratorMessage(greeting, 'narration');
    }

    getCurrentNarrator() {
        return this.currentNarrator || this.narrators.lijie;
    }

    getConfig() {
        const narrator = this.getCurrentNarrator();
        return {
            eventFrequency: narrator.eventFrequency,
            criticalEventChance: narrator.criticalEventChance,
            difficultyMultiplier: narrator.difficultyMultiplier,
            mistakePenalty: narrator.mistakePenalty,
            rewardMultiplier: narrator.rewardMultiplier,
            sameEventCooldown: narrator.sameEventCooldown,
            similarTypeCooldown: narrator.similarTypeCooldown
        };
    }

    onNewGame() {
        if (!gameState.narrator) {
            this.currentNarrator = this.narrators.lijie;
            gameState.narrator = 'lijie';
        } else {
            this.currentNarrator = this.narrators[gameState.narrator];
        }
        this.dailyEventCount = 0;
        this.lastEventDay = 0;
        this.lastGreetingDay = 0;
    }

    onDayChanged(data) {
        if (!gameState || !gameState.month) return;
        this.dailyEventCount = 0;
        this.checkNarratorIntervention();
    }

    onDayStart() {
        const day = gameState.month;
        if (day > this.lastGreetingDay + 3) {
            this.lastGreetingDay = day;
            if (Math.random() < 0.4) {
                this.playNarratorGreeting();
            }
        }
    }

    onSlotAdvanced() {
        if (this.canIntervene()) {
            this.performInterventions();
        }
    }

    onTaskStarted(task) {
        const narrator = this.getCurrentNarrator();
        
        if (narrator.id === 'wangzhuren' && Math.random() < 0.3) {
            const warnings = [
                '给我认真点，别敷衍了事！',
                '这任务可不能给我搞砸了！',
                '效率！我要的是效率！'
            ];
            this.showNarratorMessage(warnings[Math.floor(Math.random() * warnings.length)], 'warning', true);
        } else if (narrator.id === 'xiaohong' && Math.random() < 0.3) {
            const encouragements = [
                '加油加油！你一定可以的！',
                '相信自己的实力！',
                '冲鸭！你是最棒的！'
            ];
            this.showNarratorMessage(encouragements[Math.floor(Math.random() * encouragements.length)], 'success', true);
        } else if (narrator.id === 'laoli' && Math.random() < 0.2) {
            const zenComments = [
                '差不多就行了，别太拼命。',
                '能摸鱼就摸鱼，着什么急。',
                '干完这票就歇歇吧。'
            ];
            this.showNarratorMessage(zenComments[Math.floor(Math.random() * zenComments.length)], 'narration', true);
        }
    }

    onTaskCompleted(data) {
        const { task, performance } = data;
        const narrator = this.getCurrentNarrator();
        
        if (performance >= 1.1) {
            this.narratorMood = 'positive';
            if (narrator.id === 'wangzhuren') {
                const msgs = ['哼，还行，别骄傲。', '就这一次，别得意。', '勉强合格。'];
                this.showNarratorMessage(msgs[Math.floor(Math.random() * msgs.length)], 'system', true);
            } else if (narrator.id === 'xiaohong') {
                const msgs = ['太棒啦！我就知道你可以的！', '哇，太厉害了吧！', '完美！你就是最靓的仔！'];
                this.showNarratorMessage(msgs[Math.floor(Math.random() * msgs.length)], 'success', true);
            }
        } else if (performance < 0.85) {
            this.narratorMood = 'negative';
            if (narrator.id === 'wangzhuren') {
                const msgs = ['废物！这都做不好？', '给我反省！', '你是怎么做事的？'];
                this.showNarratorMessage(msgs[Math.floor(Math.random() * msgs.length)], 'warning', true);
            } else if (narrator.id === 'laoli') {
                const msgs = ['没事没事，体制内就这样。', '看开点，别往心里去。', '慢慢来，不急。'];
                this.showNarratorMessage(msgs[Math.floor(Math.random() * msgs.length)], 'narration', true);
            }
        }
    }

    onEventResolved(data) {
        const { result } = data;
        const narrator = this.getCurrentNarrator();
        
        if (result.wasRisky) {
            if (narrator.id === 'laozhang') {
                this.showNarratorMessage('以后注意点，别冒这么大的险。', 'narration', true);
            } else if (narrator.id === 'lijie') {
                const msgs = ['哎呦，这可真是大起大落啊！', '瞧瞧你选的，有意思！', '人生嘛，就是这么刺激！'];
                this.showNarratorMessage(msgs[Math.floor(Math.random() * msgs.length)], 'event', true);
            }
        }
    }

    onStatChanged(data) {
        const { stat, value } = data;
        const narrator = this.getCurrentNarrator();
        
        if (stat === 'energy' && value <= 20) {
            if (narrator.id === 'laoli') {
                this.showNarratorMessage('累了吧？该歇就歇。', 'narration', true);
            } else if (narrator.id === 'xiaohong') {
                this.showNarratorMessage('休息一下吧，别把自己累坏了！', 'success', true);
            }
        } else if (stat === 'stress' && value >= 80) {
            if (narrator.id === 'laoli') {
                this.showNarratorMessage('压力太大？体制内都这样，看开点。', 'narration', true);
            } else if (narrator.id === 'wangzhuren') {
                this.showNarratorMessage('就这点压力就受不了？给我顶住！', 'warning', true);
            }
        }
    }

    checkNarratorIntervention() {
        const narrator = this.getCurrentNarrator();
        const month = gameState.month;
        
        const monthlyInterventions = {
            laozhang: {
                dayMod: 30,
                message: '一个月过去了，小同志，继续保持，稳扎稳打。',
                type: 'narration'
            },
            lijie: {
                dayMod: 21,
                message: '哎呀，又过了一段时间了！让我看看你这阵子怎么样……',
                type: 'event'
            },
            wangzhuren: {
                dayMod: 14,
                message: '听好了，这段时间的表现我都看在眼里。给我好好干！',
                type: 'warning'
            },
            xiaohong: {
                dayMod: 15,
                message: '新的一月开始啦！要继续加油哦，相信你一定行的！',
                type: 'success'
            },
            laoli: {
                dayMod: 30,
                message: '又过了一个月啊……日子就是这样一天天过去的，随缘吧。',
                type: 'narration'
            }
        };

        const intervention = monthlyInterventions[narrator.id];
        if (intervention && month % intervention.dayMod === 0) {
            this.showNarratorMessage(intervention.message, intervention.type, true);
            this.triggerVisualEffect();
        }

        if (month % 7 === 0) {
            const weekComments = this.getWeeklyComment();
            if (weekComments) {
                this.showNarratorMessage(weekComments, 'system', true);
            }
        }
    }

    getWeeklyComment() {
        const narrator = this.getCurrentNarrator();
        const rep = gameState.reputation;
        const month = gameState.month;
        
        if (narrator.id === 'laozhang') {
            if (rep > 60) return '声望不错，继续保持。';
            if (rep < 30) return '声望有点低了，要多注意和同事处好关系。';
            return null;
        } else if (narrator.id === 'lijie') {
            if (month > 12) return '时间过得真快啊，转眼就一年了。';
            return '新人的日子总是最难熬的，挺住！';
        } else if (narrator.id === 'wangzhuren') {
            if (rep > 70) return '声望够了？别骄傲，这还不够！';
            if (rep < 40) return '声望太低了！给我想办法提高！';
            return '工作要努力，别整天想着摸鱼！';
        } else if (narrator.id === 'xiaohong') {
            return '这一周也很棒呢！继续保持微笑哦！';
        } else if (narrator.id === 'laoli') {
            return '一周又过去了……差不多就行，别太拼。';
        }
        return null;
    }

    get phaseIndex() {
        const idx = { early: 0, mid: 1, late: 2 };
        return idx[gameState.phase] || 0;
    }

    canIntervene() {
        const cooldownKey = 'lastSlotIntervention';
        const lastIntervention = this.interventionCooldowns.get(cooldownKey) || 0;
        const narrator = this.getCurrentNarrator();
        
        const cooldown = narrator.id === 'wangzhuren' ? 3 : 
                        narrator.id === 'lijie' ? 5 : 
                        narrator.id === 'xiaohong' ? 4 : 8;
        
        if (gameState.month * 3 + this.phaseIndex - lastIntervention < cooldown) {
            return false;
        }
        
        return Math.random() < 0.15;
    }

    performInterventions() {
        const narrator = this.getCurrentNarrator();
        const messages = this.generateContextualMessage();
        
        if (messages && messages.length > 0) {
            const msg = messages[Math.floor(Math.random() * messages.length)];
            this.showNarratorMessage(msg, 'narration', true);
            this.interventionCooldowns.set('lastSlotIntervention', 
                gameState.month * 3 + this.phaseIndex);
        }
    }

    generateContextualMessage() {
        const narrator = this.getCurrentNarrator();
        const messages = [];
        
        if (gameState.energy < 30) {
            if (narrator.id === 'laoli') {
                messages.push('累了就歇歇，别硬撑。');
                messages.push('精力不够了，该摸鱼就摸鱼。');
            } else if (narrator.id === 'xiaohong') {
                messages.push('看起来好累的样子，喝杯水休息一下吧！');
            }
        }
        
        if (gameState.stress > 70) {
            if (narrator.id === 'laoli') {
                messages.push('压力太大？体制内都这样，看开点。');
            } else if (narrator.id === 'wangzhuren') {
                messages.push('压力大？那就对了！舒服是留给退休人员的。');
            }
        }
        
        if (gameState.reputation < 20 && Math.random() < 0.3) {
            if (narrator.id === 'laozhang') {
                messages.push('声望有点低啊，要多和同事搞好关系。');
            } else if (narrator.id === 'wangzhuren') {
                messages.push('声望这么低？你是怎么混的！');
            }
        }
        
        if (gameState.connections > 50 && Math.random() < 0.2) {
            if (narrator.id === 'lijie') {
                messages.push('人脉不错嘛，看来是个会来事的。');
            }
        }
        
        if (messages.length === 0 && Math.random() < 0.3) {
            const genericMessages = {
                laozhang: ['踏踏实实做事就好。', '不急，慢慢来。'],
                lijie: ['今天怎么样啊？', '有什么新鲜事没？'],
                wangzhuren: ['别偷懒！', '给我打起精神来！'],
                xiaohong: ['要开心哦！', '今天也是美好的一天！'],
                laoli: ['嗯……差不多就行。', '哎，体制内就这样。']
            };
            messages.push(...(genericMessages[narrator.id] || []));
        }
        
        return messages;
    }

    showNarratorMessage(text, type = 'narration', withEffect = false) {
        const narrator = this.getCurrentNarrator();
        
        const messageData = {
            text: `${narrator.icon} ${narrator.name}: "${text}"`,
            type: type,
            narrator: narrator.id
        };
        
        eventBus.emit('ui:showMessage', messageData);
        
        if (typeof charSpriteRenderer !== 'undefined' && charSpriteRenderer.showCharacter) {
            const moodMap = {
                'system': 'idle',
                'narration': 'speaking',
                'event': 'thinking',
                'warning': 'angry',
                'success': 'happy'
            };
            const mood = moodMap[type] || 'idle';
            charSpriteRenderer.showCharacter(narrator.id, mood);
            if (withEffect) {
                const moodEmoji = this._getMoodForEffect(narrator.id);
                eventBus.emit('narrator:mood', { narrator: narrator.id, mood: moodEmoji });
            }
        }
        eventBus.emit('narrator:message', { narrator: narrator.id, mood: type, text });

        if (withEffect) {
            this.triggerVisualEffect();
            this.playNarratorSound();
        }
    }

    triggerVisualEffect() {
        const narrator = this.getCurrentNarrator();
        const effect = narrator.visualEffect;
        
        switch (effect) {
            case 'gentle-pulse':
                this.createGentlePulseEffect(narrator.color);
                break;
            case 'sparkle':
                this.createSparkleEffect(narrator.color);
                break;
            case 'shake':
                this.createShakeEffect();
                break;
            case 'bounce':
                this.createBounceEffect();
                break;
            case 'fade':
                this.createFadeEffect(narrator.color);
                break;
        }
        
        if (typeof mainUI !== 'undefined' && mainUI.showScreenFlash) {
            if (narrator.id === 'wangzhuren') {
                mainUI.showScreenFlash('warning');
            } else if (narrator.id === 'xiaohong') {
                mainUI.showScreenFlash('success');
            }
        }
    }

    createGentlePulseEffect(color) {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 100px;
            height: 100px;
            margin: -50px 0 0 -50px;
            border: 2px solid ${color};
            border-radius: 50%;
            opacity: 0;
            pointer-events: none;
            z-index: 9998;
            animation: gentlePulse 1.5s ease-out forwards;
        `;
        document.body.appendChild(effect);
        setTimeout(() => effect.remove(), 1500);
    }

    createSparkleEffect(color) {
        for (let i = 0; i < 8; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
                position: fixed;
                top: ${30 + Math.random() * 40}%;
                left: ${20 + Math.random() * 60}%;
                width: 8px;
                height: 8px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                animation: sparkle 0.8s ease-out forwards;
                animation-delay: ${i * 0.1}s;
            `;
            document.body.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1000);
        }
    }

    createShakeEffect() {
        const container = document.getElementById('game-container');
        if (container) {
            container.style.animation = 'narratorShake 0.5s ease-out';
            setTimeout(() => {
                container.style.animation = '';
            }, 500);
        }
    }

    createBounceEffect() {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            bottom: 20%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 32px;
            opacity: 0;
            pointer-events: none;
            z-index: 9998;
            animation: bounceUp 1s ease-out forwards;
        `;
        effect.textContent = '💫';
        document.body.appendChild(effect);
        setTimeout(() => effect.remove(), 1000);
    }

    createFadeEffect(color) {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, transparent 0%, ${color}15 50%, transparent 100%);
            opacity: 0;
            pointer-events: none;
            z-index: 9998;
            animation: zenFade 2s ease-in-out forwards;
        `;
        document.body.appendChild(effect);
        setTimeout(() => effect.remove(), 2000);
    }

    playNarratorSound() {
        const narrator = this.getCurrentNarrator();
        
        if (narrator.id === 'wangzhuren') {
            eventBus.emit('audio:play', { type: 'warning' });
        } else if (narrator.id === 'xiaohong') {
            eventBus.emit('audio:play', { type: 'success' });
        } else {
            eventBus.emit('audio:play', { type: 'notification' });
        }
    }

    _getMoodForEffect(narratorId) {
        const moodMap = {
            'laozhang': 'speaking',
            'lijie': 'surprised',
            'wangzhuren': 'angry',
            'xiaohong': 'happy',
            'laoli': 'slacking'
        };
        return moodMap[narratorId] || 'idle';
    }

    getNarratorComment(eventType) {
        const narrator = this.getCurrentNarrator();
        const comments = {
            emergency: {
                laozhang: [
                    '别慌，按流程来就行。',
                    '冷静处理，不要乱了阵脚。',
                    '这点事不算什么，慢慢来。'
                ],
                lijie: [
                    '考验你的时候到了！',
                    '机会与风险并存，挺住！',
                    '人生就是这样起起落落！'
                ],
                wangzhuren: [
                    '这点小事都处理不好？',
                    '给你最后一次机会！',
                    '给我顶住！别丢人！'
                ],
                xiaohong: [
                    '别怕别怕，你能行的！',
                    '相信自己，一定可以的！',
                    '加油加油！你最棒了！'
                ],
                laoli: [
                    '没事没事，体制内都这样。',
                    '看开点，没什么大不了的。',
                    '随缘吧，别太较真。'
                ]
            },
            opportunity: {
                laozhang: [
                    '慢慢来，总有机会的。',
                    '是金子总会发光的。',
                    '稳住，别急。'
                ],
                lijie: [
                    '抓住机会啊！',
                    '命运的转折点来了！',
                    '这可是难得的好时机！'
                ],
                wangzhuren: [
                    '要么成功，要么滚蛋！',
                    '证明你的价值！',
                    '给我拿出点真本事来！'
                ],
                xiaohong: [
                    '机会来了！冲鸭！',
                    '太好了，把握机会哦！',
                    '哇，好棒的机会！'
                ],
                laoli: [
                    '机会嘛……随缘吧。',
                    '争不争都一样。',
                    '差不多就行，别太拼命。'
                ]
            },
            daily: {
                laozhang: [
                    '又是平凡的一天。',
                    '踏踏实实做事就好。',
                    '不急，慢慢来。'
                ],
                lijie: [
                    '今天会有什么惊喜呢？',
                    '生活总是充满意外！',
                    '有意思有意思。'
                ],
                wangzhuren: [
                    '效率！效率！',
                    '别磨磨蹭蹭的！',
                    '给我打起精神来！'
                ],
                xiaohong: [
                    '今天也是美好的一天！',
                    '要开心哦！',
                    '保持微笑！'
                ],
                laoli: [
                    '嗯……差不多就行。',
                    '哎，体制内都这样。',
                    '能摸鱼就摸鱼吧。'
                ]
            }
        };

        const typeComments = comments[eventType] || comments.daily;
        const narratorComments = typeComments[narrator.id] || typeComments.lijie;
        return narratorComments[Math.floor(Math.random() * narratorComments.length)];
    }

    calculateEventProbability(baseProb) {
        const config = this.getConfig();
        let prob = baseProb * config.eventFrequency;
        
        if (gameState.month > 24) {
            prob *= (1 + (gameState.month - 24) / 100);
        }

        return Math.min(prob, 0.95);
    }

    getDifficultyModifier() {
        return this.getConfig().difficultyMultiplier;
    }

    getMistakePenalty() {
        return this.getConfig().mistakePenalty;
    }

    getRewardMultiplier() {
        return this.getConfig().rewardMultiplier;
    }

    getCooldownDays(eventType) {
        const config = this.getConfig();
        return eventType === 'critical' ? config.sameEventCooldown : config.similarTypeCooldown;
    }

    getAvailableNarrators() {
        const narrators = [];
        for (const id in this.narrators) {
            narrators.push({
                id: id,
                ...this.narrators[id]
            });
        }
        return narrators;
    }

    showNarratorSelectUI() {
        const narrators = this.getAvailableNarrators();
        let html = '<h3 style="text-align:center;margin-bottom:16px;color:var(--gold);">🎭 选择你的叙述者</h3>';
        html += '<p style="text-align:center;color:var(--text-secondary);margin-bottom:16px;font-size:12px;">不同的叙述者会带来不同的游戏体验</p>';
        
        narrators.forEach(narrator => {
            const difficultyText = narrator.difficultyMultiplier <= 0.8 ? '简单' : 
                                 narrator.difficultyMultiplier <= 0.95 ? '较易' :
                                 narrator.difficultyMultiplier >= 1.2 ? '困难' : '普通';
            const rewardText = narrator.rewardMultiplier > 1 ? '丰厚' : 
                             narrator.rewardMultiplier < 1 ? '微薄' : '正常';
            const eventText = narrator.eventFrequency <= 0.7 ? '较少' :
                            narrator.eventFrequency >= 1.2 ? '频繁' : '适中';
            
            html += `
                <div style="
                    padding:16px;
                    margin-bottom:12px;
                    border:2px solid ${narrator.borderColor};
                    border-radius:8px;
                    cursor:pointer;
                    transition:all 0.3s;
                    background:${narrator.bgColor};
                " 
                     onclick="narratorSystem.selectNarrator('${narrator.id}'); mainUI.hideModal();"
                     onmouseover="this.style.transform='scale(1.02)';this.style.borderColor='${narrator.color}';"
                     onmouseout="this.style.transform='scale(1)';this.style.borderColor='${narrator.borderColor}';">
                    <div style="display:flex;align-items:center;gap:16px;">
                        <span style="font-size:36px;">${narrator.icon}</span>
                        <div style="flex:1;">
                            <div style="font-weight:bold;font-size:16px;color:${narrator.color};">${narrator.name}</div>
                            <div style="font-size:11px;color:${narrator.accentColor};margin-top:2px;">${narrator.title}</div>
                            <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">${narrator.description}</div>
                        </div>
                    </div>
                    <div style="display:flex;gap:12px;margin-top:12px;padding-top:10px;border-top:1px solid ${narrator.borderColor};font-size:10px;color:var(--text-secondary);">
                        <span style="color:${narrator.color};">📊 ${difficultyText}</span>
                        <span>|</span>
                        <span>⚡ ${eventText}事件</span>
                        <span>|</span>
                        <span>🎁 ${rewardText}奖励</span>
                    </div>
                    <div style="margin-top:8px;font-size:10px;color:${narrator.accentColor};font-style:italic;">
                        "${narrator.speakingStyle}"
                    </div>
                </div>
            `;
        });

        mainUI.showModal(html);
    }

    getNarratorBadge() {
        const narrator = this.getCurrentNarrator();
        return `<span style="color:${narrator.color};">${narrator.icon}</span>`;
    }
}

const narratorSystem = new NarratorSystem();
window.narratorSystem = narratorSystem;

(function injectNarratorStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes gentlePulse {
            0% {
                transform: scale(0.5);
                opacity: 0.8;
            }
            100% {
                transform: scale(3);
                opacity: 0;
            }
        }
        
        @keyframes sparkle {
            0% {
                transform: scale(0) rotate(0deg);
                opacity: 1;
            }
            50% {
                transform: scale(1.5) rotate(180deg);
                opacity: 0.8;
            }
            100% {
                transform: scale(0) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes narratorShake {
            0%, 100% { transform: translateX(0); }
            10% { transform: translateX(-8px) rotate(-1deg); }
            20% { transform: translateX(8px) rotate(1deg); }
            30% { transform: translateX(-6px) rotate(-0.5deg); }
            40% { transform: translateX(6px) rotate(0.5deg); }
            50% { transform: translateX(-4px); }
            60% { transform: translateX(4px); }
            70% { transform: translateX(-2px); }
            80% { transform: translateX(2px); }
        }
        
        @keyframes bounceUp {
            0% {
                transform: translateX(-50%) translateY(0);
                opacity: 0;
            }
            20% {
                opacity: 1;
            }
            80% {
                opacity: 1;
            }
            100% {
                transform: translateX(-50%) translateY(-100px);
                opacity: 0;
            }
        }
        
        @keyframes zenFade {
            0% {
                opacity: 0;
            }
            30% {
                opacity: 1;
            }
            70% {
                opacity: 1;
            }
            100% {
                opacity: 0;
            }
        }
        
        @keyframes narratorFlash {
            0% {
                opacity: 0;
            }
            20% {
                opacity: 0.3;
            }
            100% {
                opacity: 0;
            }
        }
        
        .narrator-message {
            position: relative;
            padding-left: 40px;
        }
        
        .narrator-message::before {
            content: attr(data-narrator-icon);
            position: absolute;
            left: 8px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 18px;
        }
    `;
    document.head.appendChild(style);
})();
