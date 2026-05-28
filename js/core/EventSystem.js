/**
 * 事件系统 - 体制内模拟器 2.0
 */

class EventSystem {
  constructor() {
    this.state = null;
    this.events = null;
    this.eventPool = [];
    this.cooldowns = new Map();
  }

  // 初始化
  init(state) {
    console.log('📋 初始化事件系统...');
    this.state = state;
    this.events = EVENT_DATABASE;
  }

  // 生成每日任务
  generateDailyTasks(state) {
    const day = state.day;
    const phase = state.phase;
    const tasks = [];
    
    // 根据天数决定任务数量
    const taskCount = Math.min(3, Math.floor(day / 10) + 2);
    
    // 获取可用事件
    const availableEvents = this.getAvailableEvents(day);
    
    // 随机选择事件
    for (let i = 0; i < taskCount && availableEvents.length > 0; i++) {
      const index = Math.floor(Math.random() * availableEvents.length);
      const eventId = availableEvents.splice(index, 1)[0];
      
      if (eventId) {
        const event = this.cloneEvent(this.events[eventId]);
        if (event) {
          // 填充参数
          this.fillEventParams(event);
          tasks.push(event);
        }
      }
    }
    
    return tasks;
  }

  // 获取可用事件
  getAvailableEvents(day) {
    const available = [];
    
    for (const [eventId, event] of Object.entries(this.events)) {
      // 检查冷却
      if (this.isOnCooldown(eventId)) continue;
      
      // 检查天数要求
      if (event.minDay && day < event.minDay) continue;
      if (event.maxDay && day > event.maxDay) continue;
      
      // 检查职位要求
      if (event.minPosition && this.state.position < event.minPosition) continue;
      
      available.push(eventId);
    }
    
    return available;
  }

  // 检查冷却
  isOnCooldown(eventId) {
    const lastTriggered = this.cooldowns.get(eventId);
    if (!lastTriggered) return false;
    
    const cooldown = EVENT_DIFFICULTY[this.events[eventId]?.difficulty]?.cooldown || 7;
    const daysSince = this.state.day - lastTriggered;
    
    return daysSince < cooldown;
  }

  // 设置冷却
  setCooldown(eventId) {
    this.cooldowns.set(eventId, this.state.day);
  }

  // 克隆事件
  cloneEvent(event) {
    if (!event) return null;
    return JSON.parse(JSON.stringify(event));
  }

  // 填充事件参数
  fillEventParams(event) {
    if (!event.params) return;
    
    for (const [paramName, paramConfig] of Object.entries(event.params)) {
      if (paramConfig.values) {
        const value = paramConfig.values[Math.floor(Math.random() * paramConfig.values.length)];
        
        // 替换描述中的占位符
        event.description = event.description.replace(`{{${paramName}}}`, value);
      }
    }
  }

  // 获取事件难度
  getEventDifficulty(event) {
    return EVENT_DIFFICULTY[event.difficulty] || EVENT_DIFFICULTY.normal;
  }

  // 计算事件触发概率
  calculateTriggerProbability(event) {
    let probability = event.baseProbability || 0.5;
    
    // 叙述者影响
    const narratorMultiplier = this.getNarratorMultiplier();
    probability *= narratorMultiplier;
    
    // 天数影响
    probability *= (1 + Math.floor(this.state.day / 30) * 0.05);
    
    // 难度调整
    const difficulty = this.getEventDifficulty(event);
    probability *= (1 + (difficulty.riskRate - 0.3) * 0.2);
    
    return Math.min(0.95, Math.max(0.05, probability));
  }

  // 获取叙述者倍数
  getNarratorMultiplier() {
    const narrators = {
      laozhang: 1.0,   // 稳扎稳打
      lilie: 1.2,       // 跌宕起伏
      wangzhuren: 1.5   // 残酷无情
    };
    
    return narrators[this.state.narrator] || 1.0;
  }

  // 触发事件
  triggerEvent(eventId) {
    const event = this.events[eventId];
    if (!event) return null;
    
    // 设置冷却
    this.setCooldown(eventId);
    
    // 克隆并填充参数
    const triggeredEvent = this.cloneEvent(event);
    this.fillEventParams(triggeredEvent);
    
    return triggeredEvent;
  }

  // 选择事件选项
  selectOption(event, optionIndex) {
    const option = event.options[optionIndex];
    if (!option) return null;
    
    // 应用选项效果
    const effects = this.calculateOptionEffects(event, option);
    
    return {
      option: option,
      effects: effects,
      narrative: this.generateNarrative(event, option)
    };
  }

  // 计算选项效果
  calculateOptionEffects(event, option) {
    const difficulty = this.getEventDifficulty(event);
    const effects = { ...option.effects };
    
    // 应用难度倍率
    if (effects.exp) {
      effects.exp = Math.floor(effects.exp * difficulty.rewardMultiplier);
    }
    
    // 应用技能加成
    if (typeof SkillSystem !== 'undefined') {
      const skillId = this.getRelatedSkill(event.category);
      if (skillId && effects.exp) {
        effects.exp = SkillSystem.applyOptionBonus(skillId, effects.exp);
      }
    }
    
    // 应用内心声音加成
    if (typeof InnerVoiceSystem !== 'undefined') {
      const voiceBonus = InnerVoiceSystem.getOptionBonus(option);
      for (const key of Object.keys(effects)) {
        effects[key] += Math.floor(voiceBonus);
      }
    }
    
    return effects;
  }

  // 获取相关技能
  getRelatedSkill(category) {
    const categoryMap = {
      '公文处理': 'work',
      '会议服务': 'work',
      '紧急信息': 'work',
      '服务群众': 'social',
      '协调沟通': 'social',
      '人际关系': 'social',
      '职场政治': 'political',
      '值班值守': 'psychology',
      '应急处置': 'psychology',
      '文字综合': 'work'
    };
    
    return categoryMap[category] || 'work';
  }

  // 生成叙述
  generateNarrative(event, option) {
    // 简化版叙述生成
    const narratives = {
      positive: [
        `${option.text.split('，')[0]}。`,
        `你的选择得到了认可。`
      ],
      negative: [
        `${option.text.split('，')[0]}。`,
        `这次选择似乎有些欠妥...`
      ],
      neutral: [
        `${option.text.split('，')[0]}。`,
        `事情按计划进行。`
      ]
    };
    
    if (option.type === 'ambitious' || option.type === 'goodperson') {
      return narratives.positive[Math.floor(Math.random() * narratives.positive.length)];
    } else if (option.type === 'risky' || option.type === 'very_risky') {
      return narratives.negative[Math.floor(Math.random() * narratives.negative.length)];
    }
    
    return narratives.neutral[Math.floor(Math.random() * narratives.neutral.length)];
  }

  // 获取事件提示
  getEventHint(event) {
    const hints = [];
    
    // 难度提示
    const difficulty = this.getEventDifficulty(event);
    if (difficulty.riskRate > 0.5) {
      hints.push({ type: 'warning', text: '⚠️ 高风险事件' });
    }
    
    // 时间消耗提示
    if (event.timeCost > 3) {
      hints.push({ type: 'info', text: `⏱️ 耗时较长: ${event.timeCost}小时` });
    }
    
    return hints;
  }

  // 重置冷却
  resetCooldowns() {
    this.cooldowns.clear();
    console.log('🔄 事件冷却已重置');
  }
}

// 全局实例
window.EventSystem = new EventSystem();
