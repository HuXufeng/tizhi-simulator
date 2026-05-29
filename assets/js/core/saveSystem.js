/**
 * 存档系统 v2
 * 支持：槽位管理、存档命名、快速存档、导出备份、自动存档旋转
 */
class SaveSystem {
    constructor() {
        this.SLOTS_KEY = 'bureaucracy_sim_slots';
        this.AUTOSAVES_KEY = 'bureaucracy_sim_autosaves';
        this.MAX_SLOTS = 10;
        this.MAX_AUTOSAVES = 5;
        this.AUTO_SAVE_INTERVAL = 5;
        this._slotCounter = 0;
        this._pendingSaveCallback = null;

        this.init();
    }

    init() {
        eventBus.on('game:monthStart', () => this.autoSave());
        eventBus.on('game:slack', () => this.autoSave());
    }

    /**
     * 保存到指定槽位，未指定则显示选择界面
     */
    save(slotIndex = null, label = '') {
        const data = gameState.toJSON();
        const meta = this._buildMeta(data);

        const saveData = {
            id: Date.now(),
            label: label || this._autoLabel(meta),
            data,
            meta,
            timestamp: Date.now(),
            version: 2
        };

        if (slotIndex !== null) {
            return this._saveToSlot(slotIndex, saveData);
        }

        // 未指定槽位时，自动保存到空槽或最新槽
        const slots = this._getAllSlots();
        const emptyIdx = slots.findIndex(s => s === null);
        if (emptyIdx >= 0) {
            return this._saveToSlot(emptyIdx, saveData);
        }
        return this._saveToSlot(0, saveData);
    }

    /**
     * 快速保存（覆写第一个槽位）
     */
    quickSave() {
        const slots = this._getAllSlots();
        const emptyIdx = slots.findIndex(s => s === null);
        const idx = emptyIdx >= 0 ? emptyIdx : 0;
        const saveData = this._buildSaveData('');

        // 标记为快速存档
        saveData.isQuickSave = true;

        return this._saveToSlot(idx, saveData);
    }

    /**
     * 保存到指定槽位
     */
    _saveToSlot(slotIndex, saveData) {
        const slots = this._getAllSlots();
        slots[slotIndex] = saveData;
        localStorage.setItem(this.SLOTS_KEY, JSON.stringify(slots));
        eventBus.emit('save:completed', { slot: slotIndex, ...saveData });
        return { slot: slotIndex, ...saveData };
    }

    /**
     * 加载指定槽位
     */
    load(slotIndex) {
        const slots = this._getAllSlots();
        const save = slots[slotIndex];
        if (!save) return false;

        try {
            gameState.fromJSON(save.data);
            gameState.flags.loadedFromSlot = slotIndex;

            if (typeof skillSystem !== 'undefined') {
                skillSystem.restoreFromGameState();
            }

            eventBus.emit('save:loaded', { slot: slotIndex, ...save });
            return true;
        } catch (e) {
            console.error(`加载存档${slotIndex}失败:`, e);
            return false;
        }
    }

    /**
     * 加载自动存档
     */
    loadAutoSave(index = 0) {
        const autosaves = this._getAutosaves();
        const save = autosaves[index];
        if (!save) return false;

        try {
            gameState.fromJSON(save.data);
            if (typeof skillSystem !== 'undefined') {
                skillSystem.restoreFromGameState();
            }
            eventBus.emit('save:loaded', { slot: 'auto', index, ...save });
            return true;
        } catch (e) {
            console.error('自动存档加载失败:', e);
            return false;
        }
    }

    /**
     * 自动存档（滚动覆盖）
     */
    autoSave() {
        this._slotCounter++;
        if (this._slotCounter < this.AUTO_SAVE_INTERVAL) return;
        this._slotCounter = 0;

        const data = gameState.toJSON();
        const meta = this._buildMeta(data);
        const saveData = {
            id: Date.now(),
            label: this._autoLabel(meta),
            data,
            meta,
            timestamp: Date.now(),
            version: 2,
            isAutoSave: true
        };

        let autosaves = this._getAutosaves();
        autosaves.unshift(saveData);
        if (autosaves.length > this.MAX_AUTOSAVES) {
            autosaves.length = this.MAX_AUTOSAVES;
        }
        localStorage.setItem(this.AUTOSAVES_KEY, JSON.stringify(autosaves));
    }

    /**
     * 删除存档
     */
    deleteSave(slotIndex) {
        const slots = this._getAllSlots();
        if (slotIndex >= 0 && slotIndex < slots.length) {
            slots[slotIndex] = null;
            localStorage.setItem(this.SLOTS_KEY, JSON.stringify(slots));
            return true;
        }
        return false;
    }

    /**
     * 重命名存档
     */
    renameSave(slotIndex, newLabel) {
        const slots = this._getAllSlots();
        const save = slots[slotIndex];
        if (save) {
            save.label = newLabel;
            slots[slotIndex] = save;
            localStorage.setItem(this.SLOTS_KEY, JSON.stringify(slots));
            return true;
        }
        return false;
    }

    /**
     * 导出存档为 JSON 字符串
     */
    exportSave(slotIndex) {
        const slots = this._getAllSlots();
        const save = slots[slotIndex];
        if (!save) return null;
        return JSON.stringify(save, null, 2);
    }

    /**
     * 从 JSON 字符串导入存档
     */
    importSave(jsonStr) {
        try {
            const save = JSON.parse(jsonStr);
            if (!save.data || !save.meta) return false;

            const slots = this._getAllSlots();
            const emptyIdx = slots.findIndex(s => s === null);
            const idx = emptyIdx >= 0 ? emptyIdx : slots.length - 1;
            slots[idx] = save;
            localStorage.setItem(this.SLOTS_KEY, JSON.stringify(slots));
            return idx;
        } catch (e) {
            console.error('导入存档失败:', e);
            return false;
        }
    }

    /**
     * 获取存档列表（含元数据）
     */
    getSaveList() {
        const slots = this._getAllSlots();
        return slots.map((save, i) => {
            if (!save) return null;
            return {
                slot: i,
                id: save.id,
                label: save.label,
                timestamp: save.timestamp,
                meta: save.meta,
                isQuickSave: save.isQuickSave,
                version: save.version
            };
        }).filter(Boolean);
    }

    /**
     * 获取自动存档列表
     */
    getAutoSaveList() {
        return this._getAutosaves().map((save, i) => ({
            index: i,
            id: save.id,
            label: save.label,
            timestamp: save.timestamp,
            meta: save.meta,
            isAutoSave: true
        }));
    }

    /**
     * 检查是否有存档
     */
    hasSaves() {
        const slots = this._getAllSlots();
        return slots.some(s => s !== null) || this._getAutosaves().length > 0;
    }

    /**
     * 获取存档统计
     */
    getSaveStats() {
        const slots = this._getAllSlots();
        const filled = slots.filter(s => s !== null).length;
        const autosaves = this._getAutosaves().length;
        return { filled, total: this.MAX_SLOTS, autosaves };
    }

    /**
     * 构建存档元数据
     */
    _buildMeta(data) {
        return {
            month: data.month || 0,
            positionName: data.positionName || '科员',
            position: data.position || 1,
            reputation: data.reputation || 0,
            money: data.money || 0,
            health: data.health || 100,
            energy: data.energy || 100,
            stress: data.stress || 0,
            connections: data.connections || 0,
            slackCount: data.slackCount || 0,
            route: this._calcRoute(data),
            achievements: data.achievements ? Object.keys(data.achievements).filter(k => data.achievements[k]).length : 0,
            totalEndings: data.totalEndingsCollected || 0,
            ngPlusWeek: data.flags?.ngPlusWeek || 1
        };
    }

    _calcRoute(data) {
        const scores = {
            career: (data.reputation || 0) * 1.5 + (data.position || 0) * 20,
            relationship: (data.connections || 0) * 2,
            principle: (data.reputation || 0) * 1.2 - (data.slackCount || 0) * 0.5,
            survival: (data.health || 0) * 0.8 + (data.energy || 0) * 0.3
        };
        const max = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
        const labels = { career: '政绩', relationship: '人脉', principle: '清流', survival: '摸鱼' };
        return labels[max[0]] || '未知';
    }

    _autoLabel(meta) {
        return `第${meta.month}月 ${meta.positionName} · ${meta.route}`;
    }

    _buildSaveData(label) {
        const data = gameState.toJSON();
        const meta = this._buildMeta(data);
        return {
            id: Date.now(),
            label: label || this._autoLabel(meta),
            data,
            meta,
            timestamp: Date.now(),
            version: 2
        };
    }

    _getAllSlots() {
        try {
            const raw = localStorage.getItem(this.SLOTS_KEY);
            const slots = raw ? JSON.parse(raw) : [];
            while (slots.length < this.MAX_SLOTS) slots.push(null);
            return slots;
        } catch (e) {
            return new Array(this.MAX_SLOTS).fill(null);
        }
    }

    _getAutosaves() {
        try {
            const raw = localStorage.getItem(this.AUTOSAVES_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * 渲染时间
     */
    _formatTime(ts) {
        const d = new Date(ts);
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    /**
     * 渲染存档面板（保存模式）
     */
    renderSavePanel(callback) {
        this._pendingSaveCallback = callback;
        const slots = this._getAllSlots();
        const stats = this.getSaveStats();

        let content = `
            <div class="save-panel">
                <div class="save-panel-info">
                    已用 <strong>${stats.filled}</strong> / ${stats.total} 槽 &nbsp;|&nbsp; 自动存档 <strong>${stats.autosaves}</strong>
                    <span class="save-hint">点击槽位保存</span>
                </div>
                <div class="save-slot-grid">
        `;

        slots.forEach((save, i) => {
            content += this._renderSlot(save, i, 'save');
        });

        content += `
                </div>
                <div class="save-panel-actions">
                    <button class="save-action-btn quick-save-btn" data-action="quicksave">⚡ 快速存档</button>
                    <button class="save-action-btn" data-action="autosaves">📋 查看自动存档</button>
                </div>
            </div>
        `;

        eventBus.emit('ui:showModal', {
            title: '💾 保存游戏',
            content,
            width: '95%',
            maxWidth: '520px',
            buttons: [{ text: '返回', callback: () => { if (callback) callback(); } }]
        });

        // 绑定事件
        setTimeout(() => {
            document.querySelectorAll('.save-slot').forEach(el => {
                el.addEventListener('click', (e) => {
                    const slot = parseInt(el.dataset.slot);
                    if (isNaN(slot)) return;
                    this._handleSaveClick(slot);
                });
            });
            document.querySelectorAll('[data-action="quicksave"]').forEach(el => {
                el.addEventListener('click', () => this._handleQuickSave());
            });
            document.querySelectorAll('[data-action="autosaves"]').forEach(el => {
                el.addEventListener('click', () => this.showAutoSavePanel());
            });
        }, 50);
    }

    /**
     * 渲染存档面板（读取模式）
     */
    renderLoadPanel(callback) {
        this._pendingSaveCallback = callback;
        const slots = this._getAllSlots();
        const hasAny = slots.some(s => s !== null);
        const autosaves = this._getAutosaves();

        if (!hasAny && autosaves.length === 0) {
            eventBus.emit('ui:showModal', {
                title: '📂 读取存档',
                content: '<p style="text-align:center;color:var(--text-secondary);padding:20px;">还没有存档，快去创造属于你的故事吧！</p>',
                buttons: [{ text: '返回', callback: () => { if (callback) callback(); } }]
            });
            return;
        }

        let content = `
            <div class="save-panel">
                <div class="save-panel-info">
                    <span class="save-hint">点击槽位加载存档</span>
                </div>
                <div class="save-slot-grid">
        `;

        slots.forEach((save, i) => {
            content += this._renderSlot(save, i, 'load');
        });

        if (autosaves.length > 0) {
            content += `
                <div class="save-autosave-section">
                    <h4>⏰ 自动存档 (${autosaves.length})</h4>
                    <div class="save-autosave-list">
            `;
            autosaves.forEach((save, i) => {
                content += this._renderAutoSaveItem(save, i);
            });
            content += '</div></div>';
        }

        content += `</div></div>`;

        eventBus.emit('ui:showModal', {
            title: '📂 读取存档',
            content,
            width: '95%',
            maxWidth: '520px',
            buttons: [{ text: '返回', callback: () => { if (callback) callback(); } }]
        });

        setTimeout(() => {
            document.querySelectorAll('.save-slot').forEach(el => {
                el.addEventListener('click', (e) => {
                    const slot = parseInt(el.dataset.slot);
                    if (isNaN(slot)) return;
                    this._handleLoadClick(slot);
                });
            });
            document.querySelectorAll('.save-autosave-item').forEach(el => {
                el.addEventListener('click', (e) => {
                    const idx = parseInt(el.dataset.index);
                    if (isNaN(idx)) return;
                    this._handleAutoLoadClick(idx);
                });
            });
        }, 50);
    }

    _renderSlot(save, i, mode) {
        if (!save) {
            return `
                <div class="save-slot save-slot-empty" data-slot="${i}" data-mode="${mode}">
                    <div class="save-slot-num">#${i + 1}</div>
                    <div class="save-slot-empty-icon">＋</div>
                    <div class="save-slot-label">空槽</div>
                </div>
            `;
        }

        const m = save.meta;
        const timeAgo = this._timeAgo(save.timestamp);
        const routeColors = {政绩: '#3498db', 人脉: '#e74c3c', 清流: '#9b59b6', 摸鱼: '#2ecc71'};
        const routeColor = routeColors[m.route] || '#888';
        const isQuick = save.isQuickSave;

        return `
            <div class="save-slot save-slot-filled" data-slot="${i}" data-mode="${mode}">
                <div class="save-slot-num">#${i + 1}</div>
                ${isQuick ? '<div class="save-slot-quick-badge">⚡</div>' : ''}
                <div class="save-slot-body">
                    <div class="save-slot-label">
                        ${save.label}
                    </div>
                    <div class="save-slot-meta">
                        <span class="save-stat">📅 ${m.month}月</span>
                        <span class="save-stat">🏛️ ${m.positionName}</span>
                        <span class="save-stat">📊 ${m.reputation}</span>
                    </div>
                    <div class="save-slot-badges">
                        <span class="save-badge route-badge" style="background:${routeColor}20;color:${routeColor};border-color:${routeColor}40">${m.route}</span>
                        <span class="save-badge">💰 ${m.money}</span>
                        <span class="save-badge">❤️ ${m.health}</span>
                    </div>
                    <div class="save-slot-footer">
                        <span class="save-timestamp">${timeAgo}</span>
                        ${mode === 'load' ? `<span class="save-action-delete" data-slot="${i}">🗑️</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    _renderAutoSaveItem(save, i) {
        const m = save.meta;
        const timeAgo = this._timeAgo(save.timestamp);
        return `
            <div class="save-autosave-item" data-index="${i}">
                <span class="save-auto-icon">⏰</span>
                <span class="save-auto-label">${save.label}</span>
                <span class="save-auto-stat">${m.month}月 · ${m.positionName}</span>
                <span class="save-auto-time">${timeAgo}</span>
            </div>
        `;
    }

    _handleSaveClick(slot) {
        const slots = this._getAllSlots();
        const existing = slots[slot];

        if (existing) {
            // 已有存档，确认覆盖
            eventBus.emit('ui:showModal', {
                title: '⚠️ 覆盖存档？',
                content: `<p>槽位 #${slot + 1} 已有存档：<br><strong>${existing.label}</strong><br>（${existing.meta.month}月 · ${existing.meta.positionName}）</p><p>确定要覆盖吗？</p>`,
                width: '90%',
                maxWidth: '380px',
                buttons: [
                    { text: '✅ 覆盖', callback: () => this._doSave(slot) },
                    { text: '取消', callback: () => {} }
                ]
            });
        } else {
            this._doSave(slot);
        }
    }

    _doSave(slot) {
        // 先显示命名界面
        const slots = this._getAllSlots();
        const existing = slots[slot];
        const defaultName = existing ? existing.label : this._buildSaveData('').label;

        eventBus.emit('ui:showModal', {
            title: `💾 保存到槽位 #${slot + 1}`,
            content: `
                <div class="save-naming">
                    <label class="save-naming-label">存档名称（可选）：</label>
                    <input type="text" class="save-naming-input" id="save-name-input" value="${defaultName}" maxlength="40" placeholder="输入名称..." autofocus>
                    <div class="save-naming-hint">留空将自动命名</div>
                </div>
            `,
            width: '90%',
            maxWidth: '400px',
            buttons: [
                {
                    text: '💾 保存',
                    callback: () => {
                        const input = document.getElementById('save-name-input');
                        const label = input ? input.value.trim() : '';
                        const result = this._saveToSlot(slot, this._buildSaveData(label));
                        eventBus.emit('ui:showMessage', {
                            text: `💾 已保存到槽位 #${slot + 1}`,
                            type: 'success'
                        });
                        if (this._pendingSaveCallback) {
                            setTimeout(() => this._pendingSaveCallback(), 300);
                        }
                    }
                },
                { text: '取消', callback: () => {} }
            ]
        });
    }

    _handleQuickSave() {
        const result = this.quickSave();
        eventBus.emit('ui:showMessage', {
            text: `⚡ 快速保存成功（槽位 #${result.slot + 1}）`,
            type: 'success'
        });
        if (this._pendingSaveCallback) {
            setTimeout(() => this._pendingSaveCallback(), 300);
        }
    }

    _handleLoadClick(slot) {
        const slots = this._getAllSlots();
        const save = slots[slot];
        if (!save) return;

        eventBus.emit('ui:showModal', {
            title: '📂 加载存档？',
            content: `<p>加载槽位 #${slot + 1}：<br><strong>${save.label}</strong><br>（${save.meta.month}月 · ${save.meta.positionName}）</p><p>当前进度将丢失，确定加载吗？</p>`,
            width: '90%',
            maxWidth: '380px',
            buttons: [
                {
                    text: '📂 加载',
                    callback: () => {
                        const ok = this.load(slot);
                        if (ok) {
                            eventBus.emit('ui:showMessage', {
                                text: '📂 存档加载成功！',
                                type: 'success'
                            });
                            setTimeout(() => {
                                if (window.game && window.game.startGame) {
                                    window.game.startGame();
                                }
                            }, 300);
                        }
                    }
                },
                { text: '取消', callback: () => {} }
            ]
        });

        // 绑定删除事件
        setTimeout(() => {
            document.querySelectorAll('.save-action-delete').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const s = parseInt(el.dataset.slot);
                    if (!isNaN(s)) this._handleDeleteClick(s);
                });
            });
        }, 50);
    }

    _handleAutoLoadClick(index) {
        eventBus.emit('ui:showModal', {
            title: '📂 加载自动存档？',
            content: `<p>加载自动存档 #${index + 1}，当前进度将丢失。</p>`,
            width: '90%',
            maxWidth: '380px',
            buttons: [
                {
                    text: '📂 加载',
                    callback: () => {
                        const ok = this.loadAutoSave(index);
                        if (ok) {
                            eventBus.emit('ui:showMessage', {
                                text: '📂 自动存档加载成功！',
                                type: 'success'
                            });
                            setTimeout(() => {
                                if (window.game && window.game.startGame) {
                                    window.game.startGame();
                                }
                            }, 300);
                        }
                    }
                },
                { text: '取消', callback: () => {} }
            ]
        });
    }

    _handleDeleteClick(slot) {
        const slots = this._getAllSlots();
        const save = slots[slot];
        if (!save) return;

        eventBus.emit('ui:showModal', {
            title: '🗑️ 删除存档？',
            content: `<p>确定删除槽位 #${slot + 1} 的存档？<br><strong>${save.label}</strong></p><p>此操作不可撤销！</p>`,
            width: '90%',
            maxWidth: '380px',
            buttons: [
                {
                    text: '🗑️ 删除',
                    callback: () => {
                        this.deleteSave(slot);
                        eventBus.emit('ui:showMessage', {
                            text: `🗑️ 槽位 #${slot + 1} 已删除`,
                            type: 'success'
                        });
                        // 刷新面板
                        this.renderLoadPanel(this._pendingSaveCallback);
                    }
                },
                { text: '取消', callback: () => {} }
            ]
        });
    }

    /**
     * 显示自动存档面板
     */
    showAutoSavePanel() {
        const autosaves = this._getAutosaves();
        if (autosaves.length === 0) {
            eventBus.emit('ui:showMessage', { text: '暂无自动存档', type: 'system' });
            return;
        }

        let content = `
            <div class="save-panel">
                <div class="save-panel-info">
                    <span class="save-hint">自动存档每5月自动保存一次，最多保留${this.MAX_AUTOSAVES}份</span>
                </div>
                <div class="save-autosave-list-full">
        `;

        autosaves.forEach((save, i) => {
            const m = save.meta;
            const timeAgo = this._timeAgo(save.timestamp);
            content += `
                <div class="save-autosave-item-full" data-index="${i}">
                    <div class="save-auto-header">
                        <span class="save-auto-icon">⏰</span>
                        <span class="save-auto-label">${save.label}</span>
                        <span class="save-auto-time">${timeAgo}</span>
                    </div>
                    <div class="save-auto-meta">
                        <span>📅 ${m.month}月</span>
                        <span>🏛️ ${m.positionName}</span>
                        <span>📊 ${m.reputation}</span>
                        <span>💰 ${m.money}</span>
                        <span>❤️ ${m.health}</span>
                    </div>
                    <div class="save-auto-actions">
                        <button class="save-auto-load-btn" data-index="${i}">📂 加载</button>
                    </div>
                </div>
            `;
        });

        content += '</div></div>';

        eventBus.emit('ui:showModal', {
            title: '⏰ 自动存档',
            content,
            width: '95%',
            maxWidth: '480px',
            buttons: [{ text: '返回', callback: () => {} }]
        });

        setTimeout(() => {
            document.querySelectorAll('.save-auto-load-btn').forEach(el => {
                el.addEventListener('click', () => {
                    const idx = parseInt(el.dataset.index);
                    if (!isNaN(idx)) this._handleAutoLoadClick(idx);
                });
            });
        }, 50);
    }

    /**
     * 继续游戏提示（增强版）
     */
    showContinuePrompt() {
        const saveList = this.getSaveList();
        const autosaves = this._getAutosaves();

        if (saveList.length === 0 && autosaves.length === 0) return;

        const latest = saveList.length > 0 ? saveList[0] : null;
        const latestAuto = autosaves.length > 0 ? autosaves[0] : null;

        // 比较哪个更新
        let newest = latest;
        if (latestAuto && (!latest || latestAuto.timestamp > latest.timestamp)) {
            newest = { ...latestAuto, slot: 'auto', index: 0 };
        }

        if (!newest) return;

        const m = newest.meta;
        const timeAgo = this._timeAgo(newest.timestamp);

        const recentSaves = saveList.slice(0, 3);

        let content = `
            <div class="continue-panel">
                <div class="continue-latest">
                    <div class="continue-latest-label">最新存档</div>
                    <div class="continue-latest-info">
                        <span class="continue-stat">📅 第${m.month}月</span>
                        <span class="continue-stat">🏛️ ${m.positionName}</span>
                        <span class="continue-stat">📊 ${m.reputation}声望</span>
                        <span class="continue-stat">💰 ${m.money}元</span>
                    </div>
                    <div class="continue-latest-time">${timeAgo}</div>
                </div>
        `;

        if (recentSaves.length > 1) {
            content += `
                <div class="continue-recent">
                    <div class="continue-recent-label">其他存档</div>
                    ${recentSaves.slice(1).map(s => `
                        <div class="continue-recent-item" data-slot="${s.slot}">
                            <span class="continue-recent-name">${s.label}</span>
                            <span class="continue-recent-meta">${s.meta.month}月 · ${s.meta.positionName}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        content += '</div>';

        eventBus.emit('ui:showModal', {
            title: '继续游戏？',
            content,
            width: '90%',
            maxWidth: '420px',
            buttons: [
                {
                    text: '📂 继续',
                    callback: () => {
                        if (newest.slot === 'auto') {
                            this.loadAutoSave(newest.index);
                        } else {
                            this.load(newest.slot);
                        }
                        setTimeout(() => {
                            if (window.game && window.game.startGame) {
                                window.game.startGame();
                            }
                        }, 300);
                    }
                },
                {
                    text: '📋 查看所有存档',
                    callback: () => this.renderLoadPanel()
                },
                {
                    text: '🆕 新游戏',
                    callback: () => {
                        gameState.reset();
                        if (window.game && window.game.startGame) {
                            window.game.startGame();
                        }
                    }
                }
            ]
        });

        setTimeout(() => {
            document.querySelectorAll('.continue-recent-item').forEach(el => {
                el.addEventListener('click', () => {
                    const slot = parseInt(el.dataset.slot);
                    if (!isNaN(slot)) {
                        this.load(slot);
                        setTimeout(() => {
                            if (window.game && window.game.startGame) {
                                window.game.startGame();
                            }
                        }, 300);
                    }
                });
            });
        }, 50);
    }

    _timeAgo(ts) {
        const diff = Date.now() - ts;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return '刚刚';
        if (mins < 60) return `${mins}分钟前`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}小时前`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}天前`;
        return this._formatTime(ts);
    }
}

const saveSystem = new SaveSystem();