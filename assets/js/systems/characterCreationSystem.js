class CharacterCreationSystem {
    constructor() {
        this.backgrounds = [
            {
                id: 'exam_winner',
                name: '普通遴选',
                description: '千军万马过独木桥考进来的',
                icon: '📝',
                color: '#38b764',
                effects: {
                    workAbility: 5,
                    stressAbility: 5,
                    commAbility: 5
                },
                availableWeek: 1,
                story: '你是通过正规公务员考试进来的，虽然没有特殊背景，但基本功扎实。'
            },
            {
                id: 'talent_import',
                name: '人才引进',
                description: '博士学历直接入职',
                icon: '🎓',
                color: '#3b5dc9',
                effects: {
                    workAbility: 15,
                    commAbility: -10,
                    reputation: 10
                },
                availableWeek: 1,
                story: '你是作为高层次人才被引进的，起点很高，但人际关系需要努力。'
            },
            {
                id: 'military_transfer',
                name: '军转干部',
                description: '从部队转业到地方',
                icon: '🎖️',
                color: '#ef7d57',
                effects: {
                    stressAbility: 20,
                    commAbility: -15,
                    health: 10
                },
                availableWeek: 2,
                story: '你有着军人的纪律和毅力，适应能力强，但需要学习地方工作方式。'
            },
            {
                id: 'borrowed_official',
                name: '借调人员',
                description: '从下级单位借调来的',
                icon: '📤',
                color: '#9b59b6',
                effects: {
                    connections: -15,
                    workAbility: 10,
                    politicalCapital: 5
                },
                availableWeek: 1,
                story: '你是从基层借调来的，工作经验丰富，但在新环境中需要重新建立人脉。'
            },
            {
                id: 'connected',
                name: '关系户',
                description: '有人打招呼进来的',
                icon: '🤝',
                color: '#ffcd75',
                effects: {
                    connections: 20,
                    reputation: 15,
                    bossExpectation: 1.2
                },
                availableWeek: 3,
                story: '你有着不错的背景关系，但也承受着更高的期望和压力。'
            }
        ];

        this.traits = [
            {
                id: 'social_butterfly',
                name: '社牛属性',
                rarity: 'rare',
                icon: '🗣️',
                color: '#ef7d57',
                effects: {
                    commAbility: 15,
                    relationshipGain: 1.2
                },
                description: '天生的社交达人，与人打交道如鱼得水。'
            },
            {
                id: 'master_writer',
                name: '材料高手',
                rarity: 'rare',
                icon: '📚',
                color: '#3b5dc9',
                effects: {
                    workAbility: 15,
                    energyCost: 0.7
                },
                description: '写材料是你的强项，领导对你寄予厚望。'
            },
            {
                id: 'workaholic',
                name: '卷王体质',
                rarity: 'legendary',
                icon: '🏃',
                color: '#b13e53',
                effects: {
                    overtimeHealth: 0.5,
                    stressAccumulation: 1.5,
                    workAbility: 20
                },
                description: '越加班越精神，工作就是你的生命。'
            },
            {
                id: 'old_school',
                name: '老油条',
                rarity: 'rare',
                icon: '😎',
                color: '#8b8b8b',
                effects: {
                    connectionCost: 0.7,
                    reputationBoost: 0.7,
                    stressGain: 0.5
                },
                description: '深谙职场规则，懂得如何在体制内生存。'
            },
            {
                id: 'innocent',
                name: '小白兔',
                rarity: 'normal',
                icon: '👶',
                color: '#ffcd75',
                effects: {
                    reputation: 10,
                    stressVulnerable: 1.3,
                    commAbility: -5
                },
                description: '天真善良，容易相信别人，但也容易受伤。'
            },
            {
                id: 'iron_man',
                name: '铁人',
                rarity: 'rare',
                icon: '💪',
                color: '#38b764',
                effects: {
                    healthCost: 0.7,
                    energyRecovery: 1.2
                },
                description: '身体倍儿棒，精力充沛，不容易生病。'
            },
            {
                id: 'perfectionist',
                name: '完美主义者',
                rarity: 'normal',
                icon: '✨',
                color: '#9b59b6',
                effects: {
                    workAbility: 10,
                    stressAccumulation: 1.2,
                    reputationBonus: 1.1
                },
                description: '做事精益求精，追求完美，但容易给自己压力。'
            },
            {
                id: 'lazy',
                name: '佛系青年',
                rarity: 'normal',
                icon: '😌',
                color: '#c0c0c0',
                effects: {
                    stressGain: 0.5,
                    workAbility: -5,
                    moodBoost: 1.2
                },
                description: '无欲无求，心态平和，不争不抢。'
            },
            {
                id: 'ambitious',
                name: '野心家',
                rarity: 'rare',
                icon: '🔥',
                color: '#b13e53',
                effects: {
                    reputationGain: 1.3,
                    stressGain: 1.1,
                    promotionChance: 1.2
                },
                description: '目标明确，渴望成功，愿意为此付出代价。'
            },
            {
                id: 'loyal',
                name: '忠诚可靠',
                rarity: 'normal',
                icon: '🤍',
                color: '#38b764',
                effects: {
                    trustGain: 1.3,
                    bossTrust: 1.2,
                    politicalRisk: 0.8
                },
                description: '值得信赖，是领导和同事的可靠伙伴。'
            }
        ];

        this.selectedBackground = null;
        this.selectedTraits = [];

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._init());
        } else {
            this._init();
        }
    }

    _init() {
        eventBus.on('character:selectBackground', (backgroundId) => this.selectBackground(backgroundId));
        eventBus.on('character:selectTrait', (traitId) => this.selectTrait(traitId));
        eventBus.on('character:confirm', () => this.confirmCreation());
    }

    selectBackground(backgroundId) {
        const background = this.backgrounds.find(b => b.id === backgroundId);
        if (background) {
            this.selectedBackground = background;
            eventBus.emit('ui:showToast', { text: `✅ 选择背景: ${background.name}`, type: 'success' });
            this._updateBackgroundSelectionUI(backgroundId);
        }
    }

    selectTrait(traitId) {
        const index = this.selectedTraits.indexOf(traitId);
        if (index > -1) {
            this.selectedTraits.splice(index, 1);
            const trait = this.traits.find(t => t.id === traitId);
            if (trait) {
                eventBus.emit('ui:showToast', { text: `❌ 取消特质: ${trait.name}`, type: 'info' });
            }
        } else if (this.selectedTraits.length < 3) {
            this.selectedTraits.push(traitId);
            const trait = this.traits.find(t => t.id === traitId);
            if (trait) {
                eventBus.emit('ui:showToast', { text: `✅ 选择特质: ${trait.name}`, type: 'success' });
            }
        } else {
            eventBus.emit('ui:showToast', { text: '⚠️ 最多选择3个特质', type: 'warning' });
        }
        this._updateTraitSelectionUI();
    }
    
    _updateBackgroundSelectionUI(backgroundId) {
        const backgroundElements = document.querySelectorAll('[data-background-id]');
        backgroundElements.forEach(el => {
            const id = el.dataset.backgroundId;
            if (id === backgroundId) {
                el.style.borderColor = this.backgrounds.find(b => b.id === id)?.color || '#ffcd75';
                el.style.transform = 'scale(1.02)';
            } else {
                el.style.borderColor = '#333';
                el.style.transform = 'scale(1)';
            }
        });
    }
    
    _updateTraitSelectionUI() {
        const traitElements = document.querySelectorAll('[data-trait-id]');
        traitElements.forEach(el => {
            const id = el.dataset.traitId;
            const isSelected = this.selectedTraits.includes(id);
            const trait = this.traits.find(t => t.id === id);
            const rarityColor = this.getRarityColor(trait?.rarity || 'normal');
            
            if (isSelected) {
                el.style.borderColor = rarityColor;
                el.style.transform = 'scale(1.05)';
                el.style.boxShadow = `0 0 10px ${rarityColor}40`;
            } else {
                el.style.borderColor = '#333';
                el.style.transform = 'scale(1)';
                el.style.boxShadow = 'none';
            }
        });
    }

    confirmCreation() {
        if (!this.selectedBackground) {
            eventBus.emit('ui:showToast', { text: '⚠️ 请先选择背景', type: 'warning' });
            return;
        }

        const background = this.selectedBackground;
        const traits = this.selectedTraits.map(id => this.traits.find(t => t.id === id)).filter(Boolean);

        if (typeof gameState !== 'undefined') {
            gameState.background = background.id;
            gameState.traits = this.selectedTraits;

            Object.keys(background.effects).forEach(key => {
                if (key === 'bossExpectation') {
                    gameState[key] = background.effects[key];
                } else if (key === 'politicalCapital') {
                    gameState[key] = (gameState[key] || 0) + background.effects[key];
                } else if (gameState[key] !== undefined) {
                    gameState[key] += background.effects[key];
                }
            });

            traits.forEach(trait => {
                if (!trait || !trait.effects) return;
                
                Object.keys(trait.effects).forEach(key => {
                    const value = trait.effects[key];
                    if (key === 'relationshipGain' || key === 'energyCost' || key === 'stressAccumulation' ||
                        key === 'connectionCost' || key === 'reputationBoost' || key === 'stressGain' ||
                        key === 'healthCost' || key === 'energyRecovery' || key === 'stressVulnerable' ||
                        key === 'reputationBonus' || key === 'trustGain' || key === 'bossTrust' ||
                        key === 'politicalRisk' || key === 'promotionChance' || key === 'moodBoost') {
                        if (!gameState.traitEffects) {
                            gameState.traitEffects = {};
                        }
                        gameState.traitEffects[key] = (gameState.traitEffects[key] || 1) * value;
                    } else if (gameState[key] !== undefined) {
                        gameState[key] += value;
                    }
                });
            });

            saveSystem.save();
            
            eventBus.emit('ui:showMessage', {
                text: `🎭 你选择了【${background.name}】背景`,
                type: 'success'
            });

            if (traits.length > 0) {
                eventBus.emit('ui:showMessage', {
                    text: `✨ 你的特质: ${traits.map(t => t.name).join('、')}`,
                    type: 'success'
                });
            }

            narratorSystem.showNarratorSelectUI();
        }
    }

    getBackgrounds() {
        return this.backgrounds;
    }

    getTraits() {
        return this.traits;
    }

    getRarityColor(rarity) {
        const colors = {
            normal: '#8b8b8b',
            rare: '#3b5dc9',
            legendary: '#ffcd75'
        };
        return colors[rarity] || colors.normal;
    }

    effectLabels = {
        workAbility: '工作能力',
        commAbility: '沟通能力',
        stressAbility: '抗压能力',
        reputation: '声望',
        connections: '人脉',
        health: '体力',
        politicalCapital: '政治资本',
        bossExpectation: '领导期望',
        relationshipGain: '社交效率',
        energyCost: '能耗系数',
        overtimeHealth: '加班消耗',
        stressAccumulation: '压力积累',
        connectionCost: '人脉消耗',
        reputationBoost: '声望获取',
        stressGain: '压力增长',
        stressVulnerable: '压力易感',
        healthCost: '体力消耗',
        energyRecovery: '精力恢复',
        reputationBonus: '声望加成',
        trustGain: '信任获取',
        bossTrust: '领导信任',
        politicalRisk: '政治风险',
        promotionChance: '晋升概率',
        moodBoost: '心情增益'
    };

    formatEffects(effects, isPercent = false) {
        if (!effects || Object.keys(effects).length === 0) return '';
        return Object.entries(effects).map(([key, value]) => {
            const label = this.effectLabels[key] || key;
            if (typeof value === 'number' && value % 1 === 0) {
                if (isPercent) {
                    const sign = value > 0 ? '+' : '';
                    return `<span style="color:${value > 0 ? '#2ed573' : '#e74c3c'};">${label} ${sign}${Math.round((value - 1) * 100)}%</span>`;
                }
                const sign = value > 0 ? '+' : '';
                return `<span style="color:${value > 0 ? '#2ed573' : '#e74c3c'};">${label} ${sign}${value}</span>`;
            } else if (typeof value === 'number') {
                const sign = value > 1 ? '+' : '';
                const pct = Math.round((value - 1) * 100);
                return `<span style="color:${value > 1 ? '#2ed573' : '#e74c3c'};">${label} ${sign}${pct}%</span>`;
            }
            return '';
        }).join('');
    }

    showCharacterCreationUI() {
        let html = '<h3 style="text-align:center;margin-bottom:16px;">👤 创建角色</h3>';
        
        html += '<div style="margin-bottom:20px;">';
        html += '<h4 style="font-size:12px;color:#888;margin-bottom:8px;">📋 选择背景</h4>';
        
        this.backgrounds.forEach(background => {
            const isSelected = this.selectedBackground?.id === background.id;
            html += `
                <div data-background-id="${background.id}" style="padding:10px;margin-bottom:6px;border:2px solid ${isSelected ? background.color : '#333'};border-radius:6px;cursor:pointer;transition:all 0.2s;${isSelected ? 'transform:scale(1.02);' : ''}" 
                     onclick="characterCreationSystem.selectBackground('${background.id}');">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:22px;">${background.icon}</span>
                        <div style="flex:1;">
                            <div style="font-weight:bold;font-size:13px;color:${background.color};">${background.name}</div>
                            <div style="font-size:11px;color:#888;">${background.description}</div>
                        </div>
                    </div>
                    <div style="margin-top:6px;font-size:10px;color:#666;">${background.story}</div>
                    <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px;font-size:10px;">
                        ${this.formatEffects(background.effects)}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        html += '<div>';
        html += '<h4 style="font-size:12px;color:#888;margin-bottom:8px;">✨ 选择特质（最多3个）</h4>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
        
        this.traits.forEach(trait => {
            const isSelected = this.selectedTraits.includes(trait.id);
            const rarityColor = this.getRarityColor(trait.rarity);
            const rarityLabel = { normal: '普通', rare: '稀有', legendary: '传说' }[trait.rarity] || '普通';
            html += `
                <div data-trait-id="${trait.id}" style="flex:1;min-width:180px;padding:8px 10px;border:2px solid ${isSelected ? rarityColor : '#333'};border-radius:4px;cursor:pointer;transition:all 0.2s;${isSelected ? `transform:scale(1.05);box-shadow:0 0 10px ${rarityColor}40;` : ''}" 
                     onclick="characterCreationSystem.selectTrait('${trait.id}');">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                        <span>${trait.icon}</span>
                        <span style="font-size:11px;font-weight:bold;color:${rarityColor};">${trait.name}</span>
                        <span style="font-size:9px;color:${rarityColor};opacity:0.6;">${rarityLabel}</span>
                    </div>
                    <div style="font-size:9px;color:#888;margin-bottom:4px;">${trait.description}</div>
                    <div style="display:flex;flex-wrap:wrap;gap:3px;font-size:9px;">
                        ${this.formatEffects(trait.effects)}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        html += '</div>';

        html += `
            <button onclick="characterCreationSystem.confirmCreation()" 
                    style="width:100%;margin-top:16px;padding:12px;background:#ffd700;color:#1a1a2e;font-weight:bold;border:none;border-radius:6px;cursor:pointer;">
                🎮 开始游戏
            </button>
        `;

        mainUI.showModal(html);
    }
}

const characterCreationSystem = new CharacterCreationSystem();
