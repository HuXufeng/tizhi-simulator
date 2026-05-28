/**
 * 内心声音系统 - 体制内模拟器 2.0
 * 借鉴《极乐迪斯科》的内心声音设计
 */

class InnerVoiceSystem {
  constructor() {
    this.state = null;
    this.voices = {
      ambition: {
        id: 'ambition',
        name: '野心家',
        color: '#b13e53',
        icon: '🎯',
        philosophy: '往上爬！抓住每一次机会！',
        bonusArea: ['promotion', 'achievement', 'reputation'],
        skillsBonus: { political: 0.1 },
        voiceLines: {
          positive: [
            '这是展现自己的好机会！',
            '为什么不主动争取？',
            '机会稍纵即逝！'
          ],
          negative: [
            '太保守了，会错失良机',
            '为什么总是犹豫不决？'
          ]
        }
      },
      goodperson: {
        id: 'goodperson',
        name: '老好人',
        color: '#3b5dc9',
        icon: '😇',
        philosophy: '真诚待人，问心无愧最重要。',
        bonusArea: ['relationship', 'trust', 'integrity'],
        skillsBonus: { social: 0.1 },
        voiceLines: {
          positive: [
            '这样做对得起良心',
            '真诚比手段更重要',
            '帮助别人就是帮助自己'
          ],
          negative: [
            '这样会得罪人的...',
            '太功利了不可取'
          ]
        }
      },
      cautious: {
        id: 'cautious',
        name: '谨慎派',
        color: '#38b764',
        icon: '🛡️',
        philosophy: '稳扎稳打，三思而后行。',
        bonusArea: ['risk_avoidance', 'stability', 'survival'],
        skillsBonus: { psychology: 0.1 },
        voiceLines: {
          positive: [
            '三思而后行',
            '安全第一，不要冒险',
            '稳扎稳打才是王道'
          ],
          negative: [
            '太冲动了',
            '小心驶得万年船'
          ]
        }
      }
    };
  }

  // 初始化
  init(state) {
    console.log('🧠 初始化内心声音系统...');
    this.state = state;
  }

  // 获取声音强度
  getVoiceStrength(voiceId) {
    return this.state.voices[voiceId] || 30;
  }

  // 获取声音信息
  getVoiceInfo(voiceId) {
    return this.voices[voiceId];
  }

  // 获取主导声音
  getDominantVoice() {
    let dominant = null;
    let maxStrength = 0;
    
    for (const [voiceId, strength] of Object.entries(this.state.voices)) {
      if (strength > maxStrength) {
        maxStrength = strength;
        dominant = voiceId;
      }
    }
    
    return dominant;
  }

  // 应用选择影响
  applyChoice(option) {
    if (!option.voiceBonus) return;
    
    // 应用声音加成
    for (const [voiceId, bonus] of Object.entries(option.voiceBonus)) {
      if (this.state.voices[voiceId] !== undefined) {
        this.state.voices[voiceId] = Math.max(0, Math.min(100, 
          this.state.voices[voiceId] + bonus
        ));
      }
    }
    
    // 规范化（总和保持约100）
    this.normalizeVoices();
    
    console.log('🧠 内心声音更新:', this.state.voices);
    
    // 更新 UI
    if (typeof UIManager !== 'undefined') {
      UIManager.updateVoiceUI();
    }
  }

  // 规范化声音强度
  normalizeVoices() {
    const total = Object.values(this.state.voices).reduce((sum, val) => sum + val, 0);
    
    if (total > 120) {
      const factor = 120 / total;
      for (const voiceId of Object.keys(this.state.voices)) {
        this.state.voices[voiceId] = Math.floor(this.state.voices[voiceId] * factor);
      }
    }
  }

  // 获取选项加成
  getOptionBonus(option) {
    const dominant = this.getDominantVoice();
    if (!dominant || !option.voiceBonus) return 0;
    
    const strength = this.getVoiceStrength(dominant);
    
    // 根据强度计算加成
    if (strength >= 70) {
      // 高强度时，获得额外加成
      return option.voiceBonus[dominant] * 0.5;
    } else if (strength <= 30) {
      // 低强度时，获得减成
      return option.voiceBonus[dominant] * 0.3;
    }
    
    return option.voiceBonus[dominant] * 0.2;
  }

  // 获取随机建议
  getRandomAdvice(voiceId) {
    const voice = this.voices[voiceId];
    if (!voice) return '';
    
    const strength = this.getVoiceStrength(voiceId);
    
    if (strength >= 60) {
      // 高强度时，更积极表达
      const lines = voice.voiceLines.positive;
      return lines[Math.floor(Math.random() * lines.length)];
    } else if (strength <= 40) {
      // 低强度时，表达较温和
      const lines = voice.voiceLines.negative;
      return lines[Math.floor(Math.random() * lines.length)];
    }
    
    return voice.philosophy;
  }

  // 获取主要建议
  getMainAdvice() {
    const dominant = this.getDominantVoice();
    if (!dominant) return '';
    
    return this.getRandomAdvice(dominant);
  }

  // 检查声音是否足够强
  isVoiceStrong(voiceId, threshold = 70) {
    return this.getVoiceStrength(voiceId) >= threshold;
  }

  // 获取声音状态
  getVoiceState(voiceId) {
    const strength = this.getVoiceStrength(voiceId);
    
    if (strength >= 70) return 'strong';
    if (strength >= 50) return 'balanced';
    if (strength >= 30) return 'weak';
    return 'suppressed';
  }

  // 获取所有声音状态
  getAllVoiceStates() {
    const states = {};
    for (const voiceId of Object.keys(this.voices)) {
      states[voiceId] = this.getVoiceState(voiceId);
    }
    return states;
  }

  // 获取声音效果描述
  getVoiceEffectDescription(voiceId) {
    const voice = this.voices[voiceId];
    const strength = this.getVoiceStrength(voiceId);
    const state = this.getVoiceState(voiceId);
    
    let description = '';
    
    switch (state) {
      case 'strong':
        description = `${voice.name}的声音很强，你会更倾向于${voice.bonusArea.join('、')}。`;
        break;
      case 'balanced':
        description = `${voice.name}的声音一般，你可以较为客观地做决定。`;
        break;
      case 'weak':
        description = `${voice.name}的声音较弱，你较少考虑这方面的因素。`;
        break;
      case 'suppressed':
        description = `${voice.name}的声音被压制，几乎不会影响你的决定。`;
        break;
    }
    
    return description;
  }

  // 平衡声音
  balanceVoices() {
    // 缓慢平衡向中心值 33
    const centerValue = 33;
    const balanceRate = 0.1;
    
    for (const voiceId of Object.keys(this.state.voices)) {
      const diff = centerValue - this.state.voices[voiceId];
      this.state.voices[voiceId] += Math.floor(diff * balanceRate);
    }
  }

  // 重置声音
  resetVoices() {
    this.state.voices = {
      ambition: 30,
      goodperson: 30,
      cautious: 30
    };
    
    console.log('🔄 内心声音已重置');
  }
}

// 全局实例
window.InnerVoiceSystem = new InnerVoiceSystem();
