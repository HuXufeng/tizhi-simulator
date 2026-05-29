/**
 * 技能树系统 - 完整版
 * 三线技能树：文字/社交/管理，各4级技能
 */
class SkillSystem {
    constructor() {
        this.SKILL_COSTS = { 1: 1, 2: 2, 3: 3, 4: 4 }; // 每级消耗点数
        this.SKILL_POINTS_PER_LEVEL = { 1: 0, 2: 10, 3: 25, 4: 50 }; // 解锁下一级所需经验
        
        // 技能池 - 完整版
        this.skillPool = this.createFullSkillPool();
        
        // 已解锁技能
        this.unlockedSkills = new Set();
        this.initializeSkills();
        
        // 技能效果缓存（用于快速计算）
        this.effectCache = this.calculateEffectCache();
    }

    /**
     * 创建完整技能池
     */
    createFullSkillPool() {
        return {
            // ========== 文字路线 ==========
            basic_writing: {
                id: 'basic_writing',
                name: '基础写作',
                tree: 'writing',
                level: 1,
                tier: 1,
                cost: 1,
                icon: '✍️',
                effect: { writingEfficiency: 1.15 },
                effectDesc: '写作效率 +15%',
                description: '掌握公文写作的基本格式和规范',
                prerequisites: [],
                unlocks: ['speed_writer', 'formal_writer']
            },
            speed_writer: {
                id: 'speed_writer',
                name: '速写高手',
                tree: 'writing',
                level: 2,
                tier: 2,
                cost: 2,
                icon: '⚡',
                effect: { writingTime: 0.7, writingEfficiency: 1.1 },
                effectDesc: '写作速度 +30%，效率 +10%',
                description: '熟能生巧，下笔如有神助',
                prerequisites: ['basic_writing'],
                unlocks: ['expert_writer', 'policy_analyst']
            },
            formal_writer: {
                id: 'formal_writer',
                name: '格式大师',
                tree: 'writing',
                level: 2,
                tier: 2,
                cost: 2,
                icon: '📐',
                effect: { reputation: 5, writingQuality: 1.2 },
                effectDesc: '声望 +5，写作质量 +20%',
                description: '对公文格式了如指掌',
                prerequisites: ['basic_writing'],
                unlocks: ['expert_writer']
            },
            expert_writer: {
                id: 'expert_writer',
                name: '笔杆子',
                tree: 'writing',
                level: 3,
                tier: 3,
                cost: 3,
                icon: '🖋️',
                effect: { writingQuality: 1.3, reputation: 10 },
                effectDesc: '写作质量 +30%，声望 +10',
                description: '单位公认的笔杆子',
                prerequisites: ['speed_writer', 'formal_writer'],
                unlocks: ['master_writer']
            },
            policy_analyst: {
                id: 'policy_analyst',
                name: '政策分析师',
                tree: 'writing',
                level: 3,
                tier: 3,
                cost: 3,
                icon: '📊',
                effect: { workAbility: 15, insight: 1.25 },
                effectDesc: '工作能力 +15，洞察力 +25%',
                description: '能准确把握政策要点',
                prerequisites: ['speed_writer'],
                unlocks: ['master_writer']
            },
            master_writer: {
                id: 'master_writer',
                name: '文豪',
                tree: 'writing',
                level: 4,
                tier: 4,
                cost: 4,
                icon: '👑',
                effect: { writingEfficiency: 1.5, reputation: 20, leadership: 10 },
                effectDesc: '写作效率 +50%，声望 +20，领导力 +10',
                description: '妙笔生花，一字千金',
                prerequisites: ['expert_writer', 'policy_analyst'],
                unlocks: []
            },

            // ========== 社交路线 ==========
            basic_social: {
                id: 'basic_social',
                name: '基础社交',
                tree: 'social',
                level: 1,
                tier: 1,
                cost: 1,
                icon: '🤝',
                effect: { socialEffect: 1.2 },
                effectDesc: '社交效果 +20%',
                description: '掌握基本的社交礼仪',
                prerequisites: [],
                unlocks: ['charm', 'active_listener']
            },
            charm: {
                id: 'charm',
                name: '八面玲珑',
                tree: 'social',
                level: 2,
                tier: 2,
                cost: 2,
                icon: '✨',
                effect: { socialEffect: 1.15, connectionCost: 0.7 },
                effectDesc: '社交效果 +15%，好感消耗 -30%',
                description: '左右逢源，人见人爱',
                prerequisites: ['basic_social'],
                unlocks: ['relationship_master', 'gift_guru']
            },
            active_listener: {
                id: 'active_listener',
                name: '善于倾听',
                tree: 'social',
                level: 2,
                tier: 2,
                cost: 2,
                icon: '👂',
                effect: { trustGain: 1.3, insight: 1.2 },
                effectDesc: '信任获取 +30%，洞察力 +20%',
                description: '听比说更重要',
                prerequisites: ['basic_social'],
                unlocks: ['relationship_master']
            },
            relationship_master: {
                id: 'relationship_master',
                name: '人脉王',
                tree: 'social',
                level: 3,
                tier: 3,
                cost: 3,
                icon: '🌐',
                effect: { connections: 15, socialEffect: 1.2 },
                effectDesc: '人脉上限 +15，社交效果 +20%',
                description: '认识的人比你认识的字还多',
                prerequisites: ['charm', 'active_listener'],
                unlocks: ['social_master']
            },
            gift_guru: {
                id: 'gift_guru',
                name: '送礼达人',
                tree: 'social',
                level: 3,
                tier: 3,
                cost: 3,
                icon: '🎁',
                effect: { giftEfficiency: 1.5, giftCost: 0.6 },
                effectDesc: '送礼效率 +50%，费用 -40%',
                description: '礼轻情意重，投其所好',
                prerequisites: ['charm'],
                unlocks: ['social_master']
            },
            social_master: {
                id: 'social_master',
                name: '社交大师',
                tree: 'social',
                level: 4,
                tier: 4,
                cost: 4,
                icon: '👑',
                effect: { socialEffect: 1.5, reputation: 15, connections: 20 },
                effectDesc: '社交效果 +50%，声望 +15，人脉 +20',
                description: '天下谁人不识君',
                prerequisites: ['relationship_master', 'gift_guru'],
                unlocks: []
            },

            // ========== 管理路线 ==========
            basic_management: {
                id: 'basic_management',
                name: '基础管理',
                tree: 'management',
                level: 1,
                tier: 1,
                cost: 1,
                icon: '📋',
                effect: { teamEfficiency: 1.15 },
                effectDesc: '团队效率 +15%',
                description: '了解基本的团队管理知识',
                prerequisites: [],
                unlocks: ['task_coordinator', 'conflict_solver']
            },
            task_coordinator: {
                id: 'task_coordinator',
                name: '任务协调',
                tree: 'management',
                level: 2,
                tier: 2,
                cost: 2,
                icon: '🔄',
                effect: { workEfficiency: 1.2, taskQuality: 1.15 },
                effectDesc: '工作效率 +20%，任务质量 +15%',
                description: '统筹安排，事半功倍',
                prerequisites: ['basic_management'],
                unlocks: ['team_leader', 'time_manager']
            },
            conflict_solver: {
                id: 'conflict_solver',
                name: '矛盾化解',
                tree: 'management',
                level: 2,
                tier: 2,
                cost: 2,
                icon: '⚖️',
                effect: { stressReduction: 1.3, colleagueOpinion: 10 },
                effectDesc: '压力减免 +30%，同事好感 +10',
                description: '大事化小，小事化了',
                prerequisites: ['basic_management'],
                unlocks: ['team_leader']
            },
            team_leader: {
                id: 'team_leader',
                name: '团队领袖',
                tree: 'management',
                level: 3,
                tier: 3,
                cost: 3,
                icon: '👥',
                effect: { leadership: 15, teamEfficiency: 1.25, reputation: 10 },
                effectDesc: '领导力 +15，团队效率 +25%，声望 +10',
                description: '振臂一呼，应者云集',
                prerequisites: ['task_coordinator', 'conflict_solver'],
                unlocks: ['executive']
            },
            time_manager: {
                id: 'time_manager',
                name: '时间管理',
                tree: 'management',
                level: 3,
                tier: 3,
                cost: 3,
                icon: '⏰',
                effect: { energyEfficiency: 1.3, stressReduction: 1.2 },
                effectDesc: '精力效率 +30%，压力减免 +20%',
                description: '合理分配时间，游刃有余',
                prerequisites: ['task_coordinator'],
                unlocks: ['executive']
            },
            executive: {
                id: 'executive',
                name: '运筹帷幄',
                tree: 'management',
                level: 4,
                tier: 4,
                cost: 4,
                icon: '👑',
                effect: { leadership: 25, reputation: 20, strategicVision: 1.4 },
                effectDesc: '领导力 +25，声望 +20，战略眼光 +40%',
                description: '决胜千里之外',
                prerequisites: ['team_leader', 'time_manager'],
                unlocks: []
            },

            // ========== 通用技能 ==========
            quick_learner: {
                id: 'quick_learner',
                name: '快速学习',
                tree: 'general',
                level: 2,
                tier: 2,
                cost: 2,
                icon: '📚',
                effect: { expGain: 1.3, skillPointGain: 1.5 },
                effectDesc: '经验获取 +30%，技能点获取 +50%',
                description: '学而时习之，不亦说乎',
                prerequisites: [],
                unlocks: [],
                isGeneral: true
            },
            stress_resistant: {
                id: 'stress_resistant',
                name: '抗压达人',
                tree: 'general',
                level: 2,
                tier: 2,
                cost: 2,
                icon: '🛡️',
                effect: { stressReduction: 1.4, stressAbility: 20 },
                effectDesc: '压力减免 +40%，抗压能力 +20',
                description: '泰山崩于前而色不变',
                prerequisites: [],
                unlocks: [],
                isGeneral: true
            },
            lucky: {
                id: 'lucky',
                name: '好运',
                tree: 'general',
                level: 3,
                tier: 3,
                cost: 3,
                icon: '🍀',
                effect: { luck: 1.3, eventChance: 1.2 },
                effectDesc: '运气 +30%，事件触发率 +20%',
                description: '运气也是实力的一部分',
                prerequisites: [],
                unlocks: [],
                isGeneral: true
            }
        };
    }

    /**
     * 初始化基础技能
     */
    initializeSkills() {
        // 解锁基础技能
        ['basic_writing', 'basic_social', 'basic_management'].forEach(id => {
            if (this.skillPool[id]) {
                this.unlockedSkills.add(id);
                gameState.skills[id] = true;
            }
        });
    }
    
    /**
     * 从 gameState 恢复技能数据
     */
    restoreFromGameState() {
        if (gameState.skills && typeof gameState.skills === 'object') {
            Object.keys(gameState.skills).forEach(skillId => {
                if (gameState.skills[skillId] && this.skillPool[skillId]) {
                    this.unlockedSkills.add(skillId);
                }
            });
            this.effectCache = this.calculateEffectCache();
        }
    }

    /**
     * 计算技能效果缓存
     */
    calculateEffectCache() {
        const cache = {
            writingEfficiency: 1,
            writingTime: 1,
            writingQuality: 1,
            workAbility: 0,
            workEfficiency: 1,
            taskQuality: 1,
            socialEffect: 1,
            connectionCost: 1,
            trustGain: 1,
            giftEfficiency: 1,
            giftCost: 1,
            teamEfficiency: 1,
            leadership: 0,
            energyEfficiency: 1,
            stressReduction: 1,
            stressAbility: 0,
            reputation: 0,
            connections: 0,
            expGain: 1,
            skillPointGain: 1,
            insight: 1,
            luck: 1,
            eventChance: 1,
            strategicVision: 1
        };

        this.unlockedSkills.forEach(id => {
            const skill = this.skillPool[id];
            if (skill && skill.effect) {
                Object.entries(skill.effect).forEach(([key, value]) => {
                    if (typeof value === 'number') {
                        if (key.includes('Efficiency') || key.includes('Gain') || 
                            key.includes('Reduction') || key.includes('Cost') ||
                            key.includes('Time') || key.includes('Quality') ||
                            key.includes('Effect') || key.includes('Vision') ||
                            key.includes('Luck') || key.includes('Chance') ||
                            key.includes('Efficiency')) {
                            // 乘算效果
                            cache[key] = (cache[key] || 1) * value;
                        } else {
                            // 加算效果
                            cache[key] = (cache[key] || 0) + value;
                        }
                    }
                });
            }
        });

        return cache;
    }

    /**
     * 获取技能效果
     */
    getEffect(effectName) {
        return this.effectCache[effectName] || 1;
    }

    /**
     * 应用任务效果 - 增强版
     */
    applyTaskEffects(task) {
        const effects = {
            timeMultiplier: 1,
            qualityBonus: 0,
            reputationBonus: 0,
            energyCostMultiplier: 1,
            stressGainMultiplier: 1,
            expBonus: 1,
            socialBonus: 1
        };

        // 文字类任务
        if (task.type === 'document' || task.type === 'research') {
            effects.timeMultiplier *= this.getEffect('writingTime');
            effects.qualityBonus += (this.getEffect('writingQuality') - 1) * 0.5;
            effects.reputationBonus += (this.getEffect('writingEfficiency') - 1) * 10;
            effects.expBonus *= this.getEffect('writingEfficiency');
        }

        // 社交类任务
        if (task.type === 'social') {
            effects.timeMultiplier *= 1 / this.getEffect('socialEffect');
            effects.reputationBonus += (this.getEffect('socialEffect') - 1) * 5;
            effects.socialBonus *= this.getEffect('socialEffect');
        }

        // 所有任务
        effects.expBonus *= this.getEffect('expGain');
        effects.energyCostMultiplier *= 1 / this.getEffect('energyEfficiency');
        effects.stressGainMultiplier *= 1 / this.getEffect('stressReduction');
        
        // 通用效率加成
        effects.expBonus *= this.getEffect('workEfficiency');
        effects.qualityBonus += (this.getEffect('taskQuality') - 1) * 0.3;

        // 应用技能组合效果
        const comboEffects = this.getComboEffects();
        comboEffects.forEach(combo => {
            if (combo.bonus) {
                if (combo.bonus.writingEfficiency) {
                    effects.expBonus *= combo.bonus.writingEfficiency;
                }
                if (combo.bonus.socialEffect) {
                    effects.socialBonus *= combo.bonus.socialEffect;
                }
                if (combo.bonus.workEfficiency) {
                    effects.expBonus *= combo.bonus.workEfficiency;
                }
            }
        });

        effects.activeCombos = comboEffects;
        return effects;
    }

    /**
     * 解锁技能
     */
    unlockSkill(skillId) {
        // 检查是否已解锁
        if (this.unlockedSkills.has(skillId)) {
            return { success: false, reason: '已解锁' };
        }

        const skill = this.skillPool[skillId];
        if (!skill) {
            return { success: false, reason: '技能不存在' };
        }

        // 检查前置条件
        if (skill.prerequisites && skill.prerequisites.length > 0) {
            const allPrereqsMet = skill.prerequisites.every(prereq => 
                this.unlockedSkills.has(prereq)
            );
            if (!allPrereqsMet) {
                return { success: false, reason: '前置技能未解锁' };
            }
        }

        // 确保 gameState.skillPoints 存在
        if (typeof gameState.skillPoints === 'undefined') {
            gameState.skillPoints = 5; // 默认5点
        }

        // 检查技能点
        if (gameState.skillPoints < skill.cost) {
            return { success: false, reason: `需要${skill.cost}点技能点，当前${gameState.skillPoints}点` };
        }

        // 消耗技能点
        gameState.skillPoints -= skill.cost;

        // 解锁技能
        this.unlockedSkills.add(skillId);
        
        // 同步到 gameState
        gameState.skills[skillId] = true;
        gameState.skills = { ...gameState.skills };

        // 更新效果缓存
        this.effectCache = this.calculateEffectCache();

        // 应用立即效果
        if (skill.effect.reputation) {
            gameState.modifyStat('reputation', skill.effect.reputation);
        }
        if (skill.effect.connections) {
            gameState.modifyStat('connections', skill.effect.connections);
        }
        if (skill.effect.workAbility) {
            gameState.workAbility += skill.effect.workAbility;
        }
        if (skill.effect.stressAbility) {
            gameState.stressAbility += skill.effect.stressAbility;
        }

        eventBus.emit('skill:unlocked', skill);
        eventBus.emit('skill:cacheUpdated', this.effectCache);

        // 检查是否有新的组合效果激活
        const newCombos = this.getComboEffects();
        if (newCombos.length > 0) {
            eventBus.emit('skill:comboActivated', newCombos);
        }

        return { success: true, skill };
    }

    /**
     * 获取可解锁技能列表
     */
    getAvailableSkills() {
        const available = [];

        Object.values(this.skillPool).forEach(skill => {
            if (this.unlockedSkills.has(skill.id)) return;

            // 检查前置条件
            const prereqsMet = !skill.prerequisites || skill.prerequisites.length === 0 ||
                skill.prerequisites.every(prereq => this.unlockedSkills.has(prereq));

            if (prereqsMet) {
                available.push({
                    ...skill,
                    canUnlock: gameState.skillPoints >= skill.cost
                });
            }
        });

        return available;
    }

    /**
     * 获取技能树数据（用于可视化）
     */
    getSkillTreeData() {
        const trees = {
            writing: { name: '文字路线', skills: [], color: '#3498db' },
            social: { name: '社交路线', skills: [], color: '#e74c3c' },
            management: { name: '管理路线', skills: [], color: '#2ecc71' },
            general: { name: '通用技能', skills: [], color: '#f39c12' }
        };

        Object.values(this.skillPool).forEach(skill => {
            const tree = trees[skill.tree];
            if (tree) {
                tree.skills.push({
                    ...skill,
                    unlocked: this.unlockedSkills.has(skill.id)
                });
            }
        });

        // 按层级排序
        Object.values(trees).forEach(tree => {
            tree.skills.sort((a, b) => a.tier - b.tier);
        });

        return trees;
    }

    /**
     * 获取已解锁技能
     */
    getUnlockedSkills() {
        return Array.from(this.unlockedSkills).map(id => ({
            ...this.skillPool[id],
            unlocked: true
        })).filter(Boolean);
    }

    /**
     * 获取当前技能点
     */
    getSkillPoints() {
        return gameState.skillPoints || 0;
    }

    /**
     * 添加技能点
     */
    addSkillPoints(points) {
        let finalPoints = points;
        // 应用技能点获取加成
        if (this.effectCache.skillPointGain) {
            finalPoints = Math.round(points * this.effectCache.skillPointGain);
        }
        
        gameState.skillPoints = (gameState.skillPoints || 0) + finalPoints;
        eventBus.emit('skill:pointsChanged', { points: gameState.skillPoints });
        
        return finalPoints;
    }

    /**
     * 获取技能组合效果
     */
    getComboEffects() {
        const effects = [];

        // 笔杆子组合
        if (this.unlockedSkills.has('expert_writer') && this.unlockedSkills.has('master_writer')) {
            effects.push({
                name: '妙笔生花',
                desc: '写作任务效率翻倍',
                bonus: { writingEfficiency: 2 },
                icon: '🖊️'
            });
        }

        // 人脉王组合
        if (this.unlockedSkills.has('relationship_master') && this.unlockedSkills.has('gift_guru')) {
            effects.push({
                name: '左右逢源',
                desc: '社交任务效率大幅提升',
                bonus: { socialEffect: 1.5 },
                icon: '🌟'
            });
        }

        // 管理大师组合
        if (this.unlockedSkills.has('team_leader') && this.unlockedSkills.has('executive')) {
            effects.push({
                name: '运筹帷幄',
                desc: '所有任务效率提升',
                bonus: { workEfficiency: 1.3 },
                icon: '🎯'
            });
        }

        // 全能型
        const allTier3 = ['expert_writer', 'relationship_master', 'team_leader'].every(
            id => this.unlockedSkills.has(id)
        );
        if (allTier3) {
            effects.push({
                name: '全能选手',
                desc: '所有能力小幅提升',
                bonus: { workAbility: 10, commAbility: 10 },
                icon: '🏆'
            });
        }

        return effects;
    }

    /**
     * 检查是否有可解锁技能
     */
    hasAvailableSkills() {
        return this.getAvailableSkills().length > 0;
    }

    /**
     * 获取卡牌加成（卡牌系统专用）
     * 根据已解锁技能返回对应类型的经验/声望/人脉倍率
     */
    getCardBonus(activityType) {
        const bonuses = { expBonus: 1, reputationBonus: 1, socialBonus: 1 };
        const unlocked = this.unlockedSkills;

        if (activityType === 'work') {
            if (unlocked.has('basic_writing')) bonuses.expBonus += 0.15;
            if (unlocked.has('speed_writer')) { bonuses.expBonus += 0.1; }
            if (unlocked.has('expert_writer')) { bonuses.expBonus += 0.3; bonuses.reputationBonus += 0.1; }
            if (unlocked.has('master_writer')) { bonuses.expBonus += 0.5; bonuses.reputationBonus += 0.2; }
            if (unlocked.has('task_coordinator')) bonuses.expBonus += 0.2;
            if (unlocked.has('team_leader')) { bonuses.expBonus += 0.25; bonuses.reputationBonus += 0.1; }
            if (unlocked.has('executive')) { bonuses.expBonus += 0.4; bonuses.reputationBonus += 0.2; }
        }

        if (activityType === 'social') {
            if (unlocked.has('basic_social')) bonuses.socialBonus += 0.2;
            if (unlocked.has('charm')) bonuses.socialBonus += 0.15;
            if (unlocked.has('active_listener')) bonuses.socialBonus += 0.3;
            if (unlocked.has('relationship_master')) bonuses.socialBonus += 0.2;
            if (unlocked.has('social_master')) { bonuses.socialBonus += 0.5; bonuses.reputationBonus += 0.15; }
        }

        if (activityType === 'rest') {
            if (unlocked.has('stress_resistant')) { bonuses.expBonus += 0.1; }
        }

        if (activityType === 'study') {
            if (unlocked.has('quick_learner')) bonuses.expBonus += 0.3;
        }

        if (unlocked.has('policy_analyst')) { bonuses.expBonus += 0.25; }

        return bonuses;
    }
}

// 全局单例
const skillSystem = new SkillSystem();