/**
 * 游戏目标追踪系统
 * 让玩家始终明确：短期该做什么、中期朝哪走、长期追求什么
 */
class GameGoals {
    constructor() {
        this.goalsCache = null;
        this.lastRouteNotifyDay = 0;
        this.routeChangeThreshold = 10;
        this.lastRank = null;

        this.init();
    }

    init() {
        eventBus.on('game:monthStart', () => {
            this.goalsCache = null;
            this.checkMilestoneNotifications();
            this.checkRouteNotification();
        });

        eventBus.on('task:completed', () => {
            this.goalsCache = null;
        });
    }

    /**
     * 计算所有目标数据（缓存）
     */
    computeGoals() {
        if (this.goalsCache) return this.goalsCache;

        const state = gameState;
        const routes = this.computeRouteScores();
        const dominantRoute = this.getDominantRoute(routes);

        this.goalsCache = {
            routes,
            dominantRoute,
            routeLabel: this.getRouteLabel(dominantRoute),
            shortTerm: this.getShortTermGoals(state),
            midTerm: this.getMidTermMilestones(state),
            endingProximity: this.getEndingProximity(state),
            ngPlusHint: ngPlusSystem.getNextUnlockHint(),
            overallProgress: this.getOverallProgress(state)
        };

        return this.goalsCache;
    }

    /**
     * 计算四大路线得分和百分比
     */
    computeRouteScores() {
        const state = gameState;
        const raw = {
            career: Math.round(state.reputation * 1.5 + state.position * 20 + state.workAbility * 0.5),
            relationship: Math.round(state.connections * 2 + state.commAbility * 0.8),
            principle: Math.round(Math.max(0, state.reputation * 1.2 + state.stressAbility * 0.5 - state.slackCount * 0.5)),
            survival: Math.round(state.health * 0.8 + state.energy * 0.3 + state.money * 0.01)
        };

        const max = Math.max(...Object.values(raw), 1);
        const pct = {};
        for (const [k, v] of Object.entries(raw)) {
            pct[k] = Math.round((v / max) * 100);
        }

        return { raw, pct, max };
    }

    /**
     * 获取当前主导路线
     */
    getDominantRoute(routes) {
        const entries = Object.entries(routes.raw).sort((a, b) => b[1] - a[1]);
        return entries[0][0];
    }

    /**
     * 获取路线名称和描述
     */
    getRouteLabel(routeId) {
        const labels = {
            career: { name: '政绩派', desc: '以晋升为目标，追求权力和地位', icon: '📈', color: '#3498db' },
            relationship: { name: '人脉派', desc: '编织关系网络，成为不可替代的人', icon: '🌐', color: '#e74c3c' },
            principle: { name: '清流派', desc: '坚守原则和底线，活出本心', icon: '⭐', color: '#9b59b6' },
            survival: { name: '摸鱼派', desc: '活得滋润才是真本事', icon: '🐟', color: '#2ecc71' }
        };
        return labels[routeId] || labels.career;
    }

    /**
     * 获取路线排名（用于多路线展示）
     */
    getRouteRanking(routes) {
        return Object.entries(routes.raw)
            .sort((a, b) => b[1] - a[1])
            .map(([id, score]) => ({
                id,
                ...this.getRouteLabel(id),
                score,
                pct: routes.pct[id]
            }));
    }

    /**
     * 短期目标 — 今天/最近几天就能做的事
     */
    getShortTermGoals(state) {
        const goals = [];

        if (state.energy < 30) {
            goals.push({ icon: '⚡', text: '精力不足，建议休息恢复', priority: 1, type: 'urgent' });
        }
        if (state.stress >= 70) {
            goals.push({ icon: '😰', text: '压力过高，需要放松减压', priority: 1, type: 'urgent' });
        }
        if (state.health < 40) {
            goals.push({ icon: '❤️', text: '健康欠佳，注意保养', priority: 1, type: 'urgent' });
        }

        const nextPosName = this.getNextPositionName(state.position);
        if (nextPosName && state.reputation >= this.getPositionRepThreshold(state.position + 1)) {
            goals.push({ icon: '⬆️', text: `声望达标！准备争取晋升至${nextPosName}`, priority: 2, type: 'opportunity' });
        }

        if (state.skillPoints > 0) {
            const available = skillSystem.getAvailableSkills();
            if (available.length > 0) {
                const canAfford = available.filter(s => s.canUnlock);
                if (canAfford.length > 0) {
                    goals.push({ icon: '⭐', text: `有${canAfford.length}个技能可解锁（${state.skillPoints}点可用）`, priority: 2, type: 'progress' });
                }
            }
        }

        const recentTasks = state.completedTasks?.filter(t => t.day === state.day)?.length || 0;
        if (recentTasks < 2) {
            goals.push({ icon: '📋', text: '执行今日任务，积累经验和声望', priority: 3, type: 'daily' });
        }

        return goals;
    }

    /**
     * 中期里程碑 — 7-30天内可达成的目标
     */
    getMidTermMilestones(state) {
        const milestones = [];

        const nextPos = this.getNextPositionInfo(state.position, state.reputation);
        if (nextPos) {
            milestones.push({
                icon: '⬆️',
                title: `晋升至${nextPos.name}`,
                current: state.reputation,
                target: nextPos.repNeeded,
                unit: '声望',
                progress: Math.min(100, Math.round((state.reputation / nextPos.repNeeded) * 100)),
                tip: nextPos.tip
            });
        }

        milestones.push({
            icon: '⭐',
            title: '声望达到100',
            current: state.reputation,
            target: 100,
            unit: '声望',
            progress: Math.min(100, state.reputation),
            tip: '高声望解锁更多事件和结局'
        });

        milestones.push({
            icon: '🤝',
            title: '人脉达到满值',
            current: state.connections,
            target: state.maxConnections,
            unit: '人脉',
            progress: Math.min(100, Math.round((state.connections / state.maxConnections) * 100)),
            tip: '人脉是体制内最重要的资源'
        });

        const nextMilestoneMonth = this.getNextMilestoneMonth(state.month);
        if (nextMilestoneMonth) {
            const monthsLeft = nextMilestoneMonth - state.month;
            milestones.push({
                icon: '🎯',
                title: `里程碑：第${nextMilestoneMonth}月`,
                current: state.month,
                target: nextMilestoneMonth,
                unit: '月',
                progress: Math.min(100, Math.round((state.month / nextMilestoneMonth) * 100)),
                tip: `${monthsLeft}月后会有里程碑奖励`
            });
        }

        return milestones;
    }

    /**
     * 获取当前可触及的结局及其进度
     */
    getEndingProximity(state) {
        const reachable = [];

        const checkEnding = (ending) => {
            let progress = 0;
            let details = [];

            if (ending.id === 'skyrocket') {
                const pPos = Math.min(100, Math.round((state.position / 5) * 100));
                const pRep = Math.min(100, Math.round((state.reputation / 80) * 100));
                progress = Math.round((pPos + pRep) / 2);
                details = [`职位: ${state.positionName} (${pPos}%)`, `声望: ${state.reputation}/80 (${pRep}%)`];
            } else if (ending.id === 'steady_climb') {
                const pPos = Math.min(100, Math.round((state.position / 3) * 100));
                const pRep = Math.min(100, Math.round((state.reputation / 60) * 100));
                progress = Math.round((pPos + pRep) / 2);
                details = [`职位: ${state.positionName} (${pPos}%)`, `声望: ${state.reputation}/60 (${pRep}%)`];
            } else if (ending.id === 'marginal') {
                if (state.reputation < 50) {
                    progress = Math.min(100, Math.round((state.month / 180) * 100));
                    details = [`月数: ${state.month}/180`, `声望: ${state.reputation}/30 (危险)`];
                } else {
                    return null;
                }
            } else if (ending.id === 'kingmaker') {
                const pConn = Math.min(100, Math.round((state.connections / state.maxConnections) * 100));
                const pRep = Math.min(100, Math.round((state.reputation / 70) * 100));
                progress = Math.round((pConn + pRep) / 2);
                details = [`人脉: ${state.connections}/${state.maxConnections}`, `声望: ${state.reputation}/70`];
            } else if (ending.id === 'balanced') {
                const items = [['声望', state.reputation, 60], ['人脉', state.connections, 35], ['存款', state.money, 30000], ['健康', state.health, 50]];
                const pcts = items.map(([n, c, t]) => Math.min(100, Math.round((c / t) * 100)));
                progress = Math.round(pcts.reduce((a, b) => a + b, 0) / items.length);
                details = items.map(([n, c, t]) => `${n}: ${c}/${t}`);
            } else if (ending.id === 'fish_king') {
                const pSlack = Math.min(100, Math.round((state.slackCount / 100) * 100));
                const pPos = state.position >= 2 ? 100 : Math.min(100, Math.round((state.position / 2) * 100));
                progress = Math.round((pSlack + pPos) / 2);
                details = [`摸鱼: ${state.slackCount}/100次`, `职位: ${state.position >= 2 ? '✅ 已达标' : '需副科以上'}`];
            } else if (ending.id === 'workaholic_burnout') {
                const pRep = Math.min(100, Math.round((state.reputation / 70) * 100));
                const pHealth = state.health < 30 ? 100 : Math.max(0, 100 - Math.round(((state.health - 30) / 70) * 100));
                progress = Math.round((pRep + pHealth) / 2);
                details = [`声望: ${state.reputation}/70`, `健康: ${state.health}/30 (越低越接近)`];
            } else if (ending.id === 'early_retire') {
                const pMoney = Math.min(100, Math.round((state.money / 50000) * 100));
                const pHealth = Math.min(100, Math.round((state.health / 60) * 100));
                const pDay = Math.min(100, Math.round((state.month / 365) * 100));
                progress = Math.round((pMoney + pHealth + pDay) / 3);
                details = [`存款: ${state.money}/50000`, `健康: ${state.health}/60`, `月数: ${state.month}/365`];
            } else if (ending.id === 'secret_ending') {
                const items = [['声望', state.reputation, 80], ['人脉', state.connections, 50], ['存款', state.money, 100000], ['健康', state.health, 40]];
                const pcts = items.map(([n, c, t]) => Math.min(100, Math.round((c / t) * 100)));
                progress = Math.round(pcts.reduce((a, b) => a + b, 0) / items.length);
                details = items.map(([n, c, t]) => `${n}: ${c}/${t}`);
            } else if (ending.id === 'comeback_king') {
                const lowestRep = state.flags.lowestReputation || 0;
                const hasLowest = lowestRep > 0 && lowestRep < 20;
                const pRep = Math.min(100, Math.round((state.reputation / 60) * 100));
                const pPos = Math.min(100, Math.round((state.position / 3) * 100));
                progress = Math.round((pRep + pPos) / 2);
                details = [`曾最低: ${lowestRep}`, `声望: ${state.reputation}/60`, `职位: ${state.positionName}/正科级`];
                if (!hasLowest) return null;

            // ====== Bad Endings ======
            } else if (ending.id === 'fired') {
                if (state.reputation < 30) {
                    const pRep = Math.max(0, 100 - Math.round((state.reputation / 10) * 100));
                    const pWork = Math.max(0, 100 - Math.round((state.workAbility / 20) * 100));
                    const pDay = Math.min(100, Math.round((state.month / 60) * 100));
                    progress = Math.round((pRep + pWork + pDay) / 3);
                    details = [`声望: ${state.reputation}/10 (越低越接近)`, `工作能力: ${state.workAbility}/20 (越低越接近)`];
                } else return null;
            } else if (ending.id === 'demoted') {
                if (state.reputation < 30) {
                    const pRep = Math.max(0, 100 - Math.round((state.reputation / 15) * 100));
                    const pConn = Math.max(0, 100 - Math.round((state.connections / 10) * 100));
                    const pDay = Math.min(100, Math.round((state.month / 120) * 100));
                    progress = Math.round((pRep + pConn + pDay) / 3);
                    details = [`声望: ${state.reputation}/15`, `人脉: ${state.connections}/10`];
                } else return null;
            } else if (ending.id === 'disgraced') {
                if (state.reputation < 40) {
                    const pRep = Math.max(0, 100 - Math.round((state.reputation / 20) * 100));
                    const pPos = state.position >= 3 ? 100 : Math.min(100, Math.round((state.position / 3) * 100));
                    progress = Math.round((pRep + pPos) / 2);
                    details = [`声望: ${state.reputation}/20 (越低越接近)`, `需正科级以上: ${state.position >= 3 ? '✅' : '❌'}`];
                } else return null;
            } else if (ending.id === 'betrayed') {
                if (state.reputation < 40) {
                    const pConn = state.connections >= 20 ? 100 : Math.min(100, Math.round((state.connections / 20) * 100));
                    const pRep = Math.max(0, 100 - Math.round((state.reputation / 25) * 100));
                    const pDay = Math.min(100, Math.round((state.month / 150) * 100));
                    progress = Math.round((pConn + pRep + pDay) / 3);
                    details = [`人脉曾高: ${state.connections}/20`, `声望: ${state.reputation}/25`];
                } else return null;
            } else if (ending.id === 'faction_fall') {
                if (state.reputation < 40) {
                    const pConn = state.connections >= 30 ? 100 : Math.min(100, Math.round((state.connections / 30) * 100));
                    const pPos = state.position >= 2 ? 100 : Math.min(100, Math.round((state.position / 2) * 100));
                    const pRep = Math.max(0, 100 - Math.round((state.reputation / 20) * 100));
                    progress = Math.round((pConn + pPos + pRep) / 3);
                    details = [`人脉: ${state.connections}/30`, `职位需副科: ${state.position >= 2 ? '✅' : '❌'}`, `声望: ${state.reputation}/20`];
                } else return null;
            } else if (ending.id === 'overwork_death') {
                const pHealth = Math.max(0, 100 - Math.round((state.health / 100) * 100));
                progress = pHealth;
                details = [`健康: ${state.health}/0 (越低越接近死亡)`];
            } else if (ending.id === 'mental_breakdown') {
                const pStress = Math.min(100, Math.round((state.stress / 100) * 100));
                const pHealth = Math.max(0, 100 - Math.round((state.health / 20) * 100));
                progress = Math.round((pStress + pHealth) / 2);
                details = [`压力: ${state.stress}/100`, `健康: ${state.health}/20 (越低越接近)`];
            } else if (ending.id === 'midlife_crisis') {
                if (state.position < 2) {
                    const pDay = Math.min(100, Math.round((state.month / 300) * 100));
                    const pMoney = Math.max(0, 100 - Math.round((state.money / 20000) * 100));
                    const pHealth = Math.max(0, 100 - Math.round((state.health / 50) * 100));
                    progress = Math.round((pDay + pMoney + pHealth) / 3);
                    details = [`月数: ${state.month}/300`, `存款: ${state.money}/20000`, `健康: ${state.health}/50`];
                } else return null;
            } else if (ending.id === 'scandal') {
                if (state.reputation < 30 && state.connections >= 15) {
                    const pConn = Math.min(100, Math.round((state.connections / 25) * 100));
                    const pRep = Math.max(0, 100 - Math.round((state.reputation / 10) * 100));
                    const pDay = Math.min(100, Math.round((state.month / 180) * 100));
                    progress = Math.round((pConn + pRep + pDay) / 3);
                    details = [`人脉: ${state.connections}/25`, `声望: ${state.reputation}/10 (隐藏)`];
                } else return null;
            } else if (ending.id === 'exile') {
                if (state.reputation < 20) {
                    const pRep = Math.max(0, 100 - Math.round((state.reputation / 5) * 100));
                    const pDay = Math.min(100, Math.round((state.month / 200) * 100));
                    progress = Math.round((pRep + pDay) / 2);
                    details = [`声望: ${state.reputation}/5 (越低越接近)`, `月数: ${state.month}/200 (隐藏)`];
                } else return null;
            } else if (ending.id === 'burnout_quit') {
                const pStress = Math.min(100, Math.round((state.stress / 90) * 100));
                const pRep = Math.max(0, 100 - Math.round((state.reputation / 30) * 100));
                const pMoney = Math.max(0, 100 - Math.round((state.money / 10000) * 100));
                const pDay = Math.min(100, Math.round((state.month / 60) * 100));
                progress = Math.round((pStress + pRep + pMoney + pDay) / 4);
                details = [`压力: ${state.stress}/90`, `声望: ${state.reputation}/30`, `存款: ${state.money}/10000`];
            } else {
                return null;
            }

            if (ending.collectedEndings?.has?.(ending.id)) return null;

            return {
                id: ending.id,
                title: ending.title,
                icon: ending.icon,
                progress: Math.min(100, progress),
                details,
                route: ending.route,
                rarity: ending.rarity,
                hidden: ending.hidden,
                type: ending.type || 'good'
            };
        };

        const allEndings = [
            ...endingSystem.endings.career,
            ...endingSystem.endings.relationship,
            ...endingSystem.endings.life,
            ...endingSystem.endings.hidden,
            ...endingSystem.endings.bad
        ];

        for (const ending of allEndings) {
            const result = checkEnding(ending);
            if (result && result.progress > 0) {
                reachable.push(result);
            }
        }

        return reachable.sort((a, b) => b.progress - a.progress).slice(0, 8);
    }

    /**
     * 获取总体进度
     */
    getOverallProgress(state) {
        const endingStats = endingSystem.getCollectionStats();
        const achievementStats = achievementSystem.getStatistics();

        return {
            endings: endingStats,
            achievements: achievementStats,
            ngPlusWeek: ngPlusSystem.currentWeek || 1,
            day: state.day,
            position: state.positionName
        };
    }

    /**
     * 获取下一级职位信息
     */
    getNextPositionInfo(currentPos, reputation) {
        const positions = [
            { level: 1, name: '科员', next: '副科级' },
            { level: 2, name: '副科级', next: '正科级' },
            { level: 3, name: '正科级', next: '副处级' },
            { level: 4, name: '副处级', next: '正处级' },
            { level: 5, name: '正处级', next: null }
        ];

        const current = positions.find(p => p.level === currentPos);
        if (!current || !current.next) return null;

        const nextPos = positions.find(p => p.name === current.next);
        if (!nextPos) return null;

        const repNeeded = currentPos * 20 + 20;
        return {
            name: current.next,
            repNeeded,
            tip: `需要声望达到${repNeeded}以上才有机会晋升`
        };
    }

    getNextPositionName(currentPos) {
        const info = this.getNextPositionInfo(currentPos, 0);
        return info ? info.name : null;
    }

    getPositionRepThreshold(nextLevel) {
        return (nextLevel - 1) * 20 + 20;
    }

    /**
     * 获取下一个里程碑天数
     */
    getNextMilestoneMonth(month) {
        const milestones = [3, 6, 12, 24, 36, 60, 120];
        for (const m of milestones) {
            if (m > month) return m;
        }
        return null;
    }

    /**
     * 检查里程碑通知
     */
    checkMilestoneNotifications() {
        const month = gameState.month;
        const milestoneMonths = [3, 6, 12, 24, 36, 60, 120];

        if (milestoneMonths.includes(month)) return;

        const nextMilestone = this.getNextMilestoneMonth(month);
        if (!nextMilestone) return;

        const monthsLeft = nextMilestone - month;
        if (monthsLeft <= 1 && monthsLeft > 0 && !gameState.flags[`milestone_notify_${nextMilestone}`]) {
            gameState.flags[`milestone_notify_${nextMilestone}`] = true;
            setTimeout(() => {
                const rewardText = this.getMilestoneReward(nextMilestone);
                eventBus.emit('ui:showMessage', {
                    text: `🎯 ${monthsLeft}月后到达里程碑（第${nextMilestone}月）${rewardText}`,
                    type: 'system'
                });
            }, 1000);
        }
    }

    getMilestoneReward(month) {
        const rewards = {
            3: '奖励经验+50',
            6: '奖励经验+80',
            12: '奖励经验+150, 声望+5',
            24: '奖励经验+200, 声望+8',
            36: '奖励经验+300, 声望+10',
            60: '奖励经验+500, 声望+15',
            120: '奖励经验+1000, 声望+30'
        };
        return rewards[month] ? `—${rewards[month]}` : '';
    }

    /**
     * 检查路线变化通知
     */
    checkRouteNotification() {
        const routes = this.computeRouteScores();
        const currentRank = Object.entries(routes.raw)
            .sort((a, b) => b[1] - a[1])
            .map(([id]) => id)
            .join(',');

        if (this.lastRank && this.lastRank !== currentRank && gameState.month !== this.lastRouteNotifyMonth) {
            gameState.flags.promotion_notified = true;
            const ranking = this.getRouteRanking(routes);
            const top = ranking[0];
            eventBus.emit('ui:showMessage', {
                text: `🔄 路线评估更新：${top.name}（${top.pct}%）领先`,
                type: 'system'
            });
            this.lastRouteNotifyMonth = gameState.month;
        }

        this.lastRank = currentRank;
    }

    /**
     * 获取路线可视化HTML
     */
    renderRouteBars(routes, dominantRoute) {
        const ranking = this.getRouteRanking(routes);
        const dominantColor = this.getRouteLabel(dominantRoute).color;

        let html = `
            <div class="goals-routes">
                <div class="goals-route-current" style="border-color: ${dominantColor}">
                    <span class="route-main-icon">${this.getRouteLabel(dominantRoute).icon}</span>
                    <span class="route-main-label">当前主导：${this.getRouteLabel(dominantRoute).name}</span>
                </div>
                <div class="goals-route-bars">
        `;

        ranking.forEach((route, i) => {
            const barWidth = Math.max(4, route.pct);
            html += `
                <div class="goals-route-row ${i === 0 ? 'dominant' : ''}">
                    <span class="goals-route-icon">${route.icon}</span>
                    <span class="goals-route-name">${route.name}</span>
                    <div class="goals-route-bar-track">
                        <div class="goals-route-bar-fill" style="width: ${barWidth}%; background: ${route.color}; opacity: ${i === 0 ? 1 : 0.5};"></div>
                    </div>
                    <span class="goals-route-pct">${route.pct}%</span>
                </div>
            `;
        });

        html += '</div></div>';
        return html;
    }

    /**
     * 渲染目标面板
     */
    renderGoalsPanel() {
        const goals = this.computeGoals();
        const state = gameState;

        let html = '<div class="goals-panel">';

        html += `
            <div class="goals-section">
                <h4 class="goals-section-title">📊 路线评估</h4>
                ${this.renderRouteBars(goals.routes, goals.dominantRoute)}
            </div>
        `;

        if (goals.shortTerm.length > 0) {
            html += `
                <div class="goals-section">
                    <h4 class="goals-section-title">🎯 当前建议</h4>
                    <div class="goals-short-term">
            `;
            goals.shortTerm.forEach(g => {
                const typeClass = `goal-type-${g.type}`;
                html += `<div class="goal-item ${typeClass}"><span class="goal-icon">${g.icon}</span><span class="goal-text">${g.text}</span></div>`;
            });
            html += '</div></div>';
        }

        if (goals.midTerm.length > 0) {
            html += `
                <div class="goals-section">
                    <h4 class="goals-section-title">📈 中期目标</h4>
                    <div class="goals-mid-term">
            `;
            goals.midTerm.forEach(m => {
                html += `
                    <div class="goal-milestone">
                        <div class="goal-milestone-header">
                            <span>${m.icon} ${m.title}</span>
                            <span class="goal-milestone-progress-text">${m.current}/${m.target}</span>
                        </div>
                        <div class="goal-milestone-track">
                            <div class="goal-milestone-fill" style="width: ${m.progress}%"></div>
                        </div>
                        <div class="goal-milestone-tip">${m.tip}</div>
                    </div>
                `;
            });
            html += '</div></div>';
        }

        if (goals.endingProximity.length > 0) {
            html += `
                <div class="goals-section">
                    <h4 class="goals-section-title">🏁 结局进度</h4>
                    <div class="goals-endings">
            `;
            
            const sortedEndings = [...goals.endingProximity].sort((a, b) => {
                if (a.type === 'bad' && b.type !== 'bad') return -1;
                if (a.type !== 'bad' && b.type === 'bad') return 1;
                return b.progress - a.progress;
            });
            
            sortedEndings.forEach(e => {
                const rarityColors = { common: '#888', rare: '#3498db', epic: '#9b59b6', legendary: '#f39c12' };
                const isBad = e.type === 'bad';
                const dangerColor = '#ff4757';
                html += `
                    <div class="goal-ending ${e.progress >= 80 ? 'close' : ''} ${isBad ? 'goal-ending-bad' : ''}">
                        <div class="goal-ending-header">
                            <span>${e.icon} ${e.title}${isBad ? ' 💀' : ''}</span>
                            <span class="goal-ending-progress-text" style="color: ${isBad ? dangerColor : rarityColors[e.rarity]}">${e.progress}%</span>
                        </div>
                        <div class="goal-milestone-track">
                            <div class="goal-milestone-fill ending-fill" style="width: ${e.progress}%; background: ${isBad ? 'linear-gradient(90deg, #ff4757, #ff6b81)' : rarityColors[e.rarity]}"></div>
                        </div>
                        <div class="goal-ending-details">
                            ${e.details.map(d => `<span class="goal-detail-item ${isBad ? 'detail-bad' : ''}">${d}</span>`).join('')}
                        </div>
                    </div>
                `;
            });
            html += '</div></div>';
        }

        html += `
            <div class="goals-section">
                <h4 class="goals-section-title">🏆 总体进度</h4>
                <div class="goals-overall">
                    <div class="goals-overall-item">
                        <span class="goals-overall-label">结局收集</span>
                        <span class="goals-overall-value">${goals.overallProgress.endings.collected}/${goals.overallProgress.endings.total}</span>
                    </div>
                    <div class="goals-overall-item">
                        <span class="goals-overall-label">成就解锁</span>
                        <span class="goals-overall-value">${goals.overallProgress.achievements.unlocked}/${goals.overallProgress.achievements.total}</span>
                    </div>
                    <div class="goals-overall-item">
                        <span class="goals-overall-label">当前周目</span>
                        <span class="goals-overall-value">第 ${goals.overallProgress.ngPlusWeek} 周</span>
                    </div>
                    <div class="goals-overall-item">
                        <span class="goals-overall-label">下一解锁</span>
                        <span class="goals-overall-value goals-ngplus-hint">${goals.ngPlusHint}</span>
                    </div>
                </div>
            </div>
        `;

        html += '</div>';
        return html;
    }

    /**
     * 显示目标面板
     */
    showGoalsPanel() {
        const content = this.renderGoalsPanel();
        eventBus.emit('ui:showModal', {
            title: '🎯 游戏目标',
            content,
            width: '95%',
            maxWidth: '500px',
            buttons: [{ text: '知道了', callback: () => {} }]
        });
    }
}

const gameGoals = new GameGoals();