/**
 * 任务系统
 * 管理任务生成、分配、执行和完成
 */
class TaskSystem {
    constructor() {
        this.taskTemplates = {
            document: {
                type: 'document',
                name: '公文处理',
                icon: '📋',
                description: '处理日常公文流转',
                baseTime: 2,       // 基础消耗时间槽数
                energyCost: 15,
                stressGain: 5,
                rewards: { exp: 20, reputation: 2 },
                activityType: 'work'
            },
            meeting: {
                type: 'meeting',
                name: '会议服务',
                icon: '👥',
                description: '筹备和参加各类会议',
                baseTime: 2,
                energyCost: 20,
                stressGain: 8,
                rewards: { exp: 25, reputation: 3, connections: 2 },
                activityType: 'work'
            },
            research: {
                type: 'research',
                name: '调研任务',
                icon: '🔍',
                description: '外出调研收集资料',
                baseTime: 3,
                energyCost: 25,
                stressGain: 3,
                rewards: { exp: 30, reputation: 5, connections: 3 },
                activityType: 'work'
            },
            social: {
                type: 'social',
                name: '社交应酬',
                icon: '🍵',
                description: '与同事或领导交流',
                baseTime: 1,
                energyCost: 10,
                stressGain: -5,
                rewards: { connections: 5 },
                activityType: 'social'
            },
            rest: {
                type: 'rest',
                name: '休息放松',
                icon: '☕',
                description: '喝杯茶，放松一下',
                baseTime: 1,
                energyCost: -20,
                stressGain: -15,
                rewards: {},
                activityType: 'rest'
            },
            study: {
                type: 'study',
                name: '学习充电',
                icon: '📚',
                description: '学习政策文件或业务知识',
                baseTime: 2,
                energyCost: 12,
                stressGain: 3,
                rewards: { exp: 35 },
                activityType: 'study'
            },
            report: {
                type: 'report',
                name: '撰写报告',
                icon: '📝',
                description: '撰写工作总结或调研报告',
                baseTime: 3,
                energyCost: 20,
                stressGain: 10,
                rewards: { exp: 35, reputation: 6 },
                activityType: 'work'
            },
            inspection: {
                type: 'inspection',
                name: '迎接检查',
                icon: '📊',
                description: '准备上级检查材料',
                baseTime: 2,
                energyCost: 25,
                stressGain: 15,
                rewards: { exp: 40, reputation: 8, connections: 3 },
                activityType: 'work'
            },
            speech: {
                type: 'speech',
                name: '起草讲话稿',
                icon: '🎤',
                description: '为领导起草讲话稿',
                baseTime: 3,
                energyCost: 22,
                stressGain: 12,
                rewards: { exp: 45, reputation: 10, connections: 4 },
                activityType: 'work'
            },
            training: {
                type: 'training',
                name: '业务培训',
                icon: '🎓',
                description: '参加或组织业务培训',
                baseTime: 2,
                energyCost: 15,
                stressGain: -5,
                rewards: { exp: 30, connections: 5 },
                activityType: 'work'
            }
        };

        this.currentTask = null;
        this.dailyTasks = [];
    }

    /**
     * 生成每日任务
     */
    generateMonthlyTasks() {
        this.dailyTasks = [];

        const month = gameState.month;
        const rep = gameState.reputation;

        const unlockedWorkTypes = ['document', 'meeting', 'research'];
        if (month >= 3) unlockedWorkTypes.push('report');
        if (month >= 5) unlockedWorkTypes.push('training');
        if (month >= 6) unlockedWorkTypes.push('inspection');
        if (month >= 9) unlockedWorkTypes.push('speech');

        // 声望高时增加高级任务权重
        const weighted = [];
        unlockedWorkTypes.forEach(type => {
            const baseWeight = type === 'document' ? 3 : type === 'meeting' ? 2 : 1;
            const bonusWeight = rep >= 30 && (type === 'speech' || type === 'inspection') ? 2 : 0;
            for (let i = 0; i < baseWeight + bonusWeight; i++) weighted.push(type);
        });

        // 生成 6~8 个工作任务
        const count = 6 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const type = weighted[Math.floor(Math.random() * weighted.length)];
            const template = this.taskTemplates[type];
            const task = this._createTaskFromTemplate(template);

            if (month >= 12) {
                task.rewards = Object.fromEntries(
                    Object.entries(task.rewards).map(([k, v]) => [k, Math.round(v * 1.3)])
                );
            }

            this.dailyTasks.push(task);
        }

        eventBus.emit('task:monthlyGenerated', this.dailyTasks);
        return this.dailyTasks;
    }

    /**
     * 开始执行任务
     */
    startTask(task) {
        this.currentTask = task;
        eventBus.emit('task:started', task);
    }

    /**
     * 完成任务
     */
    completeTask(performance = 1.0) {
        if (!this.currentTask) return;

        const task = this.currentTask;
        const efficiency = timeSystem.getEfficiency(task.activityType);
        
        // 获取技能效果
        const skillEffects = skillSystem.applyTaskEffects(task);
        
        // 计算最终奖励
        const rewards = {};
        Object.entries(task.rewards).forEach(([key, value]) => {
            let finalValue = Math.round(value * efficiency * performance);
            
            // 应用技能效果
            if (key === 'exp' && skillEffects.expBonus) {
                finalValue = Math.round(finalValue * skillEffects.expBonus);
            }
            if (key === 'reputation' && skillEffects.reputationBonus) {
                finalValue = Math.round(finalValue * skillEffects.reputationBonus);
            }
            if (key === 'connections' && skillEffects.socialBonus) {
                finalValue = Math.round(finalValue * skillEffects.socialBonus);
            }
            
            rewards[key] = finalValue;
        });

        // 应用奖励
        Object.entries(rewards).forEach(([key, value]) => {
            if (key === 'exp') gameState.exp += value;
            else if (key === 'reputation') gameState.modifyStat('reputation', value);
            else if (key === 'connections') gameState.modifyStat('connections', value);
        });

        // 消耗精力（应用技能效果）
        let energyCost = task.energyCost;
        if (skillEffects.energyCostMultiplier) {
            energyCost = Math.round(energyCost * skillEffects.energyCostMultiplier);
        }
        gameState.modifyStat('energy', -energyCost);

        // 压力变化（应用技能效果）
        let stressGain = task.stressGain;
        if (skillEffects.stressGainMultiplier) {
            stressGain = Math.round(stressGain * skillEffects.stressGainMultiplier);
        }
        gameState.modifyStat('stress', stressGain);

        // 记录完成
        gameState.completedTasks.push({
            type: task.type,
            name: task.name,
            month: gameState.month,
            performance,
            skillEffects: skillEffects
        });

        this.currentTask = null;
        eventBus.emit('task:completed', { task, rewards, performance, skillEffects });
        saveSystem.autoSave();

        return { rewards, skillEffects };
    }

    /**
     * 获取可用任务列表
     */
    getAvailableTasks() {
        const tasks = [...this.dailyTasks];
        // 始终可以休息和学习
        tasks.push(this._createTaskFromTemplate(this.taskTemplates.rest));
        tasks.push(this._createTaskFromTemplate(this.taskTemplates.study));
        return tasks;
    }

    _createTaskFromTemplate(template) {
        return {
            id: Date.now() + Math.random(),
            type: template.type,
            name: template.name,
            icon: template.icon,
            description: template.description,
            baseTime: template.baseTime,
            energyCost: template.energyCost,
            stressGain: template.stressGain,
            rewards: { ...template.rewards },
            activityType: template.activityType
        };
    }

    getCardType(task) {
        if (task.activityType === 'work') return 'work';
        return task.activityType;
    }
}

// 全局单例
const taskSystem = new TaskSystem();