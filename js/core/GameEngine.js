/**
 * 游戏引擎 - 体制内模拟器 2.0
 * 核心游戏逻辑
 */

class GameEngine {
  constructor() {
    this.state = null;
    this.currentEvent = null;
    this.currentOptionIndex = -1;
  }

  // 初始化游戏
  init() {
    console.log('🎮 初始化游戏引擎...');
    
    // 尝试加载存档
    if (typeof SaveManager !== 'undefined') {
      this.state = SaveManager.loadGame();
    }
    
    // 如果没有存档，创建新游戏
    if (!this.state) {
      this.createNewGame();
    }
    
    // 初始化系统
    if (typeof SkillSystem !== 'undefined') {
      SkillSystem.init(this.state);
    }
    
    if (typeof InnerVoiceSystem !== 'undefined') {
      InnerVoiceSystem.init(this.state);
    }
    
    if (typeof EventSystem !== 'undefined') {
      EventSystem.init(this.state);
    }
    
    // 更新 UI
    if (typeof UIManager !== 'undefined') {
      UIManager.updateAll();
    }
    
    // 生成任务列表
    this.generateTaskList();
    
    console.log('✅ 游戏初始化完成');
  }

  // 创建新游戏
  createNewGame() {
    console.log('🆕 创建新游戏...');
    
    this.state = {
      // 游戏进度
      day: 1,
      hour: 9,
      phase: 'probation', // 试用期
      narrator: 'laozhang', // 故事叙述者
      
      // 基础属性
      position: 0, // 职位等级
      reputation: 50, // 声望
      connections: 50, // 人脉
      
      // 需求值
      needs: {
        energy: 100,
        health: 100,
        mood: 100,
        belonging: 50,
        reputation: 50
      },
      
      // 隐藏属性
      hiddenStats: {
        politicalCapital: 0,
        principles: 50,
        trustScore: {},
        factionStanding: {}
      },
      
      // 内心声音
      voices: {
        ambition: 30,
        goodperson: 30,
        cautious: 30
      },
      
      // 技能
      skills: {
        work: { level: 1, exp: 0 },
        social: { level: 1, exp: 0 },
        psychology: { level: 1, exp: 0 },
        political: { level: 1, exp: 0 },
        charm: { level: 1, exp: 0 }
      },
      
      // 角色关系
      relationships: {},
      
      // 游戏统计
      stats: {
        tasksCompleted: 0,
        totalChoices: 0,
        principlesStuck: 0,
        fishCount: 0,
        consecutiveFish: 0,
        mistakeCount: 0,
        healthLowDays: 0
      },
      
      // 解锁内容
      unlocked: {
        achievements: [],
        endings: [],
        events: [],
        characters: []
      },
      
      // 游戏设置
      settings: {
        soundEnabled: true,
        musicVolume: 0.5,
        effectsVolume: 0.7
      },
      
      // 元数据
      meta: {
        playTime: 0,
        createdAt: Date.now(),
        lastPlayed: Date.now(),
        version: '2.0.0'
      }
    };
    
    // 初始化角色关系
    this.initializeRelationships();
    
    // 保存游戏
    if (typeof SaveManager !== 'undefined') {
      SaveManager.saveGame(this.state);
    }
    
    console.log('✅ 新游戏创建完成');
  }

  // 初始化角色关系
  initializeRelationships() {
    if (typeof CHARACTER_DATABASE !== 'undefined') {
      for (const [charId, charData] of Object.entries(CHARACTER_DATABASE)) {
        this.state.relationships[charId] = {
          ...charData.initialRelationship
        };
      }
    }
  }

  // 生成任务列表
  generateTaskList() {
    if (typeof EventSystem !== 'undefined') {
      const tasks = EventSystem.generateDailyTasks(this.state);
      if (typeof UIManager !== 'undefined') {
        UIManager.renderTaskList(tasks);
      }
    }
  }

  // 选择选项
  selectOption(optionIndex) {
    console.log(`🎯 选择选项 ${optionIndex}`);
    
    if (!this.currentEvent) {
      console.error('没有当前事件');
      return;
    }
    
    const option = this.currentEvent.options[optionIndex];
    if (!option) {
      console.error('选项不存在');
      return;
    }
    
    this.currentOptionIndex = optionIndex;
    
    // 应用选项效果
    this.applyOptionEffects(option);
    
    // 更新内心声音
    if (typeof InnerVoiceSystem !== 'undefined') {
      InnerVoiceSystem.applyChoice(option);
    }
    
    // 添加经验
    this.addSkillExp(this.currentEvent.category);
    
    // 更新统计
    this.state.stats.totalChoices++;
    this.state.stats.tasksCompleted++;
    
    // 检查触发事件
    this.checkEventTriggers();
    
    // 更新时间
    this.advanceTime(this.currentEvent.timeCost || 1);
    
    // 保存游戏
    if (typeof SaveManager !== 'undefined') {
      SaveManager.saveGame(this.state);
    }
    
    // 更新 UI
    if (typeof UIManager !== 'undefined') {
      UIManager.updateAll();
    }
    
    // 显示反馈
    this.showOptionFeedback(option);
    
    // 生成新任务
    setTimeout(() => {
      this.generateTaskList();
    }, 500);
  }

  // 应用选项效果
  applyOptionEffects(option) {
    // 应用基础效果
    if (option.effects) {
      for (const [key, value] of Object.entries(option.effects)) {
        if (key === 'exp') {
          // 经验特殊处理
          this.addExp(value);
        } else if (this.state.needs[key] !== undefined) {
          // 需求值
          this.state.needs[key] = Math.max(0, Math.min(100, this.state.needs[key] + value));
        } else if (this.state[key] !== undefined) {
          // 基础属性
          this.state[key] = Math.max(0, this.state[key] + value);
        }
      }
    }
    
    // 应用角色关系效果
    if (option.characterEffects) {
      for (const [charId, value] of Object.entries(option.characterEffects)) {
        if (this.state.relationships[charId]) {
          this.state.relationships[charId].trust = Math.max(0, Math.min(100, 
            this.state.relationships[charId].trust + value
          ));
        }
      }
    }
  }

  // 添加经验
  addExp(amount) {
    // 根据难度调整
    let adjustedAmount = amount;
    if (this.currentEvent && EVENT_DIFFICULTY[this.currentEvent.difficulty]) {
      adjustedAmount *= EVENT_DIFFICULTY[this.currentEvent.difficulty].rewardMultiplier;
    }
    
    // 根据技能效率调整
    if (typeof SkillSystem !== 'undefined') {
      const efficiency = SkillSystem.getOverallEfficiency();
      adjustedAmount *= efficiency;
    }
    
    this.state.stats.exp = (this.state.stats.exp || 0) + Math.floor(adjustedAmount);
    
    // 检查技能升级
    if (typeof SkillSystem !== 'undefined') {
      SkillSystem.checkLevelUp();
    }
  }

  // 添加技能经验
  addSkillExp(category) {
    if (typeof SKILL_EXP_SOURCES !== 'undefined') {
      const source = SKILL_EXP_SOURCES.complete_task;
      if (source) {
        for (const [skillId, exp] of Object.entries(source)) {
          if (this.state.skills[skillId]) {
            this.state.skills[skillId].exp += exp;
          }
        }
        
        // 检查升级
        if (typeof SkillSystem !== 'undefined') {
          SkillSystem.checkLevelUp();
        }
      }
    }
  }

  // 检查事件触发
  checkEventTriggers() {
    // 检查晋升条件
    this.checkPromotion();
    
    // 检查结局条件
    this.checkEndingConditions();
    
    // 检查特殊事件
    this.checkSpecialEvents();
  }

  // 检查晋升
  checkPromotion() {
    // 晋升逻辑（简化版）
    const promotionThresholds = [100, 250, 500, 1000, 2000, 4000, 8000, 15000];
    const exp = this.state.stats.exp || 0;
    
    if (this.state.position < promotionThresholds.length) {
      const threshold = promotionThresholds[this.state.position];
      if (exp >= threshold) {
        this.state.position++;
        if (typeof UIManager !== 'undefined') {
          UIManager.showPromotion(this.state.position);
        }
      }
    }
  }

  // 检查结局条件
  checkEndingConditions() {
    // 检查各种结局条件
    const needs = this.state.needs;
    
    if (needs.health <= 0) {
      this.triggerEnding('burnout');
    } else if (this.state.stats.consecutiveFish >= 15) {
      this.triggerEnding('fish_king');
    } else if (this.state.stats.mistakeCount >= 5) {
      this.triggerEnding('marginal');
    }
  }

  // 检查特殊事件
  checkSpecialEvents() {
    // 特殊事件触发逻辑
  }

  // 触发结局
  triggerEnding(endingId) {
    console.log(`🎬 触发结局: ${endingId}`);
    
    if (typeof UIManager !== 'undefined') {
      UIManager.showEnding(endingId);
    }
  }

  // 推进时间
  advanceTime(hours) {
    this.state.hour += hours;
    
    if (this.state.hour >= 18) {
      // 一天结束
      this.endDay();
    }
  }

  // 结束一天
  endDay() {
    console.log(`🌙 第 ${this.state.day} 天结束`);
    
    this.state.day++;
    this.state.hour = 9;
    
    // 恢复需求值（部分）
    this.state.needs.energy = Math.min(100, this.state.needs.energy + 15);
    this.state.needs.health = Math.min(100, this.state.needs.health + 8);
    this.state.needs.mood = Math.min(100, this.state.needs.mood + 12);
    
    // 需求值衰减
    this.state.needs.reputation = Math.max(0, this.state.needs.reputation - 2);
    this.state.needs.belonging = Math.max(0, this.state.needs.belonging - 3);
    
    // 保存游戏
    if (typeof SaveManager !== 'undefined') {
      SaveManager.saveGame(this.state);
    }
    
    // 更新 UI
    if (typeof UIManager !== 'undefined') {
      UIManager.updateAll();
    }
  }

  // 显示选项反馈
  showOptionFeedback(option) {
    const effects = option.effects;
    let feedbackText = '';
    let feedbackType = 'neutral';
    
    // 计算总效果
    let totalPositive = 0;
    let totalNegative = 0;
    
    if (effects) {
      for (const [key, value] of Object.entries(effects)) {
        if (key !== 'exp' && this.state.needs[key] !== undefined) {
          if (value > 0) totalPositive += value;
          else totalNegative += Math.abs(value);
        }
      }
    }
    
    if (totalPositive > totalNegative) {
      feedbackType = 'positive';
      feedbackText = '✨ 表现出色！';
    } else if (totalNegative > totalPositive) {
      feedbackType = 'negative';
      feedbackText = '⚠️ 需要注意...';
    } else {
      feedbackText = '📋 已记录';
    }
    
    if (typeof showToast !== 'undefined') {
      showToast(feedbackText);
    }
  }

  // 摸鱼（跳过剩余时间）
  fishDay() {
    console.log('🐟 摸鱼一天');
    
    this.state.stats.fishCount++;
    this.state.stats.consecutiveFish++;
    this.state.needs.energy = Math.min(100, this.state.needs.energy + 30);
    this.state.needs.mood = Math.min(100, this.state.needs.mood + 20);
    this.state.needs.reputation = Math.max(0, this.state.needs.reputation - 5);
    
    this.endDay();
    
    if (typeof UIManager !== 'undefined') {
      UIManager.showFishFeedback();
    }
  }

  // 获取游戏状态
  getState() {
    return this.state;
  }

  // 重置游戏
  resetGame() {
    localStorage.removeItem('tizhi_simulator_save');
    this.createNewGame();
    
    if (typeof UIManager !== 'undefined') {
      UIManager.updateAll();
    }
    
    this.generateTaskList();
  }
}

// 全局实例
window.GameEngine = new GameEngine();
