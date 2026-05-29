/**
 * 游戏状态管理
 * 集中管理所有游戏数据，提供读写接口
 */
class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        // 基础属性
        this.month = 1;
        this.phase = 'early';
        this.energy = 100;
        this.maxEnergy = 100;
        this.stress = 0;
        this.maxStress = 100;
        this.health = 100;
        this.maxHealth = 100;

        // 能力属性
        this.workAbility = 50;
        this.execAbility = 50;
        this.commAbility = 50;
        this.stressAbility = 50;

        // 社交属性
        this.reputation = 50;
        this.connections = 20;
        this.maxConnections = 50;

        // 经济属性
        this.money = 3000;
        this.monthlySalary = 3000;

        // 职位
        this.position = 1; // 1=科员, 2=副科, 3=正科, 4=副处, 5=正处
        this.positionName = '科员';

        // 技能
        this.skills = {};
        this.skillPoints = 5; // 初始5点技能点
        this.exp = 0;

        // 关系
        this.relationships = {};

        // 任务
        this.currentTask = null;
        this.completedTasks = [];
        this.taskQueue = [];

        // 事件
        this.pendingEvents = [];
        this.eventHistory = [];

        // 成就
        this.achievements = [];
        this.activeTitle = null;

        // 摸鱼计数
        this.slackCount = 0;

        // 游戏阶段
        this.phase = 'intro'; // intro | prologue | main | ending
        this.flags = {};      // 剧情标记
    }

    /**
     * 修改属性（带边界检查）
     */
    modifyStat(stat, delta) {
        if (this[stat] !== undefined) {
            const maxKey = 'max' + stat.charAt(0).toUpperCase() + stat.slice(1);
            const max = this[maxKey] !== undefined ? this[maxKey] : Infinity;
            this[stat] = Math.max(0, Math.min(max, this[stat] + delta));
            eventBus.emit('stat:changed', { stat, value: this[stat], delta });
        }
    }

    /**
     * 获取序列化数据（用于存档）
     */
    toJSON() {
        return {
            month: this.month,
            phase: this.phase,
            energy: this.energy,
            stress: this.stress,
            health: this.health,
            workAbility: this.workAbility,
            execAbility: this.execAbility,
            commAbility: this.commAbility,
            stressAbility: this.stressAbility,
            reputation: this.reputation,
            connections: this.connections,
            money: this.money,
            position: this.position,
            positionName: this.positionName,
            skills: this.skills,
            skillPoints: this.skillPoints,
            exp: this.exp,
            relationships: this.relationships,
            completedTasks: this.completedTasks,
            eventHistory: this.eventHistory,
            achievements: this.achievements,
            activeTitle: this.activeTitle,
            slackCount: this.slackCount,
            phase: this.phase,
            flags: this.flags,
            savedAt: Date.now()
        };
    }

    /**
     * 从存档恢复
     */
    fromJSON(data) {
        Object.assign(this, data);
        eventBus.emit('state:loaded', this);
    }
}

// 全局单例
const gameState = new GameState();