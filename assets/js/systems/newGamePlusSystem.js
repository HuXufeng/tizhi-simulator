/**
 * 新游戏+系统
 * 多周目继承、路线解锁、知识传承
 */
class NewGamePlusSystem {
    constructor() {
        this.NGPLUS_STORAGE_KEY = 'bureaucracy_sim_ngplus';
        this.PROGRESS_STORAGE_KEY = 'bureaucracy_sim_progress';
        
        this.progress = this.loadProgress();
        this.currentWeek = 1;
        this.unlockedContent = this.getUnlockedContent();
        this.warnings = [];
        this.hints = [];
        
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        eventBus.on('ngplus:prepare', (data) => this.prepareNewGamePlus(data));
        eventBus.on('game:start', () => this.onGameStart());
        eventBus.on('ending:triggered', (ending) => this.onEndingTriggered(ending));
        eventBus.on('event:show', (event) => this.injectNGPlusContent(event));
    }

    /**
     * 准备新游戏+
     */
    prepareNewGamePlus(data) {
        this.currentWeek = (this.progress.totalWeek || 0) + 1;
        
        this.generateWarnings();
        this.generateHints();
        this.applyInheritance();
    }

    /**
     * 游戏开始时处理
     */
    onGameStart() {
        if (this.currentWeek > 1) {
            this.injectWarningMessages();
        }
    }

    /**
     * 结局触发时处理
     */
    onEndingTriggered(ending) {
        if (!this.progress.completedEndings) {
            this.progress.completedEndings = [];
        }
        
        if (!this.progress.completedEndings.includes(ending.id)) {
            this.progress.completedEndings.push(ending.id);
        }
        
        this.progress.lastEnding = ending.id;
        this.progress.lastPlayedAt = Date.now();
        this.saveProgress();
        
        this.updateUnlockedContent();
    }

    /**
     * 生成警告信息（第二周目+）
     */
    generateWarnings() {
        this.warnings = [];
        const pastEndings = this.progress.completedEndings || [];
        
        if (this.currentWeek >= 2) {
            if (pastEndings.includes('skyrocket')) {
                this.warnings.push('💡 你曾到达权力的巅峰，但也别忘了高处不胜寒。');
            }
            if (pastEndings.includes('marginal')) {
                this.warnings.push('⚠️ 你曾被边缘化，声望很重要，别再重蹈覆辙。');
            }
            if (pastEndings.includes('fish_king')) {
                this.warnings.push('🐟 摸鱼虽好，可别贪杯哦，健康和人脉同样重要。');
            }
            if (pastEndings.includes('workaholic_burnout')) {
                this.warnings.push('🔥 拼命工作固然好，但身体是革命的本钱。');
            }
            
            // Bad Ending 警告
            if (pastEndings.includes('fired')) {
                this.warnings.push('🚫 你曾被开除——工作能力和声望是饭碗的底线。');
            }
            if (pastEndings.includes('demoted')) {
                this.warnings.push('🏚️ 你曾被发配边疆——没有人脉和声望就会被人遗忘。');
            }
            if (pastEndings.includes('disgraced')) {
                this.warnings.push('💀 你曾从高处跌落——爬得越高，摔得越惨。');
            }
            if (pastEndings.includes('betrayed')) {
                this.warnings.push('🗡️ 你曾被最信任的人背叛——人心难测，不要把所有鸡蛋放在一个篮子里。');
            }
            if (pastEndings.includes('faction_fall')) {
                this.warnings.push('🏛️ 你曾卷入派系斗争——站队是门艺术，站错了就是万劫不复。');
            }
            if (pastEndings.includes('overwork_death')) {
                this.warnings.push('🕯️ 你曾累死在岗位上——工作永远做不完，但命只有一条。');
            }
            if (pastEndings.includes('mental_breakdown')) {
                this.warnings.push('🌀 你曾精神崩溃——压力管理比工作能力更重要。');
            }
            if (pastEndings.includes('midlife_crisis')) {
                this.warnings.push('🍺 你曾一事无成到中年——年轻时多努力一点，老了才不会后悔。');
            }
            if (pastEndings.includes('scandal')) {
                this.warnings.push('📰 你曾身败名裂——出来混总是要还的。');
            }
            if (pastEndings.includes('exile')) {
                this.warnings.push('🏜️ 你曾被彻底遗忘——有些路走错了，就再也没有机会了。');
            }
            if (pastEndings.includes('burnout_quit')) {
                this.warnings.push('🚪 你曾愤然离职——冲动是魔鬼，给自己留好后路再走。');
            }
        }
        
        if (this.currentWeek >= 3 && pastEndings.length >= 3) {
            this.warnings.push('🔮 你的记忆在第三周目觉醒，隐约能预见一些事情的走向...');
        }
    }

    /**
     * 生成提示信息（第三周目+）
     */
    generateHints() {
        this.hints = [];
        
        if (this.currentWeek >= 3) {
            const pastEndings = this.progress.completedEndings || [];
            
            this.hints.push('💭 某些隐藏事件需要特定条件才会触发...');
            
            if (!pastEndings.includes('true_ending')) {
                this.hints.push('⭐ 如果能集齐所有类型的结局，也许能触发特殊的命运...');
            }
            if (!pastEndings.includes('secret_ending')) {
                this.hints.push('🌙 当你拥有一切却选择放下，这才是真正的觉醒。');
            }
            if (!pastEndings.includes('comeback_king')) {
                this.hints.push('🔱 人生总有低谷，触底反弹才是真正的强者。');
            }
        }
        
        if (this.currentWeek >= 2) {
            const careerEndings = ['skyrocket', 'steady_climb', 'plateau', 'marginal'];
            const relationshipEndings = ['kingmaker', 'trusted_advisor', 'lonely_king'];
            const lifeEndings = ['balanced', 'workaholic_burnout', 'fish_king', 'early_retire'];
            
            const pastEndings = this.progress.completedEndings || [];
            
            const hasCareer = careerEndings.some(id => pastEndings.includes(id));
            const hasRelationship = relationshipEndings.some(id => pastEndings.includes(id));
            const hasLife = lifeEndings.some(id => pastEndings.includes(id));
            
            if (hasCareer && hasRelationship && hasLife) {
                this.hints.push('🌟 你已完成三大路线，或许...可以触及那个最终的真相了。');
            }
        }
    }

    /**
     * 注入警告信息
     */
    injectWarningMessages() {
        if (this.warnings.length > 0) {
            setTimeout(() => {
                eventBus.emit('ui:showModal', {
                    title: `📜 第${this.currentWeek}周目 - 记忆觉醒`,
                    content: `
                        <div class="ngplus-warnings">
                            <p class="ngplus-intro">你隐约记得一些事情...</p>
                            ${this.warnings.map(w => `<p class="warning-item">${w}</p>`).join('')}
                            ${this.hints.length > 0 ? `<div class="hint-section"><h4>💡 提示：</h4>${this.hints.map(h => `<p class="hint-item">${h}</p>`).join('')}</div>` : ''}
                        </div>
                    `,
                    width: '90%',
                    maxWidth: '450px',
                    buttons: [{ text: '我明白了', callback: () => {} }]
                });
            }, 1500);
        }
    }

    /**
     * 应用继承效果
     */
    applyInheritance() {
        if (this.currentWeek >= 2) {
            gameState.reputation = Math.min(100, gameState.reputation + 10);
        }
        
        if (this.currentWeek >= 3) {
            gameState.skillPoints += 5;
        }
        
        if (this.currentWeek >= 4) {
            gameState.exp += 100;
        }
        
        const completedCount = (this.progress.completedEndings || []).length;
        if (completedCount >= 3) {
            gameState.flags.skillExpBonus = 0.15;
        }
        if (completedCount >= 5) {
            gameState.connections = Math.min(gameState.maxConnections, gameState.connections + 10);
        }
    }

    /**
     * 获取解锁内容
     */
    getUnlockedContent() {
        const content = {
            week2: [],
            week3: [],
            week4: []
        };
        
        const completedCount = (this.progress.completedEndings || []).length;
        const badCount = (this.progress.completedEndings || []).filter(id =>
            ['fired','demoted','disgraced','betrayed','faction_fall','overwork_death','mental_breakdown','midlife_crisis','scandal','exile','burnout_quit'].includes(id)
        ).length;
        
        if (completedCount >= 1) {
            content.week2.push('warning_system', 'reputation_boost');
        }
        if (completedCount >= 3) {
            content.week2.push('hint_system', 'skill_exp_boost');
        }
        if (completedCount >= 5) {
            content.week2.push('connection_boost');
        }
        if (completedCount >= 8) {
            content.week3.push('secret_dialogue', 'foreshadowing');
        }
        if (completedCount >= 10) {
            content.week3.push('true_ending_path');
        }
        if (completedCount >= 12) {
            content.week4.push('roguelike_mode', 'all_backgrounds');
        }
        
        // Bad Ending 收集奖励
        if (badCount >= 1) {
            content.week2.push('bad_ending_wisdom');
        }
        if (badCount >= 3) {
            content.week2.push('avoid_failure_hint');
        }
        if (badCount >= 5) {
            content.week3.push('dark_path_insight');
        }
        
        return content;
    }

    /**
     * 更新解锁内容
     */
    updateUnlockedContent() {
        this.unlockedContent = this.getUnlockedContent();
        this.saveProgress();
    }

    /**
     * 检查内容是否解锁
     */
    isContentUnlocked(contentId) {
        return Object.values(this.unlockedContent).some(arr => arr.includes(contentId));
    }

    /**
     * 注入新游戏+内容到事件
     */
    injectNGPlusContent(event) {
        if (this.currentWeek < 3) return event;
        
        if (this.isContentUnlocked('secret_dialogue') && event.options) {
            event.options = event.options.map(opt => ({
                ...opt,
                text: this.modifyDialogueWithForeshadowing(opt.text)
            }));
        }
        
        if (this.isContentUnlocked('foreshadowing') && event.description) {
            event.description = this.addForeshadowing(event.description);
        }
        
        return event;
    }

    /**
     * 修改对话添加预兆
     */
    modifyDialogueWithForeshadowing(text) {
        const foreshadowings = [
            '（似曾相识的感觉...）',
            '（这场景好像在哪里见过...）',
            '（命运似乎早有安排...）'
        ];
        
        if (Math.random() < 0.2) {
            const foreshadow = foreshadowings[Math.floor(Math.random() * foreshadowings.length)];
            return text + ' ' + foreshadow;
        }
        
        return text;
    }

    /**
     * 添加预兆内容
     */
    addForeshadowing(description) {
        const pastEndings = this.progress.completedEndings || [];
        
        if (pastEndings.includes('dark_ending') && Math.random() < 0.15) {
            return description + '\n\n（一阵不安的感觉涌上心头，仿佛有什么危险在逼近...）';
        }
        
        if (pastEndings.includes('comeback_king') && Math.random() < 0.15) {
            return description + '\n\n（这个困境，似乎是命运的考验...）';
        }
        
        return description;
    }

    /**
     * 获取新游戏+信息面板
     */
    getNGPlusInfoPanel() {
        const week = this.currentWeek;
        const completedCount = (this.progress.completedEndings || []).length;
        const badCount = (this.progress.completedEndings || []).filter(id =>
            ['fired','demoted','disgraced','betrayed','faction_fall','overwork_death','mental_breakdown','midlife_crisis','scandal','exile','burnout_quit'].includes(id)
        ).length;
        
        let content = `
            <div class="ngplus-panel">
                <div class="ngplus-header">
                    <span class="ngplus-week">第 ${week} 周目</span>
                </div>
                <div class="ngplus-stats">
                    <div class="stat">
                        <span class="stat-value">${completedCount}</span>
                        <span class="stat-label">结局</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${badCount}</span>
                        <span class="stat-label">失败结局</span>
                    </div>
                </div>
        `;
        
        if (this.unlockedContent.week2.length > 0) {
            content += '<div class="ngplus-bonuses">';
            if (this.unlockedContent.week2.includes('reputation_boost')) {
                content += '<span class="bonus-tag">声望+10</span>';
            }
            if (this.unlockedContent.week2.includes('skill_exp_boost')) {
                content += '<span class="bonus-tag">技能经验+15%</span>';
            }
            if (this.unlockedContent.week2.includes('connection_boost')) {
                content += '<span class="bonus-tag">人脉+10</span>';
            }
            if (this.unlockedContent.week2.includes('warning_system')) {
                content += '<span class="bonus-tag">警告系统</span>';
            }
            if (this.unlockedContent.week2.includes('hint_system')) {
                content += '<span class="bonus-tag">提示系统</span>';
            }
            if (this.unlockedContent.week2.includes('bad_ending_wisdom')) {
                content += '<span class="bonus-tag failure-tag">失败预警</span>';
            }
            if (this.unlockedContent.week2.includes('avoid_failure_hint')) {
                content += '<span class="bonus-tag failure-tag">避坑指南</span>';
            }
            content += '</div>';
        }
        
        if (this.unlockedContent.week3.length > 0) {
            content += '<div class="ngplus-bonuses week3">';
            if (this.unlockedContent.week3.includes('secret_dialogue')) {
                content += '<span class="bonus-tag epic">隐藏对话</span>';
            }
            if (this.unlockedContent.week3.includes('true_ending_path')) {
                content += '<span class="bonus-tag epic">真结局路线</span>';
            }
            if (this.unlockedContent.week3.includes('dark_path_insight')) {
                content += '<span class="bonus-tag epic">命运洞察</span>';
            }
            content += '</div>';
        }
        
        content += '</div>';
        
        return content;
    }

    /**
     * 显示新游戏+信息
     */
    showNGPlusInfo() {
        eventBus.emit('ui:showModal', {
            title: '🔮 新游戏+ 信息',
            content: this.getNGPlusInfoPanel(),
            width: '90%',
            maxWidth: '400px',
            buttons: [
                { 
                    text: '📖 结局收集', 
                    callback: () => endingSystem.showEndingCollection() 
                },
                { text: '返回', callback: () => {} }
            ]
        });
    }

    /**
     * 加载进度
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem(this.PROGRESS_STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('加载新游戏+进度失败:', e);
        }
        
        return {
            totalWeek: 0,
            completedEndings: [],
            lastEnding: null,
            lastPlayedAt: null
        };
    }

    /**
     * 保存进度
     */
    saveProgress() {
        try {
            localStorage.setItem(this.PROGRESS_STORAGE_KEY, JSON.stringify(this.progress));
        } catch (e) {
            console.error('保存新游戏+进度失败:', e);
        }
    }

    /**
     * 重置新游戏+进度
     */
    resetProgress() {
        this.progress = {
            totalWeek: 0,
            completedEndings: [],
            lastEnding: null,
            lastPlayedAt: null
        };
        this.unlockedContent = { week2: [], week3: [], week4: [] };
        this.saveProgress();
    }

    /**
     * 获取背景解锁状态
     */
    getUnlockedBackgrounds() {
        const completedCount = (this.progress.completedEndings || []).length;
        
        return {
            exam_winner: true,
            talent_import: completedCount >= 3,
            military_transfer: completedCount >= 5,
            borrowed_official: completedCount >= 8,
            connected: completedCount >= 12
        };
    }

    /**
     * 检查背景是否可用
     */
    isBackgroundAvailable(backgroundId) {
        const unlocked = this.getUnlockedBackgrounds();
        return unlocked[backgroundId] || false;
    }

    /**
     * 获取下一个解锁内容提示
     */
    getNextUnlockHint() {
        const completedCount = (this.progress.completedEndings || []).length;
        const hints = [];
        
        if (completedCount < 1) hints.push('再完成1个结局解锁第2周目内容');
        else if (completedCount < 3) hints.push('再完成' + (3 - completedCount) + '个结局解锁更多内容');
        else if (completedCount < 5) hints.push('再完成' + (5 - completedCount) + '个结局解锁人脉加成');
        else if (completedCount < 8) hints.push('再完成' + (8 - completedCount) + '个结局解锁隐藏对话');
        else if (completedCount < 10) hints.push('再完成' + (10 - completedCount) + '个结局解锁真结局路线');
        else if (completedCount < 12) hints.push('再完成' + (12 - completedCount) + '个结局解锁所有背景');
        else hints.push('🎉 所有内容已解锁！');
        
        return hints[0];
    }
}

// 全局单例
const ngPlusSystem = new NewGamePlusSystem();
