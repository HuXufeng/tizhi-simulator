/**
 * 技能树UI系统
 * 可视化技能树界面
 */
class SkillTreeUI {
    constructor() {
        this.currentTab = 'writing';
        this.init();
    }

    init() {
        // 监听技能解锁事件
        eventBus.on('game:showSkillTree', () => this.showSkillTree());
        eventBus.on('skill:unlocked', (skill) => this.onSkillUnlocked(skill));
        eventBus.on('skill:pointsChanged', () => this.updateSkillPoints());
    }

    /**
     * 显示技能树界面
     */
    showSkillTree() {
        const treeData = skillSystem.getSkillTreeData();
        const skillPoints = skillSystem.getSkillPoints();
        const unlockedSkills = skillSystem.getUnlockedSkills();
        const availableSkills = skillSystem.getAvailableSkills();

        const content = `
            <div class="skill-tree-container">
                <!-- 技能点显示 -->
                <div class="skill-points-display">
                    <span class="skill-points-icon">⭐</span>
                    <span>可用技能点: <strong>${skillPoints}</strong></span>
                </div>

                <!-- 技能树标签 -->
                <div class="skill-tree-tabs">
                    <button class="skill-tab ${this.currentTab === 'writing' ? 'active' : ''}" data-tab="writing">
                        ✍️ 文字路线
                    </button>
                    <button class="skill-tab ${this.currentTab === 'social' ? 'active' : ''}" data-tab="social">
                        🤝 社交路线
                    </button>
                    <button class="skill-tab ${this.currentTab === 'management' ? 'active' : ''}" data-tab="management">
                        📋 管理路线
                    </button>
                    <button class="skill-tab ${this.currentTab === 'general' ? 'active' : ''}" data-tab="general">
                        🌟 通用技能
                    </button>
                </div>

                <!-- 技能树内容 -->
                <div class="skill-tree-content" id="skill-tree-content">
                    ${this.renderSkillTree(treeData[this.currentTab])}
                </div>

                <!-- 组合效果 -->
                ${this.renderComboEffects()}

                <!-- 已解锁技能列表 -->
                <div class="unlocked-skills-list">
                    <h4>已解锁技能 (${unlockedSkills.length})</h4>
                    <div class="unlocked-skills">
                        ${unlockedSkills.map(s => `
                            <span class="skill-badge unlocked" style="border-color: ${this.getTreeColor(s.tree)}">
                                ${s.icon} ${s.name}
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        eventBus.emit('ui:showModal', {
            title: '🎯 技能树',
            content,
            width: '95%',
            maxWidth: '600px',
            buttons: [
                { text: '关闭', callback: () => this.closeModal() }
            ]
        });
        
        // mainUI的showModal不支持onRendered回调，改用setTimeout确保DOM渲染后绑定事件
        setTimeout(() => this.bindTabEvents(), 200);
    }

    /**
     * 渲染技能树
     */
    renderSkillTree(tree) {
        const tiers = {};
        tree.skills.forEach(skill => {
            if (!tiers[skill.tier]) tiers[skill.tier] = [];
            tiers[skill.tier].push(skill);
        });

        let html = `<div class="skill-tree-visual" style="--tree-color: ${tree.color}">`;
        html += `<h3 class="tree-title" style="color: ${tree.color}">${tree.name}</h3>`;

        // 按层级渲染
        for (let tier = 1; tier <= 4; tier++) {
            if (tiers[tier]) {
                html += `<div class="skill-tier tier-${tier}">`;
                html += `<div class="tier-label">${this.getTierName(tier)}</div>`;
                html += `<div class="tier-skills">`;

                tiers[tier].forEach(skill => {
                    html += this.renderSkillNode(skill);
                });

                html += `</div></div>`;
            }
        }

        html += `</div>`;
        return html;
    }

    /**
     * 渲染单个技能节点
     */
    renderSkillNode(skill) {
        const isUnlocked = skill.unlocked;
        const canUnlock = skill.canUnlock;
        const isAvailable = this.isSkillAvailable(skill);

        let statusClass = 'locked';
        if (isUnlocked) statusClass = 'unlocked';
        else if (isAvailable) statusClass = 'available';
        else if (canUnlock) statusClass = 'can-unlock';

        return `
            <div class="skill-node ${statusClass}" 
                 data-skill-id="${skill.id}"
                 onclick="skillTreeUI.handleSkillClick('${skill.id}')">
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-info">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-effect">${skill.effectDesc}</div>
                </div>
                <div class="skill-cost">
                    ${isUnlocked ? '✓' : skill.cost + '点'}
                </div>
            </div>
        `;
    }

    /**
     * 检查技能是否可解锁（前置条件满足）
     */
    isSkillAvailable(skill) {
        if (!skill.prerequisites || skill.prerequisites.length === 0) return true;
        return skill.prerequisites.every(prereq => 
            skillSystem.unlockedSkills.has(prereq)
        );
    }

    /**
     * 处理技能点击
     */
    handleSkillClick(skillId) {
        const skill = skillSystem.skillPool[skillId];
        if (!skill) return;

        if (skillSystem.unlockedSkills.has(skillId)) {
            // 已解锁，显示详情
            this.showSkillDetail(skill);
        } else if (this.isSkillAvailable(skill)) {
            // 可解锁
            const result = skillSystem.unlockSkill(skillId);
            if (result.success) {
                eventBus.emit('ui:showMessage', {
                    text: `🎉 解锁技能「${skill.name}」！`,
                    type: 'success'
                });
                this.refreshSkillTree();
            } else {
                eventBus.emit('ui:showMessage', {
                    text: `解锁失败: ${result.reason}`,
                    type: 'warning'
                });
            }
        } else {
            // 前置条件不满足
            const missingPrereqs = skill.prerequisites
                .filter(prereq => !skillSystem.unlockedSkills.has(prereq))
                .map(prereq => skillSystem.skillPool[prereq]?.name || prereq)
                .join('、');
            eventBus.emit('ui:showMessage', {
                text: `需要先解锁前置技能: ${missingPrereqs}`,
                type: 'warning'
            });
        }
    }

    /**
     * 显示技能详情
     */
    showSkillDetail(skill) {
        const content = `
            <div class="skill-detail">
                <div class="skill-detail-header">
                    <span class="skill-detail-icon">${skill.icon}</span>
                    <div>
                        <h3>${skill.name}</h3>
                        <span class="skill-detail-level">${this.getTierName(skill.tier)}</span>
                    </div>
                </div>
                <div class="skill-detail-desc">${skill.description}</div>
                <div class="skill-detail-effect">
                    <strong>效果:</strong> ${skill.effectDesc}
                </div>
                ${skill.prerequisites.length > 0 ? `
                    <div class="skill-detail-prereq">
                        <strong>前置:</strong> ${skill.prerequisites
                            .map(p => skillSystem.skillPool[p]?.name || p)
                            .join('、')}
                    </div>
                ` : ''}
            </div>
        `;

        eventBus.emit('ui:showModal', {
            title: '技能详情',
            content,
            buttons: [{ text: '关闭', callback: () => {} }]
        });
    }

    /**
     * 渲染组合效果
     */
    renderComboEffects() {
        const allCombos = [
            {
                id: 'writer',
                name: '妙笔生花',
                desc: '写作任务效率翻倍',
                icon: '🖊️',
                requiredSkills: ['expert_writer', 'master_writer'],
                bonus: { writingEfficiency: 2 }
            },
            {
                id: 'socialite',
                name: '左右逢源',
                desc: '社交任务效率大幅提升',
                icon: '🌟',
                requiredSkills: ['relationship_master', 'gift_guru'],
                bonus: { socialEffect: 1.5 }
            },
            {
                id: 'leader',
                name: '运筹帷幄',
                desc: '所有任务效率提升',
                icon: '🎯',
                requiredSkills: ['team_leader', 'executive'],
                bonus: { workEfficiency: 1.3 }
            },
            {
                id: 'all-rounder',
                name: '全能选手',
                desc: '所有能力小幅提升',
                icon: '🏆',
                requiredSkills: ['expert_writer', 'relationship_master', 'team_leader'],
                bonus: { workAbility: 10, commAbility: 10 }
            }
        ];

        const activeCombos = skillSystem.getComboEffects();
        const activeComboIds = new Set(activeCombos.map(c => {
            if (c.desc === '写作任务效率翻倍') return 'writer';
            if (c.desc === '社交任务效率大幅提升') return 'socialite';
            if (c.desc === '所有任务效率提升') return 'leader';
            if (c.desc === '所有能力小幅提升') return 'all-rounder';
            return '';
        }));

        return `
            <div class="combo-effects">
                <h4>🌟 组合效果</h4>
                <div class="combo-list">
                    ${allCombos.map(combo => {
                        const isActive = activeComboIds.has(combo.id);
                        const unlockedCount = combo.requiredSkills.filter(id => 
                            skillSystem.unlockedSkills.has(id)
                        ).length;
                        const totalCount = combo.requiredSkills.length;
                        
                        return `
                            <div class="combo-item ${isActive ? 'active' : 'inactive'}">
                                <div class="combo-header">
                                    <span class="combo-icon">${combo.icon}</span>
                                    <div class="combo-info">
                                        <span class="combo-name">${combo.name}</span>
                                        <span class="combo-desc">${combo.desc}</span>
                                    </div>
                                    <span class="combo-status">
                                        ${isActive ? '✅ 激活' : `🔒 ${unlockedCount}/${totalCount}`}
                                    </span>
                                </div>
                                ${!isActive ? `
                                    <div class="combo-requirements">
                                        所需技能: ${combo.requiredSkills.map(id => {
                                            const skill = skillSystem.skillPool[id];
                                            const unlocked = skillSystem.unlockedSkills.has(id);
                                            return `<span class="${unlocked ? 'skill-available' : 'skill-locked'}">
                                                ${unlocked ? '✅' : '❌'} ${skill ? skill.name : id}
                                            </span>`;
                                        }).join(' • ')}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 获取层级名称
     */
    getTierName(tier) {
        const names = {
            1: '初级',
            2: '中级',
            3: '高级',
            4: '大师级'
        };
        return names[tier] || `Tier ${tier}`;
    }

    /**
     * 获取路线颜色
     */
    getTreeColor(tree) {
        const colors = {
            writing: '#3498db',
            social: '#e74c3c',
            management: '#2ecc71',
            general: '#f39c12'
        };
        return colors[tree] || '#888';
    }

    /**
     * 绑定标签页事件
     */
    bindTabEvents() {
        const tabs = document.querySelectorAll('.skill-tab');
        tabs.forEach(tab => {
            // 移除旧的 bound 标记和监听器
            if (tab.dataset.bound) {
                delete tab.dataset.bound;
            }
            // 用新的监听器替换旧的（cloneNode方式）
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
            
            newTab.dataset.bound = 'true';
            newTab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                if (!tabName) return;
                
                this.currentTab = tabName;
                
                // 更新标签样式
                document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                this.refreshSkillTree();
            }, false);
        });
    }

    /**
     * 刷新技能树（只更新内容，不重建弹窗）
     */
    refreshSkillTree() {
        const treeData = skillSystem.getSkillTreeData();
        const skillPoints = skillSystem.getSkillPoints();
        const unlockedSkills = skillSystem.getUnlockedSkills();
        
        // 更新技能点显示
        const pointsEl = document.querySelector('.skill-points-display strong');
        if (pointsEl) pointsEl.textContent = skillPoints;
        
        // 更新技能树内容区
        const contentEl = document.getElementById('skill-tree-content');
        if (contentEl) {
            contentEl.innerHTML = this.renderSkillTree(treeData[this.currentTab]);
        }
        
        // 更新组合效果
        const comboContainer = document.querySelector('.combo-effects');
        if (comboContainer) {
            comboContainer.outerHTML = this.renderComboEffects();
        }
        
        // 更新已解锁技能列表
        const unlockedHeader = document.querySelector('.unlocked-skills-list h4');
        if (unlockedHeader) {
            unlockedHeader.textContent = `已解锁技能 (${unlockedSkills.length})`;
        }
        const unlockedList = document.querySelector('.unlocked-skills');
        if (unlockedList) {
            unlockedList.innerHTML = unlockedSkills.map(s => `
                <span class="skill-badge unlocked" style="border-color: ${this.getTreeColor(s.tree)}">
                    ${s.icon} ${s.name}
                </span>
            `).join('');
        }
        
        // 重新绑定标签事件（清除旧的bound标记）
        setTimeout(() => this.bindTabEvents(), 100);
    }
    
    /**
     * 关闭弹窗
     */
    closeModal() {
        const modal = document.getElementById('modal-overlay');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    /**
     * 技能解锁回调
     */
    onSkillUnlocked(skill) {
        // 可以播放动画或音效
    }

    /**
     * 更新技能点显示
     */
    updateSkillPoints() {
        const pointsEl = document.querySelector('.skill-points-display strong');
        if (pointsEl) {
            pointsEl.textContent = skillSystem.getSkillPoints();
        }
    }
}

// 全局单例
const skillTreeUI = new SkillTreeUI();

// 暴露给window以便onclick调用
window.skillTreeUI = skillTreeUI;
