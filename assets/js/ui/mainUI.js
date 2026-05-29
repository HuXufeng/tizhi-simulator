class MainUI {
    constructor() {
        this.elements = {};
        this._modalHiding = false;
        this._toastQueue = [];
        this._isToastShowing = false;
        this._toastPositions = new Map();
        this._toastIdCounter = 0;
        this._initElements();
        this._bindEvents();
        this.createIntroParticles();
    }

    _initElements() {
        this.elements = {
            introScreen: document.getElementById('intro-screen'),
            mainScreen: document.getElementById('main-screen'),
            btnStart: document.getElementById('btn-start'),
            messageArea: document.getElementById('message-area'),
            choiceArea: document.getElementById('choice-area'),
            btnSlack: document.getElementById('btn-slack'),
            modalOverlay: document.getElementById('modal-overlay'),
            modalContent: document.getElementById('modal-content'),
            statDay: document.getElementById('stat-day'),
            statTime: document.getElementById('stat-time'),
            statEnergy: document.getElementById('stat-energy'),
            statReputation: document.getElementById('stat-reputation'),
            statMoney: document.getElementById('stat-money'),
            barEnergy: document.getElementById('bar-energy'),
            barStress: document.getElementById('bar-stress'),
            valEnergy: document.getElementById('val-energy'),
            valStress: document.getElementById('val-stress'),
            statConnections: document.getElementById('stat-connections'),
            statPosition: document.getElementById('stat-position'),
            statTitleText: document.getElementById('stat-title-text'),
            statTitle: document.getElementById('stat-title'),
            statMatch: document.getElementById('stat-match'),
            statMatchText: document.getElementById('stat-match-text'),
            statNgplus: document.getElementById('stat-ngplus'),
            statNgplusText: document.getElementById('stat-ngplus-text'),
            environmentHint: document.getElementById('environment-hint'),
            toastContainer: document.getElementById('toast-container'),
            introParticles: document.getElementById('intro-particles')
        };
    }

    _bindEvents() {
        this.elements.btnStart.addEventListener('click', () => {
            this.elements.introScreen.style.display = 'none';
            if (typeof characterCreationSystem !== 'undefined') {
                characterCreationSystem.showCharacterCreationUI();
            } else {
                eventBus.emit('game:start');
            }
        });

        this.elements.btnSlack.addEventListener('click', () => {
            eventBus.emit('game:slack');
        });

        eventBus.on('ui:showMessage', (data) => this.showMessage(data));
        eventBus.on('ui:showChoices', (data) => this.showChoices(data));
        eventBus.on('ui:clearChoices', () => this.clearChoices());
        eventBus.on('ui:updateStatus', () => this.updateStatusBar());
        eventBus.on('ui:showModal', (data) => this.showModal(data));
        eventBus.on('ui:hideModal', () => this.hideModal());
        eventBus.on('ui:showToast', (data) => this.showToast(data.text, data.type));
        eventBus.on('stat:changed', () => this.updateStatusBar());
        eventBus.on('phase:changed', () => {
            this.updateStatusBar();
            this.updateEnvironmentHint();
        });
        eventBus.on('month:changed', () => {
            this.updateStatusBar();
            this.updateEnvironmentHint();
        });
        eventBus.on('match:update', (data) => this.updateMatchDisplay(data));
        eventBus.on('match:reset', () => this.hideMatchDisplay());
        eventBus.on('ui:showScreenFlash', (data) => this.showScreenFlash(data.type));
        eventBus.on('achievement:unlocked', () => this.showScreenFlash('success'));
        eventBus.on('stat:changed', (data) => {
            this.updateStatusBar();
            if (data.stat === 'energy' && data.value <= 20) {
                this.showScreenFlash('danger');
            } else if (data.stat === 'stress' && data.value >= 80) {
                this.showScreenFlash('warning');
            }
        });

        this._initTouchGestures();
    }

    updateMatchDisplay(data) {
        if (data.count > 0) {
            const typeNames = { work: '工作', social: '社交', rest: '休息', study: '学习' };
            const typeName = typeNames[data.type] || data.type;
            this.elements.statMatchText.textContent = `${typeName} ${data.count}/3`;
            this.elements.statMatch.style.display = 'flex';
        } else {
            this.hideMatchDisplay();
        }
    }

    hideMatchDisplay() {
        this.elements.statMatch.style.display = 'none';
    }

    showMatchStepProgress(matchTasks) {
        const typeLabels = { work: '📋工作', social: '🍵社交', rest: '☕休息', study: '📚学习', special: '🎲事件' };

        const bar = document.createElement('div');
        bar.className = 'match-status-bar';
        let html = '<span>🎴 月度计划</span>';
        for (let i = 0; i < 3; i++) {
            const task = matchTasks[i];
            let cell = `第${i + 1}步`;
            if (task) {
                const label = typeLabels[taskSystem.getCardType(task)] || '❓';
                cell = `${label} ✓`;
            }
            html += `<span class="match-step ${task ? 'filled' : ''}">${cell}</span>`;
        }
        if (matchTasks.length > 0 && matchTasks.length < 3) {
            const currentType = taskSystem.getCardType(matchTasks[0]);
            const label = typeLabels[currentType] || '❓';
            html += `<span style="color:var(--accent);font-size:11px;">→ 当前: ${label} ${matchTasks.length}/3</span>`;
        }
        bar.innerHTML = html;
        this.elements.choiceArea.appendChild(bar);
    }

    renderCardHand(cards, onPlayCard) {
        this.clearChoices();

        const handContainer = document.createElement('div');
        handContainer.className = 'card-hand';

        cards.forEach((card, index) => {
            const typeLabels = { work: '📋', social: '🍵', rest: '☕', study: '📚', special: '🎲' };
            const costText = card.energyCost > 0 ? `精力-${card.energyCost}` :
                card.energyCost < 0 ? `精力+${Math.abs(card.energyCost)}` : '';
            const stressText = card.stressGain > 0 ? `压力+${card.stressGain}` :
                card.stressGain < 0 ? `压力${card.stressGain}` : '';

            const el = document.createElement('div');
            el.className = `card-item type-${card.activityType}${card.isEvent ? ' is-event' : ''}${card.isCurse ? ' is-curse' : ''}`;
            el.innerHTML = `
                <div class="card-type-badge">${typeLabels[card.activityType] || '❓'}</div>
                <div class="card-icon">${card.icon}</div>
                <div class="card-name">${card.name}</div>
                <div class="card-cost">${costText}</div>
                ${stressText ? `<div class="card-stress">${stressText}</div>` : ''}
                ${card.specialEffect ? `<div class="card-effect">${card.specialEffect}</div>` : ''}
            `;
            el.addEventListener('click', () => onPlayCard(index, card, el));
            handContainer.appendChild(el);
        });

        this.elements.choiceArea.appendChild(handContainer);
    }

    renderPlayedSlots(playedCards) {
        const phaseNames = ['上旬', '中旬', '下旬'];
        const slotContainer = document.createElement('div');
        slotContainer.className = 'played-slots';

        for (let i = 0; i < 3; i++) {
            const slot = document.createElement('div');
            slot.className = `played-slot ${playedCards[i] ? 'filled' : 'empty'}`;
            const card = playedCards[i];
            if (card) {
                const typeLabels = { work: '📋', social: '🍵', rest: '☕', study: '📚', special: '🎲' };
                slot.innerHTML = `
                    <span class="slot-phase">${phaseNames[i]}</span>
                    <span class="slot-icon">${typeLabels[card.activityType] || '❓'} ${card.icon}</span>
                    <span class="slot-name">${card.name}</span>
                `;
            } else {
                slot.innerHTML = `<span class="slot-phase">${phaseNames[i]}</span><span class="slot-empty-text">未出牌</span>`;
            }
            slotContainer.appendChild(slot);
        }

        this.elements.choiceArea.appendChild(slotContainer);
    }

    showMatchHint(hint) {
        if (!hint) return;
        const existing = this.elements.choiceArea.querySelector('.match-hint');
        if (existing) existing.remove();

        const hintEl = document.createElement('div');
        hintEl.className = 'match-hint';
        hintEl.textContent = hint;
        this.elements.choiceArea.appendChild(hintEl);
    }

    showMessage({ text, type = 'system' }) {
        const msg = document.createElement('div');
        msg.className = `message ${type} message-appear`;
        msg.textContent = text;
        this.elements.messageArea.prepend(msg);
        this.elements.messageArea.scrollTop = 0;
        const maxMessages = 100;
        while (this.elements.messageArea.children.length > maxMessages) {
            this.elements.messageArea.lastChild.remove();
        }
    }

    showChoices({ choices }) {
        this.clearChoices();
        
        // 判断选择类型
        const firstText = choices[0]?.text || '';
        const hasTaskInfo = firstText.includes('时段') || firstText.includes('精力');
        const isSlack = firstText.includes('摸鱼') || firstText.includes('偷懒');
        const isEvent = choices.some(c => c.important !== undefined);
        
        let headerIcon = '📝';
        let headerLabel = `选择操作 (${choices.length})`;
        if (hasTaskInfo) {
            headerIcon = '📋';
            headerLabel = `任务选择 (${choices.length})`;
        } else if (isSlack) {
            headerIcon = '😏';
            headerLabel = `摸鱼行动 (${choices.length})`;
        } else if (isEvent) {
            headerIcon = '⚡';
            headerLabel = `事件应对 (${choices.length})`;
        }
        
        // 面板
        const panel = document.createElement('div');
        panel.className = 'choice-panel';
        
        // 面板头部
        const header = document.createElement('div');
        header.className = 'choice-header';
        header.innerHTML = `
            <span class="choice-header-icon">${headerIcon}</span>
            <span class="choice-header-label">${headerLabel}</span>
            <span class="choice-header-badge">${choices.length}</span>
            <span class="choice-header-arrow expanded">▼</span>
        `;
        
        // 选项容器
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'all-options';
        
        // 渲染所有选项
        choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            let classes = ['choice-btn'];
            
            if (choice.disabled) {
                classes.push('choice-disabled');
            }
            
            const text = choice.text.toLowerCase();
            const effects = choice.effects || {};
            
            if (choice.important || 
                text.includes('重要') || text.includes('关键') || 
                text.includes('提拔') || text.includes('晋升') ||
                text.includes('机会')) {
                classes.push('choice-important');
            } else if (text.includes('拒绝') || text.includes('顶撞') || 
                       text.includes('不做') || text.includes('反对') ||
                       text.includes('偷懒') ||
                       (effects.health && effects.health < -10) ||
                       (effects.stress && effects.stress > 10) ||
                       (effects.reputation && effects.reputation < -10)) {
                classes.push('choice-danger');
            }
            
            btn.className = classes.join(' ');
            btn.textContent = choice.text;
            btn.addEventListener('click', () => {
                if (choice.callback) choice.callback();
                eventBus.emit('ui:choiceSelected', { index, choice });
            });
            optionsContainer.appendChild(btn);
        });
        
        // 切换展开/折叠
        let isExpanded = true;
        header.addEventListener('click', () => {
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                optionsContainer.style.maxHeight = optionsContainer.scrollHeight + 'px';
                optionsContainer.style.opacity = '1';
                optionsContainer.style.paddingBottom = '12px';
                header.querySelector('.choice-header-arrow').classList.add('expanded');
            } else {
                optionsContainer.style.maxHeight = '0px';
                optionsContainer.style.opacity = '0';
                optionsContainer.style.paddingBottom = '0';
                header.querySelector('.choice-header-arrow').classList.remove('expanded');
            }
        });
        
        panel.appendChild(header);
        panel.appendChild(optionsContainer);
        this.elements.choiceArea.appendChild(panel);
        
        // 默认展开
        setTimeout(() => {
            optionsContainer.style.maxHeight = optionsContainer.scrollHeight + 'px';
            optionsContainer.style.opacity = '1';
            optionsContainer.style.paddingBottom = '12px';
            header.querySelector('.choice-header-arrow').classList.add('expanded');
        }, 50);
    }

    clearChoices() {
        this.elements.choiceArea.innerHTML = '';
    }

    showUtilityActions(actions) {
        const panel = document.createElement('div');
        panel.className = 'choice-panel utility-actions';

        const header = document.createElement('div');
        header.className = 'choice-header';
        header.innerHTML = `
            <span class="choice-header-icon">⚙️</span>
            <span class="choice-header-label">快捷操作</span>
            <span class="choice-header-badge">${actions.length}</span>
            <span class="choice-header-arrow expanded">▼</span>
        `;

        const container = document.createElement('div');
        container.className = 'all-options';

        actions.forEach((action, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = action.text;
            btn.addEventListener('click', () => {
                if (action.callback) action.callback();
                eventBus.emit('ui:choiceSelected', { index });
            });
            container.appendChild(btn);
        });

        let isExpanded = true;
        header.addEventListener('click', () => {
            isExpanded = !isExpanded;
            if (isExpanded) {
                container.style.maxHeight = container.scrollHeight + 'px';
                container.style.opacity = '1';
                container.style.paddingBottom = '12px';
                header.querySelector('.choice-header-arrow').classList.add('expanded');
            } else {
                container.style.maxHeight = '0px';
                container.style.opacity = '0';
                container.style.paddingBottom = '0';
                header.querySelector('.choice-header-arrow').classList.remove('expanded');
            }
        });

        panel.appendChild(header);
        panel.appendChild(container);
        this.elements.choiceArea.appendChild(panel);

        setTimeout(() => {
            header.querySelector('.choice-header-arrow').classList.add('expanded');
        }, 50);
    }

    updateStatusBar() {
        if (!gameState || !this.elements) return;
        
        const e = this.elements;
        
        if (e.statDay) {
            e.statDay.textContent = `第${gameState.month}月`;
        }
        if (e.statTime) {
            const phase = gameState.phase || 'early';
            const phaseNames = { early: '🌅 上旬', mid: '☀️ 中旬', late: '🌙 下旬' };
            e.statTime.innerHTML = `<span class="time-indicator ${phase}">${phaseNames[phase] || '🌅 上旬'}</span>`;
        }

        const energyPct = Math.max(0, Math.min(100, (gameState.energy / gameState.maxEnergy) * 100));
        const stressPct = Math.max(0, Math.min(100, (gameState.stress / gameState.maxStress) * 100));

        if (e.barEnergy) {
            e.barEnergy.style.width = `${energyPct}%`;
            e.barEnergy.className = 'pixel-progress-bar bar-energy';
            if (energyPct <= 20) {
                e.barEnergy.classList.add('stat-bar-energy-low');
            } else if (energyPct > 60) {
                e.barEnergy.classList.add('stat-bar-energy-high');
            }
        }
        if (e.barStress) {
            e.barStress.style.width = `${stressPct}%`;
            if (stressPct >= 70) {
                e.barStress.classList.add('stat-bar-stress-high');
            }
        }
        if (e.valEnergy) {
            e.valEnergy.textContent = gameState.energy;
        }
        if (e.valStress) {
            e.valStress.textContent = gameState.stress;
        }

        if (e.statEnergy) {
            e.statEnergy.textContent = `精力 ${gameState.energy}`;
        }
        if (e.statReputation) {
            e.statReputation.textContent = `声望 ${gameState.reputation}`;
        }
        if (e.statMoney) {
            e.statMoney.textContent = `${gameState.money}元`;
        }

        if (e.statConnections) {
            e.statConnections.textContent = `人脉 ${gameState.connections}`;
        }
        if (e.statPosition) {
            e.statPosition.textContent = gameState.positionName;
        }
        if (e.statTitleText) {
            e.statTitleText.textContent = gameState.activeTitle || gameState.positionName;
        }

        if (typeof ngPlusSystem !== 'undefined' && ngPlusSystem.currentWeek > 1) {
            if (e.statNgplus) {
                e.statNgplus.style.display = 'flex';
                if (e.statNgplusText) {
                    e.statNgplusText.textContent = `第${ngPlusSystem.currentWeek}周目`;
                }
            }
        } else {
            if (e.statNgplus) {
                e.statNgplus.style.display = 'none';
            }
        }
    }

    updateEnvironmentHint() {
        if (!this.elements.environmentHint) return;
        const desc = timeSystem.getSeasonDescription();
        if (desc) {
            this.elements.environmentHint.textContent = desc;
            this.elements.environmentHint.style.animation = 'none';
            void this.elements.environmentHint.offsetHeight;
            this.elements.environmentHint.style.animation = '';
        }
    }

    showToast(text, type = 'info') {
        const typeMap = {
            'success': 'success',
            'danger': 'error',
            'milestone': 'milestone',
            'info': 'info',
            'achievement': 'achievement'
        };
        this._toastQueue.push({ text, type: typeMap[type] || 'info' });
        this._processToastQueue();
    }

    _processToastQueue() {
        if (this._isToastShowing || this._toastQueue.length === 0) return;
        if (!this.elements.toastContainer) return;

        this._isToastShowing = true;
        const { text, type } = this._toastQueue.shift();

        const toastId = this._toastIdCounter++;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.dataset.toastId = toastId;
        toast.textContent = text;

        const existingToasts = this.elements.toastContainer.querySelectorAll('.toast');
        const offset = existingToasts.length * 48;
        toast.style.transform = `translateY(${offset}px)`;

        this.elements.toastContainer.appendChild(toast);

        this._toastPositions.set(toastId, setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = `translateY(${offset}px) translateY(-10px)`;
                setTimeout(() => {
                    toast.remove();
                    this._toastPositions.delete(toastId);
                    this._repositionToasts();
                    this._isToastShowing = false;
                    this._processToastQueue();
                }, 300);
            }
        }, 2800));
    }

    _repositionToasts() {
        const toasts = this.elements.toastContainer.querySelectorAll('.toast');
        toasts.forEach((t, i) => {
            t.style.transform = `translateY(${i * 48}px)`;
            t.style.transition = 'transform 0.3s ease';
        });
    }

    _initTouchGestures() {
        const msgArea = this.elements.messageArea;
        if (!msgArea) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let isScrolling = false;

        msgArea.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
            isScrolling = false;
        }, { passive: true });

        msgArea.addEventListener('touchmove', (e) => {
            if (!touchStartX || !touchStartY) return;
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchStartX);
            const deltaY = Math.abs(touch.clientY - touchStartY);
            if (deltaY > 10) {
                isScrolling = true;
            }
        }, { passive: true });

        msgArea.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            if (isScrolling) {
                touchStartX = 0;
                touchStartY = 0;
                return;
            }

            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const elapsed = Date.now() - touchStartTime;

            if (elapsed > 500) {
                touchStartX = 0;
                touchStartY = 0;
                return;
            }

            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            touchStartX = 0;
            touchStartY = 0;
        }, { passive: true });
    }


    createIntroParticles() {
        if (!this.elements.introParticles) return;
        this.elements.introParticles.innerHTML = '';
        const count = 30;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'intro-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 4}s`;
            particle.style.animationDuration = `${3 + Math.random() * 3}s`;
            const size = 2 + Math.random() * 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = `${0.3 + Math.random() * 0.5}`;
            this.elements.introParticles.appendChild(particle);
        }
    }

    showModal(options) {
        if (typeof options === 'string') {
            options = { content: options };
        }
        
        const { title = '', content = '', buttons = [], width = '90%', maxWidth = '400px' } = options;
        
        this._modalHiding = false;
        this.elements.modalContent.style.width = width;
        this.elements.modalContent.style.maxWidth = maxWidth;

        let html = '';
        if (title) {
            html += `<h3 style="color: var(--gold); margin-bottom: 12px;">${title}</h3>`;
        }
        html += `<div style="margin-bottom: 16px; max-height: 60vh; overflow-y: auto;">${content}</div>`;
        
        if (buttons.length > 0) {
            html += `
                <div style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
                    ${buttons.map((btn, i) => `
                        <button class="pixel-btn" data-modal-btn="${i}" style="font-size: 12px; padding: 8px 16px;">
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>
            `;
        }
        
        this.elements.modalContent.innerHTML = html;

        this.elements.modalContent.querySelectorAll('[data-modal-btn]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.modalBtn);
                if (buttons[index] && buttons[index].callback) {
                    buttons[index].callback();
                }
                this.hideModal();
            });
        });

        this.elements.modalOverlay.classList.remove('modal-hiding');
        this.elements.modalOverlay.style.display = 'flex';
        requestAnimationFrame(() => {
            this.elements.modalOverlay.classList.add('modal-visible');
        });
    }

    hideModal() {
        if (this._modalHiding) return;
        this._modalHiding = true;
        this.elements.modalOverlay.classList.add('modal-hiding');
        this.elements.modalOverlay.classList.remove('modal-visible');
        const onEnd = () => {
            this.elements.modalOverlay.removeEventListener('transitionend', onEnd);
            if (this._modalHiding) {
                this.elements.modalOverlay.style.display = 'none';
                this.elements.modalOverlay.classList.remove('modal-hiding');
                this.elements.modalContent.innerHTML = '';
                this._modalHiding = false;
            }
        };
        this.elements.modalOverlay.addEventListener('transitionend', onEnd);
        setTimeout(() => {
            if (this._modalHiding) {
                this.elements.modalOverlay.style.display = 'none';
                this.elements.modalOverlay.classList.remove('modal-hiding');
                this.elements.modalContent.innerHTML = '';
                this._modalHiding = false;
            }
        }, 400);
    }

    showMainScreen() {
        const e = this.elements;
        if (!e || !e.introScreen || !e.mainScreen) return;
        
        e.introScreen.style.display = 'none';
        e.mainScreen.style.display = 'flex';
        
        requestAnimationFrame(() => {
            this.updateStatusBar();
            this.updateEnvironmentHint();
        });
    }

    showIntroScreen() {
        this.elements.introScreen.style.display = 'flex';
        this.elements.mainScreen.style.display = 'none';
        this.createIntroParticles();
    }

    screenFlash(type = 'success') {
        const flash = document.createElement('div');
        flash.className = `screen-flash ${type}`;
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 300);
    }

    showScreenFlash(type) {
        if (!this.elements.mainScreen) return;
        
        const flash = document.createElement('div');
        flash.className = `screen-flash ${type}`;
        flash.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50;
        `;
        
        this.elements.mainScreen.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 300);
    }
}

const mainUI = new MainUI();
