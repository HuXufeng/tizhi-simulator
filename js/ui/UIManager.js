/**
 * UI 管理器 - 体制内模拟器 2.0
 */

class UIManager {
  constructor() {
    this.gameEngine = null;
  }

  // 初始化
  init() {
    console.log('🎨 初始化 UI 管理器...');
    this.gameEngine = window.GameEngine;
    this.updateAll();
  }

  // 更新所有 UI
  updateAll() {
    if (!this.gameEngine || !this.gameEngine.state) return;
    
    const state = this.gameEngine.state;
    
    this.updateStatusBar(state);
    this.updateVoiceUI();
    this.updateStatsUI(state);
    this.updateCharacterUI(state);
    this.updateSkillUIAll();
  }

  // 更新状态栏
  updateStatusBar(state) {
    document.getElementById('currentDay').textContent = state.day;
    document.getElementById('currentTime').textContent = `${String(state.hour).padStart(2, '0')}:00`;
    document.getElementById('energyValue').textContent = state.needs.energy;
    document.getElementById('healthValue').textContent = state.needs.health;
    document.getElementById('moodValue').textContent = state.needs.mood;
  }

  // 更新声音 UI
  updateVoiceUI() {
    if (!this.gameEngine || !this.gameEngine.state) return;
    
    const voices = this.gameEngine.state.voices;
    
    // 更新野心家
    document.getElementById('ambitionBar').style.width = `${voices.ambition}%`;
    
    // 更新老好人
    document.getElementById('goodpersonBar').style.width = `${voices.goodperson}%`;
    
    // 更新谨慎派
    document.getElementById('cautiousBar').style.width = `${voices.cautious}%`;
  }

  // 更新属性面板
  updateStatsUI(state) {
    // 精力
    document.getElementById('energyDisplay').textContent = `${state.needs.energy}/100`;
    document.getElementById('energyBar').style.width = `${state.needs.energy}%`;
    
    // 健康
    document.getElementById('healthDisplay').textContent = `${state.needs.health}/100`;
    document.getElementById('healthBar').style.width = `${state.needs.health}%`;
    
    // 心态
    document.getElementById('moodDisplay').textContent = `${state.needs.mood}/100`;
    document.getElementById('moodBar').style.width = `${state.needs.mood}%`;
    
    // 归属感
    document.getElementById('belongingDisplay').textContent = `${state.needs.belonging}/100`;
    document.getElementById('belongingBar').style.width = `${state.needs.belonging}%`;
    
    // 声望
    document.getElementById('reputationDisplay').textContent = `${state.reputation}/100`;
    document.getElementById('reputationBar').style.width = `${state.reputation}%`;
  }

  // 更新角色 UI
  updateCharacterUI(state) {
    const container = document.getElementById('characterView');
    if (!container) return;
    
    let html = '';
    
    for (const [charId, relationship] of Object.entries(state.relationships)) {
      const charData = CHARACTER_DATABASE[charId];
      if (!charData) continue;
      
      html += `
        <div class="character-card" onclick="showCharacterDetail('${charId}')">
          <div class="character-avatar" style="border-color: ${this.getRelationColor(relationship.trust)}">
            ${charData.emoji}
          </div>
          <div class="character-info">
            <div class="character-name">${charData.name}</div>
            <div class="character-role">${charData.role}</div>
            <div class="character-trust">信任 ${relationship.trust}</div>
            <div class="character-trust-bar">
              <div class="character-trust-fill" style="width: ${relationship.trust}%"></div>
            </div>
          </div>
        </div>
      `;
    }
    
    container.innerHTML = html;
  }

  // 获取关系颜色
  getRelationColor(trust) {
    if (trust >= 80) return '#38b764';
    if (trust >= 60) return '#3b5dc9';
    if (trust >= 40) return '#ffcd75';
    if (trust >= 20) return '#ef7d57';
    return '#b13e53';
  }

  // 更新所有技能 UI
  updateSkillUIAll() {
    if (!this.gameEngine || !this.gameEngine.state) return;
    
    const skills = this.gameEngine.state.skills;
    
    for (const [skillId, skillData] of Object.entries(skills)) {
      this.updateSkillUI(skillId);
    }
  }

  // 更新单个技能 UI
  updateSkillUI(skillId) {
    if (!this.gameEngine || !this.gameEngine.state) return;
    
    const skill = this.gameEngine.state.skills[skillId];
    if (!skill) return;
    
    // 更新等级显示
    const levelElement = document.getElementById(`${skillId}Level`);
    if (levelElement) {
      levelElement.textContent = skill.level;
    }
    
    // 更新技能节点
    const containerId = `${skillId}Skills`;
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = this.generateSkillNodes(skillId, skill.level);
    }
  }

  // 生成技能节点
  generateSkillNodes(skillId, currentLevel) {
    const tree = SKILL_TREES[skillId];
    if (!tree) return '';
    
    let html = '';
    
    for (let i = 1; i <= 4; i++) {
      const levelData = tree.levels[i - 1];
      const isUnlocked = i <= currentLevel;
      const skills = levelData.skills || [];
      
      if (skills.length > 0) {
        for (const skill of skills) {
          html += `
            <div class="skill-node ${isUnlocked ? 'unlocked' : 'locked'}" 
                 title="${skill.name}"
                 onclick="showSkillDetail('${skillId}', '${skill.id}')">
              <span class="skill-node-icon">${skill.icon}</span>
              <div class="skill-node-name">${skill.name}</div>
              ${isUnlocked ? `<div class="skill-node-level">Lv.${i}</div>` : '<div class="skill-node-level">🔒</div>'}
            </div>
          `;
        }
      }
    }
    
    return html;
  }

  // 渲染任务列表
  renderTaskList(tasks) {
    const container = document.getElementById('taskView');
    if (!container) return;
    
    if (!tasks || tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-state-icon">📋</span>
          <p class="empty-state-text">今天没有任务了<br>休息一下吧～</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    for (const task of tasks) {
      const tagClass = this.getTagClass(task.difficulty);
      const tagText = this.getTagText(task.difficulty);
      
      html += `
        <div class="task-card" onclick="openEventModal(window.currentEvent = ${JSON.stringify(task).replace(/"/g, '&quot;')})">
          <div class="task-header">
            <span class="pixel-tag ${tagClass}">${tagText}</span>
            <span class="task-icon">${this.getCategoryIcon(task.category)}</span>
          </div>
          <div class="task-title">${task.title}</div>
          <div class="task-desc">${task.description}</div>
          <div class="task-footer">
            <div class="task-cost">
              ${task.timeCost ? `<span class="cost-item">⏱️ ${task.timeCost}h</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }
    
    container.innerHTML = html;
  }

  // 获取标签类
  getTagClass(difficulty) {
    const classes = {
      urgent: 'urgent',
      important: 'important',
      normal: 'normal',
      service: 'success'
    };
    return classes[difficulty] || 'normal';
  }

  // 获取标签文本
  getTagText(difficulty) {
    const texts = {
      urgent: '紧急',
      important: '重要',
      normal: '日常',
      service: '服务'
    };
    return texts[difficulty] || '日常';
  }

  // 获取分类图标
  getCategoryIcon(category) {
    const icons = {
      '公文处理': '📋',
      '会议服务': '🏢',
      '紧急信息': '⚡',
      '服务群众': '👥',
      '协调沟通': '📞',
      '人际关系': '🤝',
      '职场政治': '👔',
      '值班值守': '🌙',
      '应急处置': '⚠️',
      '文字综合': '✍️'
    };
    return icons[category] || '📋';
  }

  // 显示晋升
  showPromotion(position) {
    const positions = ['科员', '副主任科员', '主任科员', '副科长', '科长', '副处长', '处长', '副局长', '局长'];
    const newPosition = positions[position] || '未知';
    
    this.showModal(`
      <div style="text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">🎉</div>
        <h2 style="color:#ffcd75;font-size:12px;margin-bottom:8px;">恭喜晋升！</h2>
        <p style="color:#f4f4f4;font-size:10px;margin-bottom:16px;">你已晋升为 <strong>${newPosition}</strong></p>
        <button class="pixel-btn" onclick="this.closest('.modal').classList.remove('active')">继续游戏</button>
      </div>
    `);
  }

  // 显示结局
  showEnding(endingId) {
    const endings = {
      burnout: { title: '💔 过劳牺牲', desc: '在连续高强度工作后，你的身体终于撑不住了...' },
      fish_king: { title: '🐟 摸鱼之王', desc: '你成为了传说中的摸鱼大师，完美平衡工作与生活...' },
      marginal: { title: '📦 边缘人物', desc: '由于多次失误，你被调离了核心岗位...' }
    };
    
    const ending = endings[endingId] || { title: '❓ 结局', desc: '游戏结束' };
    
    this.showModal(`
      <div style="text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">${ending.title.split(' ')[0]}</div>
        <h2 style="color:#ffcd75;font-size:12px;margin-bottom:16px;">${ending.title.split(' ')[1]}</h2>
        <p style="color:#f4f4f4;font-size:8px;line-height:1.6;margin-bottom:24px;">${ending.desc}</p>
        <button class="pixel-btn" onclick="GameEngine.resetGame();this.closest('.modal').classList.remove('active')">重新开始</button>
      </div>
    `);
  }

  // 显示摸鱼反馈
  showFishFeedback() {
    this.showToast('🐟 摸鱼一天，精力恢复！');
  }

  // 显示模态框
  showModal(content) {
    const modal = document.getElementById('eventModal');
    if (!modal) return;
    
    modal.querySelector('.modal-content').innerHTML = content;
    modal.classList.add('active');
  }

  // 显示 Toast
  showToast(message) {
    if (typeof showToast !== 'undefined') {
      showToast(message);
    }
  }
}

// 全局实例
window.UIManager = new UIManager();
