class NeedsSystem {
    constructor() {
        this.needs = {
            energy: {
                id: 'energy',
                name: '精力',
                icon: '⚡',
                color: '#38b764',
                min: 0,
                max: 100,
                baseDecay: 10,
                baseRecovery: 15,
                
                effects: {
                    lowThreshold: 30,
                    lowEffect: {
                        workEfficiency: 0.7,
                        mistakeChance: 1.5
                    },
                    highThreshold: 80,
                    highEffect: {
                        workEfficiency: 1.1
                    }
                },
                
                recoveryActions: ['rest', 'sleep', 'vacation'],
                decayActions: ['work', 'social', 'stressful_event']
            },
            health: {
                id: 'health',
                name: '健康',
                icon: '❤️',
                color: '#b13e53',
                min: 0,
                max: 100,
                baseDecay: 5,
                baseRecovery: 8,
                
                effects: {
                    lowThreshold: 30,
                    lowEffect: {
                        sickChance: 0.3,
                        eventProbability: 0.5
                    },
                    highThreshold: 80,
                    highEffect: {
                        energyRecovery: 1.2
                    }
                },
                
                recoveryActions: ['exercise', 'healthy_eating', 'medical'],
                decayActions: ['overtime', 'poor_diet', 'stress']
            },
            mood: {
                id: 'mood',
                name: '心态',
                icon: '🎭',
                color: '#ffcd75',
                min: 0,
                max: 100,
                baseDecay: 8,
                baseRecovery: 12,
                
                effects: {
                    lowThreshold: 30,
                    lowEffect: {
                        irrationalDecisionChance: 0.4,
                        voiceStrengthBonus: 0.2
                    },
                    highThreshold: 80,
                    highEffect: {
                        relationshipGain: 1.2
                    }
                },
                
                recoveryActions: ['entertainment', 'hobby', 'socializing'],
                decayActions: ['failure', 'criticism', 'boring_work']
            },
            belonging: {
                id: 'belonging',
                name: '归属感',
                icon: '🤝',
                color: '#3b5dc9',
                min: 0,
                max: 100,
                baseDecay: 3,
                baseRecovery: 10,
                
                effects: {
                    lowThreshold: 20,
                    lowEffect: {
                        quitChance: 0.1,
                        connectionGain: 0.5
                    },
                    highThreshold: 70,
                    highEffect: {
                        teamworkEfficiency: 1.15
                    }
                },
                
                recoveryActions: ['team_activity', 'friendship', 'support'],
                decayActions: ['isolation', 'conflict', 'unfair_treatment']
            },
            reputation: {
                id: 'reputation',
                name: '声望',
                icon: '⭐',
                color: '#9b59b6',
                min: 0,
                max: 100,
                baseDecay: 2,
                baseRecovery: 5,
                
                effects: {
                    lowThreshold: 30,
                    lowEffect: {
                        opportunityChance: 0.6,
                        bossTrust: 0.8
                    },
                    highThreshold: 80,
                    highEffect: {
                        promotionChance: 1.3
                    }
                },
                
                recoveryActions: ['achievement', 'praise', 'good_deeds'],
                decayActions: ['failure', 'scandal', 'mistakes']
            }
        };

        this.currentValues = {};
        this.dailyChanges = {};

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._init());
        } else {
            this._init();
        }
    }

    _init() {
        eventBus.on('needs:update', (data) => this.updateNeed(data.needId, data.change));
        eventBus.on('needs:action', (data) => this.handleAction(data.action, data.value));
        eventBus.on('month:changed', () => this.onDayChanged());
        eventBus.on('game:newGame', () => this.reset());
    }

    reset() {
        Object.keys(this.needs).forEach(needId => {
            this.currentValues[needId] = gameState.needs?.[needId] || 80;
        });
        this.dailyChanges = {};
    }

    getNeed(needId) {
        return this.needs[needId];
    }

    getValue(needId) {
        return this.currentValues[needId] || this.needs[needId]?.max || 50;
    }

    setValue(needId, value) {
        const need = this.needs[needId];
        if (!need) return;
        
        this.currentValues[needId] = Math.max(need.min, Math.min(need.max, value));
        this.saveNeeds();
        this.checkEffects(needId);
    }

    updateNeed(needId, change) {
        const current = this.getValue(needId);
        this.setValue(needId, current + change);
    }

    handleAction(action, value = 1) {
        let totalValue = value;

        if (typeof gameState.traitEffects === 'object') {
            if (gameState.traitEffects.energyRecovery && 
                (action === 'rest' || action === 'sleep')) {
                totalValue *= gameState.traitEffects.energyRecovery;
            }
            if (gameState.traitEffects.healthCost && 
                (action === 'overtime' || action === 'stress')) {
                totalValue *= gameState.traitEffects.healthCost;
            }
            if (gameState.traitEffects.stressGain && action === 'stress') {
                totalValue *= gameState.traitEffects.stressGain;
            }
        }

        Object.keys(this.needs).forEach(needId => {
            const need = this.needs[needId];
            
            if (need.recoveryActions.includes(action)) {
                this.updateNeed(needId, totalValue * need.baseRecovery / 5);
            } else if (need.decayActions.includes(action)) {
                this.updateNeed(needId, -totalValue * need.baseDecay / 5);
            }
        });
    }

    onDayChanged() {
        Object.keys(this.needs).forEach(needId => {
            const need = this.needs[needId];
            const recovery = need.baseRecovery;
            
            this.updateNeed(needId, recovery);
        });

        if (gameState.month % 3 === 0) {
            this.weeklyCheck();
        }
    }

    weeklyCheck() {
        let message = '';
        Object.keys(this.needs).forEach(needId => {
            const need = this.needs[needId];
            const value = this.getValue(needId);
            
            if (value <= need.effects.lowThreshold) {
                message += `${need.icon} ${need.name}过低！ `;
            }
        });

        if (message) {
            eventBus.emit('ui:showToast', { text: `⚠️ ${message}`, type: 'warning' });
        }
    }

    checkEffects(needId) {
        const need = this.needs[needId];
        const value = this.getValue(needId);

        if (value <= need.effects.lowThreshold) {
            eventBus.emit('needs:low', { 
                needId: needId, 
                needName: need.name, 
                icon: need.icon,
                effects: need.effects.lowEffect 
            });
        } else if (value >= need.effects.highThreshold) {
            eventBus.emit('needs:high', { 
                needId: needId, 
                needName: need.name, 
                icon: need.icon,
                effects: need.effects.highEffect 
            });
        }
    }

    getEffectMultiplier(effectType) {
        let multiplier = 1;
        
        Object.keys(this.needs).forEach(needId => {
            const need = this.needs[needId];
            const value = this.getValue(needId);
            
            if (value <= need.effects.lowThreshold && need.effects.lowEffect[effectType]) {
                multiplier *= need.effects.lowEffect[effectType];
            } else if (value >= need.effects.highThreshold && need.effects.highEffect[effectType]) {
                multiplier *= need.effects.highEffect[effectType];
            }
        });
        
        return multiplier;
    }

    saveNeeds() {
        if (typeof gameState !== 'undefined') {
            gameState.needs = { ...this.currentValues };
            saveSystem.save();
        }
    }

    loadNeeds() {
        if (typeof gameState !== 'undefined' && gameState.needs) {
            Object.keys(gameState.needs).forEach(needId => {
                if (this.needs[needId]) {
                    this.currentValues[needId] = gameState.needs[needId];
                }
            });
        }
    }

    getAllNeeds() {
        const result = {};
        Object.keys(this.needs).forEach(needId => {
            result[needId] = {
                ...this.needs[needId],
                current: this.getValue(needId)
            };
        });
        return result;
    }

    showNeedsPanel() {
        const needs = this.getAllNeeds();
        let html = '<h3 style="text-align:center;margin-bottom:16px;">📊 需求状态</h3>';
        
        Object.values(needs).forEach(need => {
            const percentage = (need.current / need.max) * 100;
            let barColor = need.color;
            
            if (percentage <= need.effects.lowThreshold) {
                barColor = '#b13e53';
            } else if (percentage <= 60) {
                barColor = '#ffcd75';
            }
            
            html += `
                <div style="margin-bottom:12px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                        <span>${need.icon}</span>
                        <span style="font-size:12px;">${need.name}</span>
                        <span style="font-size:12px;color:${barColor};margin-left:auto;">${Math.round(need.current)}</span>
                    </div>
                    <div style="height:6px;background:#222;border-radius:3px;overflow:hidden;">
                        <div style="height:100%;width:${percentage}%;background:${barColor};transition:width 0.3s;"></div>
                    </div>
                </div>
            `;
        });

        html += `
            <button onclick="mainUI.hideModal()" 
                    style="width:100%;padding:10px;background:#444;color:#fff;border:none;border-radius:4px;cursor:pointer;">
                关闭
            </button>
        `;

        mainUI.showModal(html);
    }
}

const needsSystem = new NeedsSystem();
