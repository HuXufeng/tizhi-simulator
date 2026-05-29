/**
 * 成就与称号系统
 * 多维度成就追踪和称号展示
 */
class AchievementSystem {
    constructor() {
        this.achievements = this.createAchievements();
        this.unlockedAchievements = new Set();
        this.activeTitle = null;
        
        // 监听事件
        eventBus.on('game:start', () => this.checkAchievements());
        eventBus.on('task:completed', () => this.checkAchievements());
        eventBus.on('skill:unlocked', () => this.checkAchievements());
        eventBus.on('event:resolved', () => this.checkAchievements());
        eventBus.on('game:monthStart', () => this.checkAchievements());
    }

    /**
     * 创建成就列表
     */
    createAchievements() {
        return {
            // 职业成就
            career: [
                {
                    id: 'first_day',
                    name: '新的开始',
                    description: '完成第一天的工作',
                    condition: (state) => state.month >= 1,
                    icon: '🌅',
                    rarity: 'common'
                },
                {
                    id: 'week_one',
                    name: '一周新人',
                    description: '坚持工作7天',
                    condition: (state) => state.month >= 7,
                    icon: '📅',
                    rarity: 'common'
                },
                {
                    id: 'month_one',
                    name: '月度员工',
                    description: '完成一个月的试用期',
                    condition: (state) => state.month >= 30,
                    icon: '🗓️',
                    rarity: 'rare'
                },
                {
                    id: 'year_one',
                    name: '一年老员工',
                    description: '在单位工作满一年',
                    condition: (state) => state.month >= 365,
                    icon: '🏆',
                    rarity: 'epic'
                },
                {
                    id: 'promotion_1',
                    name: '小有成就',
                    description: '获得第一次晋升',
                    condition: (state) => state.position >= 2,
                    icon: '⬆️',
                    rarity: 'rare'
                },
                {
                    id: 'promotion_2',
                    name: '仕途得意',
                    description: '晋升至正科级',
                    condition: (state) => state.position >= 3,
                    icon: '🚀',
                    rarity: 'epic'
                },
                {
                    id: 'promotion_3',
                    name: '位高权重',
                    description: '晋升至副处级',
                    condition: (state) => state.position >= 4,
                    icon: '👑',
                    rarity: 'legendary'
                }
            ],
            
            // 社交成就
            social: [
                {
                    id: 'friend_maker',
                    name: '广交朋友',
                    description: '人脉达到30',
                    condition: (state) => state.connections >= 30,
                    icon: '🤝',
                    rarity: 'common'
                },
                {
                    id: 'people_person',
                    name: '人脉广泛',
                    description: '人脉达到50',
                    condition: (state) => state.connections >= 50,
                    icon: '🌐',
                    rarity: 'rare'
                },
                {
                    id: 'social_butterfly',
                    name: '社交达人',
                    description: '人脉达到满值',
                    condition: (state) => state.connections >= state.maxConnections,
                    icon: '🦋',
                    rarity: 'epic'
                }
            ],
            
            // 文字成就
            writing: [
                {
                    id: 'document_master',
                    name: '公文达人',
                    description: '完成50次公文处理',
                    condition: () => this.countTasksByType('document') >= 50,
                    icon: '📋',
                    rarity: 'common'
                },
                {
                    id: 'research_guru',
                    name: '调研专家',
                    description: '完成30次调研任务',
                    condition: () => this.countTasksByType('research') >= 30,
                    icon: '🔍',
                    rarity: 'rare'
                },
                {
                    id: 'meeting_host',
                    name: '会议达人',
                    description: '完成50次会议服务',
                    condition: () => this.countTasksByType('meeting') >= 50,
                    icon: '👥',
                    rarity: 'rare'
                }
            ],
            
            // 经济成就
            economy: [
                {
                    id: 'first_10000',
                    name: '万元户',
                    description: '存款首次超过10000元',
                    condition: (state) => state.money >= 10000,
                    icon: '💵',
                    rarity: 'common'
                },
                {
                    id: 'first_50000',
                    name: '小有积蓄',
                    description: '存款超过50000元',
                    condition: (state) => state.money >= 50000,
                    icon: '💰',
                    rarity: 'rare'
                },
                {
                    id: 'first_100000',
                    name: '百万富翁',
                    description: '存款达到100000元',
                    condition: (state) => state.money >= 100000,
                    icon: '💎',
                    rarity: 'epic'
                }
            ],
            
            // 技能成就
            skill: [
                {
                    id: 'first_skill',
                    name: '初学者',
                    description: '解锁第一个非基础技能',
                    condition: () => skillSystem.unlockedSkills.size > 3,
                    icon: '⭐',
                    rarity: 'common'
                },
                {
                    id: 'skill_collector',
                    name: '技能收集者',
                    description: '解锁10个技能',
                    condition: () => skillSystem.unlockedSkills.size >= 10,
                    icon: '🎯',
                    rarity: 'rare'
                },
                {
                    id: 'skill_master',
                    name: '技能大师',
                    description: '解锁所有技能',
                    condition: () => skillSystem.unlockedSkills.size >= Object.keys(skillSystem.skillPool).length,
                    icon: '🏅',
                    rarity: 'legendary'
                }
            ],
            
            // 特殊成就
            special: [
                {
                    id: 'slacker_10',
                    name: '摸鱼新手',
                    description: '摸鱼10次',
                    condition: (state) => state.slackCount >= 10,
                    icon: '🐟',
                    rarity: 'common'
                },
                {
                    id: 'slacker_50',
                    name: '摸鱼达人',
                    description: '摸鱼50次',
                    condition: (state) => state.slackCount >= 50,
                    icon: '🐠',
                    rarity: 'rare'
                },
                {
                    id: 'slacker_100',
                    name: '摸鱼大师',
                    description: '摸鱼100次',
                    condition: (state) => state.slackCount >= 100,
                    icon: '🐡',
                    rarity: 'epic'
                },
                {
                    id: 'high_reputation',
                    name: '德高望重',
                    description: '声望达到100',
                    condition: (state) => state.reputation >= 100,
                    icon: '🌟',
                    rarity: 'rare'
                },
                {
                    id: 'workaholic',
                    name: '工作狂人',
                    description: '单日完成任务超过5个',
                    condition: () => this.getTasksCompletedToday() > 5,
                    icon: '⚡',
                    rarity: 'epic'
                }
            ],
            
            // 隐藏成就
            hidden: [
                {
                    id: 'lucky_player',
                    name: '幸运儿',
                    description: '触发一个隐藏事件',
                    condition: () => eventSystem.eventHistory.some(e => e.id === 'secret_file'),
                    icon: '🍀',
                    rarity: 'epic'
                },
                {
                    id: 'survivor',
                    name: '生存大师',
                    description: '连续工作30天不休息',
                    condition: (state) => state.month >= 30 && state.slackCount === 0,
                    icon: '🛡️',
                    rarity: 'legendary'
                },
                {
                    id: 'balanced_worker',
                    name: '平衡大师',
                    description: '同时达到声望60、人脉40、金钱20000',
                    condition: (state) => state.reputation >= 60 && state.connections >= 40 && state.money >= 20000,
                    icon: '⚖️',
                    rarity: 'epic'
                }
            ]
        };
    }

    /**
     * 检查成就
     */
    checkAchievements() {
        let newAchievements = [];
        
        Object.entries(this.achievements).forEach(([category, achievements]) => {
            achievements.forEach(achievement => {
                if (!this.unlockedAchievements.has(achievement.id)) {
                    try {
                        if (achievement.condition(gameState)) {
                            this.unlockAchievement(achievement);
                            newAchievements.push(achievement);
                        }
                    } catch (e) {
                        // 忽略条件检查错误
                    }
                }
            });
        });
        
        return newAchievements;
    }

    /**
     * 解锁成就
     */
    unlockAchievement(achievement) {
        this.unlockedAchievements.add(achievement.id);
        
        // 添加到游戏状态
        if (!gameState.achievements) {
            gameState.achievements = [];
        }
        gameState.achievements.push({
            id: achievement.id,
            name: achievement.name,
            icon: achievement.icon,
            day: gameState.month
        });
        
        // 发送事件
        eventBus.emit('achievement:unlocked', achievement);
        eventBus.emit('audio:play', { type: 'levelup' });
        
        // 显示通知
        this.showAchievementNotification(achievement);
    }

    /**
     * 显示成就通知
     */
    showAchievementNotification(achievement) {
        const content = `
            <div class="achievement-notification">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                </div>
                <div class="achievement-rarity rarity-${achievement.rarity}">${this.getRarityName(achievement.rarity)}</div>
            </div>
        `;
        
        eventBus.emit('ui:showModal', {
            title: '🎉 成就解锁！',
            content,
            buttons: [{ text: '太棒了！', callback: () => {} }]
        });
    }

    /**
     * 获取稀有度名称
     */
    getRarityName(rarity) {
        const names = {
            common: '普通',
            rare: '稀有',
            epic: '史诗',
            legendary: '传说'
        };
        return names[rarity] || rarity;
    }

    /**
     * 获取稀有度颜色
     */
    getRarityColor(rarity) {
        const colors = {
            common: '#888',
            rare: '#3498db',
            epic: '#9b59b6',
            legendary: '#f39c12'
        };
        return colors[rarity] || '#888';
    }

    /**
     * 统计特定类型任务完成数
     */
    countTasksByType(type) {
        if (!gameState.completedTasks) return 0;
        return gameState.completedTasks.filter(t => t.type === type).length;
    }

    /**
     * 获取今日完成任务数
     */
    getTasksCompletedToday() {
        if (!gameState.completedTasks) return 0;
        return gameState.completedTasks.filter(t => t.day === gameState.month).length;
    }

    /**
     * 获取所有已解锁成就
     */
    getUnlockedAchievements() {
        return Array.from(this.unlockedAchievements);
    }

    /**
     * 获取成就统计
     */
    getStatistics() {
        let total = 0;
        let unlocked = 0;
        
        Object.values(this.achievements).forEach(achievements => {
            achievements.forEach(() => total++);
        });
        
        unlocked = this.unlockedAchievements.size;
        
        return {
            total,
            unlocked,
            percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0
        };
    }

    /**
     * 显示成就界面
     */
    showAchievementUI() {
        const stats = this.getStatistics();
        const categories = {
            career: '职业成就',
            social: '社交成就',
            writing: '文字成就',
            economy: '经济成就',
            skill: '技能成就',
            special: '特殊成就',
            hidden: '隐藏成就'
        };
        
        let content = `
            <div class="achievement-container">
                <div class="achievement-stats">
                    <div class="stat-item">
                        <span class="stat-value">${stats.unlocked}</span>
                        <span class="stat-label">已解锁</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.total}</span>
                        <span class="stat-label">总成就</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.percentage}%</span>
                        <span class="stat-label">完成率</span>
                    </div>
                </div>
        `;
        
        Object.entries(categories).forEach(([key, name]) => {
            const achievements = this.achievements[key] || [];
            const categoryUnlocked = achievements.filter(a => this.unlockedAchievements.has(a.id)).length;
            
            content += `
                <div class="achievement-category">
                    <h4>${name} (${categoryUnlocked}/${achievements.length})</h4>
                    <div class="achievement-list">
                        ${achievements.map(a => this.renderAchievement(a)).join('')}
                    </div>
                </div>
            `;
        });
        
        content += '</div>';
        
        eventBus.emit('ui:showModal', {
            title: '🏆 成就',
            content,
            width: '95%',
            maxWidth: '500px',
            buttons: [{ text: '关闭', callback: () => {} }]
        });
    }

    /**
     * 渲染单个成就
     */
    renderAchievement(achievement) {
        const isUnlocked = this.unlockedAchievements.has(achievement.id);
        const rarityColor = this.getRarityColor(achievement.rarity);
        
        return `
            <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}" 
                 style="--rarity-color: ${rarityColor}">
                <div class="achievement-item-icon">${achievement.icon}</div>
                <div class="achievement-item-info">
                    <div class="achievement-item-name">${achievement.name}</div>
                    <div class="achievement-item-desc">${isUnlocked ? achievement.description : '???'}</div>
                </div>
            </div>
        `;
    }

    // ========== 称号系统 ==========

    /**
     * 称号列表
     */
    titles = {
        '新人': {
            condition: (state) => state.month < 7,
            description: '刚入职的新人'
        },
        '勤务员': {
            condition: (state) => state.month >= 7 && state.reputation < 30,
            description: '勤勤恳恳的普通员工'
        },
        '得力干将': {
            condition: (state) => state.reputation >= 50 && state.workAbility >= 70,
            description: '领导的左膀右臂'
        },
        '人脉达人': {
            condition: (state) => state.connections >= 40,
            description: '交际广泛，人脉通天'
        },
        '笔杆子': {
            condition: (state) => skillSystem.unlockedSkills.has('expert_writer'),
            description: '文字能力出类拔萃'
        },
        '老油条': {
            condition: (state) => state.slackCount >= 50,
            description: '深谙摸鱼之道'
        },
        '劳模': {
            condition: (state) => state.slackCount === 0 && state.month >= 30,
            description: '任劳任怨的工作狂'
        },
        '社交高手': {
            condition: (state) => skillSystem.unlockedSkills.has('social_master'),
            description: '左右逢源，八面玲珑'
        },
        '管理精英': {
            condition: (state) => skillSystem.unlockedSkills.has('executive'),
            description: '运筹帷幄，决胜千里'
        },
        '全能选手': {
            condition: (state) => {
                const tier3 = ['expert_writer', 'relationship_master', 'team_leader'];
                return tier3.every(id => skillSystem.unlockedSkills.has(id));
            },
            description: '德智体美劳全面发展'
        },
        '前途无量': {
            condition: (state) => state.position >= 3,
            description: '仕途一片光明'
        },
        '边缘人物': {
            condition: (state) => state.reputation < 20,
            description: '被遗忘在角落'
        }
    };

    /**
     * 更新当前称号
     */
    updateTitle() {
        let newTitle = null;
        
        for (const [titleName, titleData] of Object.entries(this.titles)) {
            try {
                if (titleData.condition(gameState)) {
                    newTitle = titleName;
                    break;
                }
            } catch (e) {}
        }
        
        if (newTitle && newTitle !== this.activeTitle) {
            const oldTitle = this.activeTitle;
            this.activeTitle = newTitle;
            gameState.activeTitle = newTitle;
            
            if (oldTitle) {
                eventBus.emit('title:changed', { oldTitle, newTitle });
                eventBus.emit('ui:showMessage', {
                    text: `称号变更：${oldTitle} → ${newTitle}`,
                    type: 'success'
                });
            }
        }
    }

    /**
     * 获取当前称号
     */
    getCurrentTitle() {
        return this.activeTitle || '新人';
    }

    /**
     * 获取称号描述
     */
    getTitleDescription(titleName) {
        const title = this.titles[titleName];
        return title ? title.description : '';
    }
}

// 全局单例
const achievementSystem = new AchievementSystem();
