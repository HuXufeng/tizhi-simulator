/**
 * 小游戏系统
 * 包含公文排版、会议安排等交互小游戏
 */
class MiniGameSystem {
    constructor() {
        this.currentGame = null;
        this.gameResults = {};
        this.currentTask = null;

        this.SKILL_BONUS_PER_LEVEL = 0.05;
        this.SOCIAL_BONUS_PER_LEVEL = 0.08;

        this.TASK_SKILL_MAP = {
            document: 'writing',
            meeting: 'management',
            research: 'writing',
            social: 'social',
            study: 'writing'
        };

        this.BONUS_TABLE = [
            { threshold: 0.9, bonus: 0.5 },
            { threshold: 0.75, bonus: 0.35 },
            { threshold: 0.6, bonus: 0.25 },
            { threshold: 0, bonus: 0.15 }
        ];
    }

    /**
     * 计算技能加成
     */
    getSkillBonus(taskType) {
        const skillType = this.TASK_SKILL_MAP[taskType];
        if (!skillType || typeof skillSystem === 'undefined') {
            return 0;
        }

        const unlockedSkills = skillSystem.unlockedSkills || new Set();

        const skillLevelMap = {
            writing: ['basic_writing', 'speed_writer', 'formal_writer', 'expert_writer', 'policy_analyst', 'master_writer'],
            social: ['basic_social', 'charm', 'active_listener', 'relationship_master', 'gift_guru', 'social_master'],
            management: ['basic_management', 'task_coordinator', 'conflict_solver', 'team_leader', 'time_manager', 'executive']
        };

        const skillPool = skillType === 'writing' ? ['basic_writing', 'speed_writer', 'formal_writer', 'expert_writer', 'policy_analyst', 'master_writer'] :
                         skillType === 'social' ? ['basic_social', 'charm', 'active_listener', 'relationship_master', 'gift_guru', 'social_master'] :
                         skillType === 'management' ? ['basic_management', 'task_coordinator', 'conflict_solver', 'team_leader', 'time_manager', 'executive'] : [];

        let level = 0;
        for (let i = 0; i < skillPool.length; i++) {
            if (unlockedSkills.has(skillPool[i])) {
                level = i + 1;
            }
        }

        if (level === 0) return 0;

        const bonusPerLevel = skillType === 'social' ? this.SOCIAL_BONUS_PER_LEVEL : this.SKILL_BONUS_PER_LEVEL;
        return Math.min(level * bonusPerLevel, 0.25);
    }

    /**
     * 计算奖励加成
     */
    calculateBonus(performance) {
        for (const entry of this.BONUS_TABLE) {
            if (performance >= entry.threshold) {
                return entry.bonus;
            }
        }
        return 0.15;
    }

    /**
     * 获取加成描述
     */
    getBonusDescription(bonus) {
        if (bonus >= 0.5) return '🌟 完美表现！';
        if (bonus >= 0.35) return '👍 表现不错！';
        if (bonus >= 0.25) return '👌 合格完成！';
        return '📝 参与奖励！';
    }

    /**
     * 显示游戏选择界面
     */
    showGameSelection(taskType) {
        const games = this.getAvailableGames(taskType);

        if (games.length === 0) {
            return false;
        }

        const choices = games.map(game => ({
            text: game.icon + ' ' + game.name,
            callback: () => this.startGame(game.id, taskType)
        }));

        choices.push({
            text: '跳过小游戏',
            callback: () => this.skipGame()
        });

        eventBus.emit('ui:showChoices', { choices });
        return true;
    }

    /**
     * 显示小游戏选项面板
     */
    showMiniGamePanel(task, games) {
        this.currentTask = task;

        const skillBonus = this.getSkillBonus(task.type);
        const skillText = skillBonus > 0 ? `<span style="color:#2ecc71;">（技能加成 +${Math.round(skillBonus * 100)}%）</span>` : '';

        const content = `
            <div style="text-align:center;">
                <p style="margin-bottom:16px;">🎮 完成 "${task.name}" 时出现小游戏挑战！</p>
                <p style="margin-bottom:12px;">选择小游戏可获得额外奖励加成</p>
                <p style="margin-bottom:16px;font-size:12px;color:#888;">当前技能加成：${skillText}</p>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    ${games.map(game => `
                        <button class="pixel-btn" onclick="miniGameSystem.startGame('${game.id}', '${task.type}')">
                            ${game.icon} ${game.name}
                        </button>
                    `).join('')}
                    <button class="pixel-btn" style="background:#555;" onclick="miniGameSystem.skipGame()">
                        ⏭️ 跳过小游戏（获得基础奖励）
                    </button>
                </div>
            </div>
        `;

        eventBus.emit('ui:showModal', {
            title: '🎮 小游戏挑战',
            content,
            buttons: []
        });

        return true;
    }

    /**
     * 获取可用游戏
     */
    getAvailableGames(taskType) {
        const games = {
            document: [
                { id: 'document_sort', name: '公文排版', icon: '📝' },
                { id: 'typing_test', name: '打字测试', icon: '⌨️' }
            ],
            meeting: [
                { id: 'seat_arrange', name: '座位安排', icon: '🪑' },
                { id: 'agenda_order', name: '议程排序', icon: '📋' }
            ],
            research: [
                { id: 'path_finding', name: '调研路线', icon: '🗺️' }
            ],
            social: [
                { id: 'dialogue_choice', name: '对话选择', icon: '💬' }
            ],
            study: [
                { id: 'typing_test', name: '打字测试', icon: '⌨️' }
            ]
        };

        return games[taskType] || [];
    }

    /**
     * 跳过游戏
     */
    skipGame() {
        this.gameResults = {
            skipped: true,
            performance: 0,
            bonus: 0,
            task: this.currentTask
        };

        eventBus.emit('ui:hideModal');
        eventBus.emit('minigame:skip', this.gameResults);
    }

    /**
     * 显示小游戏结果
     */
    showResults(results) {
        const bonusPercent = Math.round(results.bonus * 100);
        const performancePercent = Math.round(results.performance * 100);
        const description = this.getBonusDescription(results.bonus);

        const content = `
            <div style="text-align:center;">
                <div style="font-size:48px;margin-bottom:16px;">${performancePercent >= 90 ? '🏆' : performancePercent >= 75 ? '🎉' : '👍'}</div>
                <h3 style="margin-bottom:12px;">${description}</h3>
                <p style="margin-bottom:8px;">小游戏表现：${performancePercent}%</p>
                <p style="margin-bottom:8px;">奖励加成：+${bonusPercent}%</p>
                ${results.skillBonus > 0 ? `<p style="margin-bottom:8px;font-size:12px;color:#2ecc71;">技能加成：+${Math.round(results.skillBonus * 100)}%</p>` : ''}
                <p style="margin-top:16px;color:#ffd700;">🎁 最终奖励：×${(1 + results.bonus).toFixed(2)}</p>
            </div>
        `;

        eventBus.emit('ui:showModal', {
            title: '🎮 小游戏结果',
            content,
            buttons: [
                { text: '太棒了！', callback: () => {} }
            ]
        });

        setTimeout(() => {
            eventBus.emit('ui:hideModal');
        }, 2500);
    }

    /**
     * 开始游戏
     */
    startGame(gameId, taskType) {
        this.currentTaskType = taskType;
        this.currentSkillBonus = this.getSkillBonus(taskType);

        eventBus.emit('ui:hideModal');

        switch (gameId) {
            case 'document_sort':
                this.startDocumentSort();
                break;
            case 'typing_test':
                this.startTypingTest();
                break;
            case 'seat_arrange':
                this.startSeatArrange();
                break;
            case 'agenda_order':
                this.startAgendaOrder();
                break;
            case 'path_finding':
                this.startPathFinding();
                break;
            case 'dialogue_choice':
                this.startDialogueChoice();
                break;
            default:
                this.skipGame();
        }
    }

    /**
     * 完成小游戏并计算结果
     */
    completeGame(gameId, basePerformance) {
        const skillBonus = this.currentSkillBonus || 0;
        const performance = Math.min(1, basePerformance + skillBonus);
        const bonus = this.calculateBonus(performance);

        this.gameResults = {
            gameId,
            performance,
            bonus,
            skillBonus,
            task: this.currentTask,
            message: this.getBonusDescription(bonus)
        };

        this.showResults(this.gameResults);

        setTimeout(() => {
            eventBus.emit('minigame:completed', this.gameResults);
        }, 500);

        return this.gameResults;
    }

    /**
     * 跳过游戏
     */
    skipGame() {
        this.gameResults = {
            skipped: true,
            performance: 0,
            bonus: 0,
            skillBonus: 0,
            task: this.currentTask
        };

        eventBus.emit('ui:hideModal');
        eventBus.emit('minigame:skip', this.gameResults);
    }

    // ========== 公文排版游戏 ==========
    startDocumentSort() {
        const blocks = [
            { id: 1, text: '一、标题' },
            { id: 2, text: '（一）第一段' },
            { id: 3, text: '1. 要点一' },
            { id: 4, text: '2. 要点二' },
            { id: 5, text: '（二）第二段' },
            { id: 6, text: '二、第二部分' },
            { id: 7, text: '附：备注说明' }
        ];

        // 随机打乱
        const shuffled = [...blocks].sort(() => Math.random() - 0.5);

        const content = `
            <div class="minigame-container">
                <p class="minigame-instruction">请将公文片段按正确顺序排列：</p>
                <div class="document-blocks" id="document-blocks">
                    ${shuffled.map(b => `
                        <div class="doc-block" draggable="true" data-id="${b.id}">
                            ${b.text}
                        </div>
                    `).join('')}
                </div>
                <div class="doc-drop-zone" id="doc-drop-zone">
                    <p class="drop-hint">拖拽到这里</p>
                </div>
                <div class="minigame-buttons">
                    <button class="pixel-btn" onclick="miniGameSystem.confirmDocumentSort()">确认</button>
                </div>
            </div>
        `;

        eventBus.emit('ui:showModal', {
            title: '📝 公文排版',
            content,
            buttons: []
        });

        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        setTimeout(() => {
            const blocks = document.querySelectorAll('.doc-block');
            const dropZone = document.getElementById('doc-drop-zone');

            blocks.forEach(block => {
                block.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', block.dataset.id);
                    block.classList.add('dragging');
                });

                block.addEventListener('dragend', () => {
                    block.classList.remove('dragging');
                });
            });

            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('drag-over');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                
                const blockId = e.dataTransfer.getData('text/plain');
                const block = document.querySelector(`.doc-block[data-id="${blockId}"]`);
                const dropHint = dropZone.querySelector('.drop-hint');
                
                if (dropHint) dropHint.style.display = 'none';
                dropZone.appendChild(block);
                
                eventBus.emit('audio:play', { type: 'click' });
            });
        }, 100);
    }

    confirmDocumentSort() {
        const dropZone = document.getElementById('doc-drop-zone');
        const blocks = dropZone.querySelectorAll('.doc-block');
        const order = Array.from(blocks).map(b => parseInt(b.dataset.id));

        const correct = [1, 6, 5, 2, 3, 4, 7];
        let correctCount = 0;

        order.forEach((id, i) => {
            if (id === correct[i]) correctCount++;
        });

        const basePerformance = correctCount / correct.length;

        eventBus.emit('audio:play', { type: basePerformance > 0.7 ? 'success' : 'warning' });
        eventBus.emit('ui:hideModal');

        this.completeGame('document_sort', basePerformance);
    }

    // ========== 打字测试游戏 ==========
    startTypingTest() {
        const texts = [
            '关于召开年度工作会议的通知',
            '各部门要高度重视本次检查',
            '请于本周五前提交工作总结',
            '经研究决定，现就有关问题通知如下',
            '为进一步加强作风建设'
        ];

        const text = texts[Math.floor(Math.random() * texts.length)];
        const chars = text.split('');

        const content = `
            <div class="minigame-container">
                <p class="minigame-instruction">请准确输入以下文字：</p>
                <div class="typing-display" id="typing-display">
                    ${chars.map((char, i) => `<span class="typing-char" data-index="${i}">${char}</span>`).join('')}
                </div>
                <input type="text" class="typing-input" id="typing-input" placeholder="开始输入..." autocomplete="off">
                <div class="typing-stats">
                    <span>正确: <strong id="typing-correct">0</strong></span>
                    <span>错误: <strong id="typing-wrong">0</strong></span>
                    <span>进度: <strong id="typing-progress">0%</strong></span>
                </div>
            </div>
        `;

        eventBus.emit('ui:showModal', {
            title: '⌨️ 打字测试',
            content,
            buttons: [{ text: '完成', callback: () => this.finishTypingTest() }]
        });

        this.setupTypingTest(text);
    }

    setupTypingTest(text) {
        setTimeout(() => {
            const input = document.getElementById('typing-input');
            const chars = document.querySelectorAll('.typing-char');
            let correct = 0;
            let wrong = 0;
            let currentIndex = 0;

            input.focus();

            input.addEventListener('input', (e) => {
                const typed = e.target.value;
                const expectedChar = text[currentIndex];

                if (typed.length > currentIndex) {
                    const newChar = typed[typed.length - 1];
                    
                    if (newChar === expectedChar) {
                        chars[currentIndex].classList.add('correct');
                        correct++;
                    } else {
                        chars[currentIndex].classList.add('wrong');
                        wrong++;
                        eventBus.emit('audio:play', { type: 'error' });
                    }

                    currentIndex++;
                    input.value = '';

                    // 更新显示
                    document.getElementById('typing-correct').textContent = correct;
                    document.getElementById('typing-wrong').textContent = wrong;
                    document.getElementById('typing-progress').textContent = 
                        Math.round((currentIndex / text.length) * 100) + '%';

                    // 检查是否完成
                    if (currentIndex >= text.length) {
                        this.finishTypingTest();
                    }
                }
            });
        }, 100);
    }

    finishTypingTest() {
        const correct = document.getElementById('typing-correct')?.textContent || '0';
        const wrong = document.getElementById('typing-wrong')?.textContent || '0';
        const correctNum = parseInt(correct);
        const wrongNum = parseInt(wrong);
        const total = correctNum + wrongNum;

        const basePerformance = total > 0 ? correctNum / total : 0;

        eventBus.emit('ui:hideModal');
        this.completeGame('typing_test', basePerformance);
    }

    // ========== 座位安排游戏 ==========
    startSeatArrange() {
        const seats = Array(6).fill(null);
        const guests = [
            { id: 'leader1', name: '王局长', priority: 1, note: '主要领导' },
            { id: 'leader2', name: '李副市长', priority: 2, note: '上级领导' },
            { id: 'colleague', name: '张主任', priority: 3, note: '本单位' },
            { id: 'guest', name: '陈总', priority: 4, note: '合作方' }
        ];

        const shuffled = [...guests].sort(() => Math.random() - 0.5);

        const content = `
            <div class="minigame-container">
                <p class="minigame-instruction">请按职位高低安排座位（从左到右降低）</p>
                <div class="seat-arrangement">
                    <div class="seat-labels">
                        <span>主位</span><span></span><span></span>
                    </div>
                    <div class="seats-row">
                        ${seats.map((_, i) => `
                            <div class="seat-slot" data-seat="${i}">
                                <span class="seat-number">${i + 1}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="guest-list">
                    ${shuffled.map(g => `
                        <div class="guest-item" draggable="true" data-guest-id="${g.id}">
                            ${g.name}
                            <small>(${g.note})</small>
                        </div>
                    `).join('')}
                </div>
                <div class="minigame-buttons">
                    <button class="pixel-btn" onclick="miniGameSystem.confirmSeatArrange()">确认安排</button>
                </div>
            </div>
        `;

        eventBus.emit('ui:showModal', {
            title: '🪑 座位安排',
            content,
            buttons: []
        });

        this.setupSeatDragDrop();
    }

    setupSeatDragDrop() {
        setTimeout(() => {
            const guests = document.querySelectorAll('.guest-item');
            const seats = document.querySelectorAll('.seat-slot');

            guests.forEach(guest => {
                guest.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('guestId', guest.dataset.guestId);
                    guest.classList.add('dragging');
                });
                guest.addEventListener('dragend', () => guest.classList.remove('dragging'));
            });

            seats.forEach(seat => {
                seat.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    seat.classList.add('drag-over');
                });
                seat.addEventListener('dragleave', () => seat.classList.remove('drag-over'));
                seat.addEventListener('drop', (e) => {
                    e.preventDefault();
                    seat.classList.remove('drag-over');
                    
                    const guestId = e.dataTransfer.getData('guestId');
                    const guest = document.querySelector(`.guest-item[data-guest-id="${guestId}"]`);
                    
                    if (seat.querySelector('.guest-item')) {
                        // 交换位置
                        const existingGuest = seat.querySelector('.guest-item');
                        const currentSeatGuest = document.querySelector(`.seat-slot:has(.guest-item[data-guest-id="${guest.dataset.guestId}"])`);
                        if (currentSeatGuest) {
                            currentSeatGuest.appendChild(existingGuest);
                        }
                    }
                    
                    seat.appendChild(guest);
                    eventBus.emit('audio:play', { type: 'click' });
                });
            });
        }, 100);
    }

    confirmSeatArrange() {
        const guests = [
            { id: 'leader1', priority: 1 },
            { id: 'leader2', priority: 2 },
            { id: 'colleague', priority: 3 },
            { id: 'guest', priority: 4 }
        ];

        const seats = document.querySelectorAll('.seat-slot');
        let correct = 0;

        seats.forEach((seat, i) => {
            const guestId = seat.querySelector('.guest-item')?.dataset.guestId;
            const guest = guests.find(g => g.id === guestId);
            if (guest && guest.priority === i + 1) {
                correct++;
            }
        });

        const basePerformance = correct / guests.length;

        eventBus.emit('audio:play', { type: basePerformance > 0.5 ? 'success' : 'warning' });
        eventBus.emit('ui:hideModal');
        this.completeGame('seat_arrange', basePerformance);
    }

    // ========== 其他游戏简化版 ==========
    startAgendaOrder() {
        const items = [
            '宣布开会',
            '领导致辞',
            '工作汇报',
            '讨论交流',
            '总结发言',
            '宣布散会'
        ];

        const shuffled = [...items].sort(() => Math.random() - 0.5);

        const content = `
            <div class="minigame-container">
                <p class="minigame-instruction">请按正确顺序排列会议议程：</p>
                <div class="agenda-list" id="agenda-list">
                    ${shuffled.map((item, i) => `
                        <div class="agenda-item" data-order="${i}">
                            <span class="agenda-number">${i + 1}</span>
                            <span class="agenda-text">${item}</span>
                            <button class="agenda-btn up" onclick="miniGameSystem.moveAgenda(${i}, -1)">↑</button>
                            <button class="agenda-btn down" onclick="miniGameSystem.moveAgenda(${i}, 1)">↓</button>
                        </div>
                    `).join('')}
                </div>
                <div class="minigame-buttons">
                    <button class="pixel-btn" onclick="miniGameSystem.confirmAgenda()">确认</button>
                </div>
            </div>
        `;

        eventBus.emit('ui:showModal', {
            title: '📋 议程排序',
            content,
            buttons: []
        });
    }

    moveAgenda(index, direction) {
        const list = document.getElementById('agenda-list');
        const items = list.querySelectorAll('.agenda-item');
        const newIndex = index + direction;
        
        if (newIndex >= 0 && newIndex < items.length) {
            const currentItem = items[index];
            const targetItem = items[newIndex];
            
            if (direction < 0) {
                list.insertBefore(targetItem, currentItem);
            } else {
                list.insertBefore(currentItem, targetItem);
            }
            
            eventBus.emit('audio:play', { type: 'click' });
        }
    }

    confirmAgenda() {
        const items = document.querySelectorAll('.agenda-item');
        const texts = Array.from(items).map(i => i.querySelector('.agenda-text').textContent);

        const correct = [
            '宣布开会', '领导致辞', '工作汇报',
            '讨论交流', '总结发言', '宣布散会'
        ];

        let correctCount = 0;
        texts.forEach((t, i) => {
            if (t === correct[i]) correctCount++;
        });

        const basePerformance = correctCount / correct.length;

        eventBus.emit('audio:play', { type: basePerformance > 0.5 ? 'success' : 'warning' });
        eventBus.emit('ui:hideModal');
        this.completeGame('agenda_order', basePerformance);
    }

    startPathFinding() {
        // 简化版路径选择
        const content = `
            <div class="minigame-container">
                <p class="minigame-instruction">选择最优调研路线（避免拥堵路段）：</p>
                <div class="path-options">
                    <div class="path-option" onclick="miniGameSystem.selectPath(0)">
                        <div class="path-icon">🛣️</div>
                        <div class="path-name">A路线</div>
                        <div class="path-desc">走高速，车程40分钟</div>
                    </div>
                    <div class="path-option" onclick="miniGameSystem.selectPath(1)">
                        <div class="path-icon">🏙️</div>
                        <div class="path-name">B路线</div>
                        <div class="path-desc">走市区，车程60分钟，可能堵车</div>
                    </div>
                    <div class="path-option" onclick="miniGameSystem.selectPath(2)">
                        <div class="path-icon">🛤️</div>
                        <div class="path-name">C路线</div>
                        <div class="path-desc">走小路，车程50分钟，路况一般</div>
                    </div>
                </div>
            </div>
        `;

        eventBus.emit('ui:showModal', {
            title: '🗺️ 调研路线',
            content,
            buttons: []
        });
    }

    selectPath(pathIndex) {
        const performances = [1, 0.6, 0.8];

        eventBus.emit('audio:play', { type: 'click' });
        eventBus.emit('ui:hideModal');
        this.completeGame('path_finding', performances[pathIndex]);
    }

    startDialogueChoice() {
        const scenarios = [
            {
                situation: '领导突然问你对某件事的看法',
                options: [
                    { text: '如实回答，坦诚自己的想法', performance: 0.9 },
                    { text: '谦虚地说自己还在学习中', performance: 0.7 },
                    { text: '委婉地先听听别人的意见', performance: 0.8 }
                ]
            },
            {
                situation: '同事在背后议论领导',
                options: [
                    { text: '及时制止，提醒大家注意', performance: 0.6 },
                    { text: '悄悄离开，不参与讨论', performance: 0.9 },
                    { text: '加入讨论，说几句好话', performance: 0.5 }
                ]
            }
        ];

        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

        const content = `
            <div class="minigame-container">
                <p class="minigame-instruction">${scenario.situation}</p>
                <div class="dialogue-options">
                    ${scenario.options.map((opt, i) => `
                        <button class="dialogue-option" onclick="miniGameSystem.selectDialogue(${i}, ${JSON.stringify(scenario.options).replace(/"/g, '&quot;')})">
                            ${opt.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        eventBus.emit('ui:showModal', {
            title: '💬 对话选择',
            content,
            buttons: []
        });
    }

    selectDialogue(index, options) {
        const basePerformance = options[index].performance;

        eventBus.emit('audio:play', { type: 'click' });
        eventBus.emit('ui:hideModal');
        this.completeGame('dialogue_choice', basePerformance);
    }

    /**
     * 获取游戏结果
     */
    getResults() {
        return this.gameResults;
    }
}

// 全局单例
const miniGameSystem = new MiniGameSystem();
