class CardSystem {
    constructor() {
        this.hand = [];
        this.playedCards = [];
        this.currentStep = 0;
        this.matchType = null;
        this.narratorBonus = {};
        this.backgroundBias = {
            exam_winner: { work: 1.2, study: 1.3, rest: 0.8 },
            talent_import: { study: 1.4, work: 1.1, social: 0.8 },
            military_transfer: { work: 1.1, rest: 1.2, social: 0.7 },
            borrowed_official: { work: 1.2, social: 0.8 },
            connected: { social: 1.4, rest: 1.1, work: 0.85 }
        };
    }

    getHandSize() {
        const month = gameState.month;
        if (month <= 6) return 5;
        if (month <= 12) return 6;
        if (month <= 24) return 7;
        return 8;
    }

    dealHand() {
        this.hand = [];
        this.playedCards = [];
        this.currentStep = 0;
        this.matchType = null;

        const month = gameState.month;
        const rep = gameState.reputation;
        const handSize = this.getHandSize();

        // 获取背景对发牌的加成
        const bg = gameState.background || 'exam_winner';
        const bias = this.backgroundBias[bg] || {};

        // 基础概率（被背景加权）
        let pWork = 0.38 * (bias.work || 1);
        let pSocial = 0.12 * (bias.social || 1);
        let pRest = 0.24 * (bias.rest || 1);
        let pStudy = 0.12 * (bias.study || 1);
        let pEvent = 0.10;
        let pCurse = 0.04;

        // 归一化
        const total = pWork + pSocial + pRest + pStudy + pEvent + pCurse;
        pWork /= total;
        pSocial /= total;
        pRest /= total;
        pStudy /= total;
        pEvent /= total;
        pCurse /= total;

        // 转为累加阈值
        const thWork = pWork;
        const thSocial = thWork + pSocial;
        const thRest = thSocial + pRest;
        const thStudy = thRest + pStudy;
        const thEvent = thStudy + pEvent;

        const workPool = ['document', 'meeting', 'research'];
        if (month >= 3) workPool.push('report');
        if (month >= 5) workPool.push('training');
        if (month >= 6) workPool.push('inspection');
        if (month >= 9) workPool.push('speech');

        for (let i = 0; i < handSize; i++) {
            const roll = Math.random();
            let cardType;

            if (roll < thWork) {
                cardType = workPool[Math.floor(Math.random() * workPool.length)];
            } else if (roll < thSocial) {
                const socialPool = ['social', 'chat_break'];
                cardType = socialPool[Math.floor(Math.random() * socialPool.length)];
            } else if (roll < thRest) {
                const restPool = ['rest', 'lunch_nap', 'walk_break', 'snack_time'];
                cardType = restPool[Math.floor(Math.random() * restPool.length)];
            } else if (roll < thStudy) {
                cardType = 'study';
            } else if (month >= 3 && roll < thEvent) {
                cardType = this._pickEventCard(month, rep);
                if (!cardType) cardType = 'document';
            } else {
                cardType = this._pickCurseCard(rep);
                if (!cardType) cardType = 'document';
            }

            const card = this._createCard(cardType, month);
            if (card) this.hand.push(card);
        }

        while (this.hand.length < handSize) {
            this.hand.push(this._createCard('document', month));
        }

        return this.hand;
    }

    playCard(index) {
        if (index < 0 || index >= this.hand.length) return null;
        const card = this.hand.splice(index, 1)[0];
        this.playedCards.push(card);

        const allSame = this.playedCards.length === 3 &&
            this.playedCards.every(c => c.activityType === this.playedCards[0].activityType);

        if (this.playedCards.length === 3) {
            const result = {
                cards: [...this.playedCards],
                allSame,
                matchType: allSame ? this.playedCards[0].activityType : null,
                isComplete: true
            };
            this.playedCards = [];
            this.currentStep = 0;
            this.matchType = null;
            return result;
        }

        this.currentStep = this.playedCards.length;
        if (this.playedCards.length >= 2) {
            const first = this.playedCards[0].activityType;
            const allMatch = this.playedCards.every(c => c.activityType === first);
            if (allMatch) this.matchType = first;
            else this.matchType = null;
        }

        return { cards: [card], allSame: false, isComplete: false };
    }

    getMatchHint() {
        if (this.playedCards.length < 2) return null;
        if (!this.matchType) return null;
        const names = { work: '📋工作', social: '🍵社交', rest: '☕休息', study: '📚学习', special: '🎲事件' };
        return `再选1张${names[this.matchType] || this.matchType}即可三消！`;
    }

    applyCard(card) {
        const trait = gameState.traitEffects || {};

        let energyCost = card.energyCost;
        let stressGain = card.stressGain;

        if (trait.energyCost && energyCost > 0) energyCost = Math.round(energyCost * trait.energyCost);
        if (trait.stressGain && stressGain > 0) stressGain = Math.round(stressGain * trait.stressGain);
        if (trait.healthCost && energyCost > 0) energyCost = Math.round(energyCost * trait.healthCost);
        if (trait.energyRecovery && energyCost < 0) energyCost = Math.round(energyCost * trait.energyRecovery);
        if (trait.stressVulnerable && stressGain > 0) stressGain = Math.round(stressGain * trait.stressVulnerable);

        // 技能树加成 - 调用 skillSystem 的卡牌加成
        let expBonus = 1;
        let repBonus = 1;
        let connBonus = 1;
        if (typeof skillSystem !== 'undefined' && skillSystem.getCardBonus) {
            const bonuses = skillSystem.getCardBonus(card.activityType);
            expBonus = bonuses.expBonus || 1;
            repBonus = bonuses.reputationBonus || 1;
            connBonus = bonuses.socialBonus || 1;
        }

        gameState.modifyStat('energy', -energyCost);
        gameState.modifyStat('stress', stressGain);

        if (card.isEvent) {
            return this._resolveEventCard(card);
        }

        if (card.rewards.exp) gameState.exp += Math.round(card.rewards.exp * expBonus);
        if (card.rewards.reputation) gameState.modifyStat('reputation', Math.round(card.rewards.reputation * repBonus));
        if (card.rewards.connections) gameState.modifyStat('connections', Math.round(card.rewards.connections * connBonus));
        if (card.rewards.health) gameState.modifyStat('health', card.rewards.health);

        return { success: true };
    }

    resolveMatch(bonus) {
        const type = this.playedCards.length > 0 ? this.playedCards[0].activityType : null;
        if (!type) return;

        // 同类型奖励
        if (bonus.reputation) gameState.modifyStat('reputation', bonus.reputation);
        if (bonus.exp) gameState.exp += bonus.exp;
        if (bonus.connections) gameState.modifyStat('connections', bonus.connections);
        if (bonus.energy) gameState.modifyStat('energy', bonus.energy);
        if (bonus.stress) gameState.modifyStat('stress', -bonus.stress);
    }

    getMatchBonus(type) {
        switch (type) {
            case 'work': return { reputation: 10, exp: 10 };
            case 'social': return { connections: 8 };
            case 'rest': return { energy: 20, stress: 15 };
            case 'study': return { exp: 30 };
            case 'special': return { exp: 20, reputation: 5 };
            default: return {};
        }
    }

    _createCard(type, month) {
        const templates = this._getCardTemplates();
        const t = templates[type];
        if (!t) return null;

        const rewards = { ...t.rewards };
        if (month >= 12 && t.activityType === 'work') {
            Object.keys(rewards).forEach(k => rewards[k] = Math.round(rewards[k] * 1.3));
        }

        return {
            id: Date.now() + Math.random(),
            type,
            name: t.name,
            icon: t.icon,
            description: t.description,
            energyCost: t.energyCost,
            stressGain: t.stressGain,
            rewards,
            activityType: t.activityType,
            isEvent: t.isEvent || false,
            isCurse: t.isCurse || false,
            specialEffect: t.specialEffect || null
        };
    }

    _getCardTemplates() {
        return {
            document: { name: '公文处理', icon: '📋', description: '处理日常公文流转', energyCost: 15, stressGain: 5, rewards: { exp: 20, reputation: 2 }, activityType: 'work' },
            meeting: { name: '会议服务', icon: '👥', description: '筹备和参加各类会议', energyCost: 20, stressGain: 8, rewards: { exp: 25, reputation: 3, connections: 2 }, activityType: 'work' },
            research: { name: '调研任务', icon: '🔍', description: '外出调研收集资料', energyCost: 25, stressGain: 3, rewards: { exp: 30, reputation: 5 }, activityType: 'work' },
            report: { name: '撰写报告', icon: '📝', description: '撰写工作总结或调研报告', energyCost: 20, stressGain: 10, rewards: { exp: 35, reputation: 6 }, activityType: 'work' },
            training: { name: '业务培训', icon: '🎓', description: '参加或组织业务培训', energyCost: 15, stressGain: -5, rewards: { exp: 30, connections: 5 }, activityType: 'work' },
            inspection: { name: '迎接检查', icon: '📊', description: '准备上级检查材料', energyCost: 25, stressGain: 15, rewards: { exp: 40, reputation: 8, connections: 3 }, activityType: 'work' },
            speech: { name: '起草讲话稿', icon: '🎤', description: '为领导起草讲话稿', energyCost: 22, stressGain: 12, rewards: { exp: 45, reputation: 10, connections: 4 }, activityType: 'work' },
            social: { name: '社交应酬', icon: '🍵', description: '与同事或领导交流', energyCost: 10, stressGain: -5, rewards: { connections: 5 }, activityType: 'social' },
            rest: { name: '休息放松', icon: '☕', description: '喝杯茶放松一下', energyCost: -20, stressGain: -15, rewards: {}, activityType: 'rest' },
            lunch_nap: { name: '午休小憩', icon: '😴', description: '中午趴在桌上睡一觉', energyCost: -15, stressGain: -10, rewards: {}, activityType: 'rest' },
            walk_break: { name: '散步放松', icon: '🚶', description: '下楼散散步透透气', energyCost: -8, stressGain: -12, rewards: { exp: 3 }, activityType: 'rest' },
            snack_time: { name: '零食补给', icon: '🍪', description: '打开抽屉吃包零食', energyCost: -12, stressGain: -5, rewards: { health: 2 }, activityType: 'rest' },
            chat_break: { name: '闲聊摸鱼', icon: '💬', description: '跟同事聊聊天放松一下', energyCost: -5, stressGain: -10, rewards: { connections: 3 }, activityType: 'social' },
            study: { name: '学习充电', icon: '📚', description: '学习政策文件或业务知识', energyCost: 12, stressGain: 3, rewards: { exp: 35 }, activityType: 'study' },
            hot_potato: { name: '烫手山芋', icon: '🎲', description: '领导丢来一个棘手任务', energyCost: 30, stressGain: 20, rewards: { exp: 30 }, activityType: 'special', isEvent: true, specialEffect: '随机声望±15' },
            overtime: { name: '紧急加班', icon: '🌙', description: '下班前突加紧急任务', energyCost: 35, stressGain: 25, rewards: { exp: 60, reputation: 5 }, activityType: 'special', isEvent: true, specialEffect: '可能影响健康' },
            cross_dept: { name: '跨部门合作', icon: '🤝', description: '与其他部门协作项目', energyCost: 15, stressGain: 5, rewards: { exp: 20, reputation: 3, connections: 10 }, activityType: 'special', isEvent: true },
            inspection_visit: { name: '上级视察', icon: '🏛️', description: '接待上级领导视察', energyCost: 20, stressGain: 15, rewards: { exp: 25, reputation: 12, connections: 5 }, activityType: 'special', isEvent: true },
            coworker_help: { name: '同事求助', icon: '🙋', description: '同事请你帮忙', energyCost: 10, stressGain: 0, rewards: { connections: 5 }, activityType: 'special', isEvent: true },
            surprise_check: { name: '突击检查', icon: '⚠️', description: '上级突然前来检查', energyCost: 10, stressGain: 10, rewards: {}, activityType: 'special', isEvent: true, isCurse: true },
            gossip: { name: '办公室流言', icon: '👂', description: '你成了办公室八卦的主角', energyCost: 5, stressGain: 15, rewards: { connections: -3 }, activityType: 'special', isEvent: true, isCurse: true }
        };
    }

    _pickEventCard(month, rep) {
        const events = [];
        if (month >= 3) events.push('hot_potato', 'cross_dept', 'coworker_help');
        if (month >= 6) events.push('overtime');
        if (month >= 9) events.push('inspection_visit');
        if (events.length === 0) return null;
        return events[Math.floor(Math.random() * events.length)];
    }

    _pickCurseCard(rep) {
        const curses = ['surprise_check'];
        if (rep >= 30) curses.push('gossip');
        if (Math.random() > 0.5) return null;
        return curses[Math.floor(Math.random() * curses.length)];
    }

    _resolveEventCard(card) {
        const result = { success: true, extraMessages: [] };
        const trait = gameState.traitEffects || {};

        switch (card.type) {
            case 'hot_potato': {
                const success = Math.random() < 0.6;
                if (success) {
                    let repGain = 15;
                    if (trait.reputationGain) repGain = Math.round(repGain * trait.reputationGain);
                    gameState.modifyStat('reputation', repGain);
                    result.extraMessages.push(`🎉 你漂亮地解决了这个烫手山芋，领导对你刮目相看！声望+${repGain}`);
                } else {
                    gameState.modifyStat('reputation', -5);
                    result.extraMessages.push('😰 这个烫手山芋把你烫得不轻……声望-5');
                }
                break;
            }
            case 'overtime': {
                let healthDamage = 10 + Math.floor(Math.random() * 10);
                if (trait.overtimeHealth) healthDamage = Math.round(healthDamage * trait.overtimeHealth);
                gameState.modifyStat('health', -healthDamage);
                result.extraMessages.push(`🌙 连续加班让你健康受损 -${healthDamage}`);
                if (card.rewards.exp) gameState.exp += card.rewards.exp;
                if (card.rewards.reputation) gameState.modifyStat('reputation', card.rewards.reputation);
                break;
            }
            case 'coworker_help': {
                if (card.rewards.connections) gameState.modifyStat('connections', card.rewards.connections);
                result.extraMessages.push('🤝 同事感激不尽，你的人脉增加了');
                break;
            }
            case 'gossip': {
                gameState.modifyStat('connections', -3);
                result.extraMessages.push('👂 流言让你在办公室里有些尴尬，人脉-3');
                break;
            }
            default:
                if (card.rewards.exp) gameState.exp += card.rewards.exp;
                if (card.rewards.reputation) gameState.modifyStat('reputation', card.rewards.reputation);
                if (card.rewards.connections) gameState.modifyStat('connections', card.rewards.connections);
        }

        return result;
    }

    getCardActivityLabel(card) {
        const labels = { work: '📋工作', social: '🍵社交', rest: '☕休息', study: '📚学习', special: '🎲事件' };
        return labels[card.activityType] || '❓';
    }
}

const cardSystem = new CardSystem();
