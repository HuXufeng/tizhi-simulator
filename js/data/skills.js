/**
 * 技能配置 - 体制内模拟器 2.0
 * 五大技能树，每树4级
 */

// 技能树配置
const SKILL_TREES = {
  work: {
    id: 'work',
    name: '业务能力',
    icon: '💼',
    color: '#3b5dc9',
    description: '处理公务、写材料、组织会议等业务能力',
    
    levels: [
      {
        level: 1,
        name: '基础办公',
        expRequired: 0,
        unlocked: true,
        effects: { workEfficiency: 1.0 },
        skills: []
      },
      {
        level: 2,
        name: '公文写作',
        expRequired: 50,
        unlocked: false,
        effects: { workEfficiency: 1.1, optionUnlocks: ['writing_tasks'] },
        skills: [
          { id: 'document_writing', name: '公文写作', icon: '📝' },
          { id: 'meeting_organization', name: '会务组织', icon: '🏢' },
          { id: 'emergency_handling', name: '应急处理', icon: '⚡' }
        ]
      },
      {
        level: 3,
        name: '综合材料',
        expRequired: 120,
        unlocked: false,
        effects: { workEfficiency: 1.2, effectBonus: 0.1 },
        skills: [
          { id: 'leader_speech', name: '领导讲话稿', icon: '🎤', requires: 'document_writing' },
          { id: 'large_meeting', name: '大型会议统筹', icon: '🎯', requires: 'meeting_organization' },
          { id: 'crisis_pr', name: '危机公关', icon: '🛡️', requires: 'emergency_handling' }
        ]
      },
      {
        level: 4,
        name: '专家级',
        expRequired: 250,
        unlocked: false,
        effects: { workEfficiency: 1.3, specialUnlocked: true },
        skills: [
          { id: 'policy_master', name: '政策专家', icon: '📜', requires: 'leader_speech' },
          { id: 'resource_integration', name: '资源整合专家', icon: '🔗', requires: 'large_meeting' },
          { id: 'stabilizer', name: '定海神针', icon: '⚓', requires: 'crisis_pr' }
        ]
      }
    ]
  },

  social: {
    id: 'social',
    name: '人际社交',
    icon: '🤝',
    color: '#38b764',
    description: '与人打交道、建立关系、沟通协调的能力',
    
    levels: [
      {
        level: 1,
        name: '待人接物',
        expRequired: 0,
        unlocked: true,
        effects: { socialEfficiency: 1.0 },
        skills: []
      },
      {
        level: 2,
        name: '察言观色',
        expRequired: 50,
        unlocked: false,
        effects: { socialEfficiency: 1.1, optionUnlocks: ['observation'] },
        skills: [
          { id: 'read_mind', name: '读心术', icon: '🔮' },
          { id: 'emotion_control', name: '情绪管理', icon: '🎭' },
          { id: 'relationship_building', name: '关系经营', icon: '🌱' }
        ]
      },
      {
        level: 3,
        name: '关系经营',
        expRequired: 120,
        unlocked: false,
        effects: { socialEfficiency: 1.2, effectBonus: 0.1 },
        skills: [
          { id: 'faction_management', name: '派系经营', icon: '🏛️', requires: 'relationship_building' },
          { id: 'social_network', name: '社交网络', icon: '🕸️', requires: 'read_mind' },
          { id: 'wine_culture', name: '酒桌文化', icon: '🍷', requires: 'emotion_control' }
        ]
      },
      {
        level: 4,
        name: '大师级',
        expRequired: 250,
        unlocked: false,
        effects: { socialEfficiency: 1.3, specialUnlocked: true },
        skills: [
          { id: 'political_skill', name: '政治手腕', icon: '🎪', requires: 'faction_management' },
          { id: 'chameleon', name: '八面玲珑', icon: '🦋', requires: 'social_network' },
          { id: 'toast_master', name: '觥筹交错', icon: '🥂', requires: 'wine_culture' }
        ]
      }
    ]
  },

  psychology: {
    id: 'psychology',
    name: '心理素质',
    icon: '🛡️',
    color: '#ef7d57',
    description: '抗压能力、心理调节、在逆境中保持冷静的能力',
    
    levels: [
      {
        level: 1,
        name: '抗压基础',
        expRequired: 0,
        unlocked: true,
        effects: { stressResistance: 1.0 },
        skills: []
      },
      {
        level: 2,
        name: '心理韧性',
        expRequired: 50,
        unlocked: false,
        effects: { stressResistance: 1.1, optionUnlocks: ['stress_management'] },
        skills: [
          { id: 'mountain_calm', name: '泰山崩于前', icon: '🏔️' },
          { id: 'self_regulation', name: '自我调节', icon: '🧘' },
          { id: 'thick_skin', name: '钝感力', icon: '🛡️' }
        ]
      },
      {
        level: 3,
        name: '稳如磐石',
        expRequired: 120,
        unlocked: false,
        effects: { stressResistance: 1.2, effectBonus: 0.1 },
        skills: [
          { id: 'rock_steady', name: '稳如磐石', icon: '🪨', requires: 'mountain_calm' },
          { id: 'buddhist_mind', name: '佛系心态', icon: '☸️', requires: 'self_regulation' },
          { id: 'iron_will', name: '铜墙铁壁', icon: '🔰', requires: 'thick_skin' }
        ]
      },
      {
        level: 4,
        name: '大师级',
        expRequired: 250,
        unlocked: false,
        effects: { stressResistance: 1.3, specialUnlocked: true },
        skills: [
          { id: 'comeback', name: '绝处逢生', icon: '🔥', requires: 'rock_steady' },
          { id: 'deep_hidden', name: '深藏不露', icon: '🎭', requires: 'buddhist_mind' },
          { id: 'abyss_watcher', name: '深渊凝视', icon: '👁️', requires: 'iron_will' }
        ]
      }
    ]
  },

  political: {
    id: 'political',
    name: '政治智慧',
    icon: '🎭',
    color: '#9b59b6',
    description: '理解政治格局、站队艺术、借势用势的能力',
    
    levels: [
      {
        level: 1,
        name: '规则意识',
        expRequired: 0,
        unlocked: true,
        effects: { politicalAwareness: 1.0 },
        skills: []
      },
      {
        level: 2,
        name: '潜规则',
        expRequired: 50,
        unlocked: false,
        effects: { politicalAwareness: 1.1, optionUnlocks: ['hidden_rules'] },
        skills: [
          { id: 'self_protection', name: '明哲保身', icon: '🛡️' },
          { id: 'leverage', name: '借力打力', icon: '⚖️' },
          { id: 'team_art', name: '站队艺术', icon: '🎯' }
        ]
      },
      {
        level: 3,
        name: '深谙规则',
        expRequired: 120,
        unlocked: false,
        effects: { politicalAwareness: 1.2, effectBonus: 0.1 },
        skills: [
          { id: 'watertight', name: '滴水不漏', icon: '💧', requires: 'self_protection' },
          { id: 'four_ounces', name: '四两拨千斤', icon: '⚖️', requires: 'leverage' },
          { id: 'betting_eye', name: '伯乐识马', icon: '👁️', requires: 'team_art' }
        ]
      },
      {
        level: 4,
        name: '大师级',
        expRequired: 250,
        unlocked: false,
        effects: { politicalAwareness: 1.3, specialUnlocked: true },
        skills: [
          { id: 'taiji_master', name: '太极高手', icon: '☯️', requires: 'watertight' },
          { id: 'noble_support', name: '朝中有人', icon: '👑', requires: 'four_ounces' },
          { id: 'fortune_teller', name: '贵人运', icon: '🌟', requires: 'betting_eye' }
        ]
      }
    ]
  },

  charm: {
    id: 'charm',
    name: '个人魅力',
    icon: '✨',
    color: '#ffcd75',
    description: '外在形象、内在修养、个人品牌塑造的能力',
    
    levels: [
      {
        level: 1,
        name: '基础形象',
        expRequired: 0,
        unlocked: true,
        effects: { charmEfficiency: 1.0 },
        skills: []
      },
      {
        level: 2,
        name: '外在形象',
        expRequired: 50,
        unlocked: false,
        effects: { charmEfficiency: 1.1, optionUnlocks: ['appearance'] },
        skills: [
          { id: 'well_dressed', name: '仪表堂堂', icon: '👔' },
          { id: 'temperament', name: '气质修养', icon: '🎨' },
          { id: 'inner_cultivation', name: '内在修养', icon: '📚' }
        ]
      },
      {
        level: 3,
        name: '魅力展现',
        expRequired: 120,
        unlocked: false,
        effects: { charmEfficiency: 1.2, effectBonus: 0.1 },
        skills: [
          { id: 'elegant', name: '温文尔雅', icon: '🌸', requires: 'temperament' },
          { id: 'erudite', name: '博古通今', icon: '📖', requires: 'inner_cultivation' },
          { id: 'brand_building', name: '口碑经营', icon: '📣', requires: 'well_dressed' }
        ]
      },
      {
        level: 4,
        name: '大师级',
        expRequired: 250,
        unlocked: false,
        effects: { charmEfficiency: 1.3, specialUnlocked: true },
        skills: [
          { id: 'wind_elegant', name: '风度翩翩', icon: '🌬️', requires: 'elegant' },
          { id: 'spring_breeze', name: '如沐春风', icon: '🌸', requires: 'erudite' },
          { id: 'famous_reputation', name: '名声在外', icon: '🏆', requires: 'brand_building' }
        ]
      }
    ]
  }
};

// 技能经验来源配置
const SKILL_EXP_SOURCES = {
  complete_task: {
    work: 10,
    social: 5,
    psychology: 3,
    political: 2,
    charm: 5
  },
  social_event: {
    work: 3,
    social: 15,
    psychology: 5,
    political: 7,
    charm: 10
  },
  pressure_situation: {
    work: 5,
    social: 3,
    psychology: 20,
    political: 7,
    charm: 5
  },
  political_choice: {
    work: 5,
    social: 5,
    psychology: 10,
    political: 25,
    charm: 5
  },
  charm_showcase: {
    work: 3,
    social: 10,
    psychology: 5,
    political: 5,
    charm: 15
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SKILL_TREES, SKILL_EXP_SOURCES };
}
