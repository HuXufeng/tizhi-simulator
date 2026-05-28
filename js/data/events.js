/**
 * 事件库 - 体制内模拟器 2.0
 */

// 事件库
const EVENT_DATABASE = {
  // 公文处理类
  meeting_notice: {
    id: 'meeting_notice',
    category: '公文处理',
    title: '📋 会议通知',
    description: '需要给{{num}}个{{unit_type}}发送{{time}}的专题会议通知。昨天刚发过类似通知，但时间改了。',
    difficulty: 'normal',
    timeCost: 2,
    sender: 'director',
    params: {
      num: { values: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
      unit_type: { values: ['下属单位', '街道办', '科室', '部门', '区县', '直属部门'] },
      time: { values: ['上午', '下午', '明天上午', '明天下午'] }
    },
    options: [
      {
        text: '逐一给10个单位打电话确认收到变更通知',
        type: 'cautious',
        effects: { energy: -15, reputation: 6, exp: 28 },
        characterEffects: { director: 8 },
        voiceBonus: { ambition: -10, goodperson: 5, cautious: 15 }
      },
      {
        text: '发邮件并等待回复，没回复的再打电话',
        type: 'balanced',
        effects: { energy: -8, reputation: 2, exp: 15 },
        characterEffects: { director: 2 },
        voiceBonus: { ambition: 0, goodperson: 0, cautious: 0 }
      },
      {
        text: '只发一遍邮件标注"紧急"，觉得他们会看到',
        type: 'risky',
        effects: { energy: -5, reputation: -10, exp: 3 },
        characterEffects: { director: -15 },
        voiceBonus: { ambition: 10, goodperson: -10, cautious: -15 }
      }
    ]
  },

  // 会议服务类
  table_arrange: {
    id: 'table_arrange',
    category: '会议服务',
    title: '🏢 领导座次安排',
    description: '明天的全市领导干部大会，需要摆放桌牌。名单很长很复杂。',
    difficulty: 'important',
    timeCost: 2,
    sender: 'director',
    options: [
      {
        text: '对照职务表，反复核对顺序',
        type: 'cautious',
        effects: { energy: -12, reputation: 10, exp: 32 },
        characterEffects: { director: 15, boss: 5 },
        voiceBonus: { ambition: 5, goodperson: 10, cautious: 15 }
      },
      {
        text: '凭经验摆放，差不多就行',
        type: 'risky',
        effects: { energy: -8, reputation: -12, exp: 8 },
        characterEffects: { director: -12, boss: -8 },
        voiceBonus: { ambition: 10, goodperson: -5, cautious: -15 }
      },
      {
        text: '让实习生去摆',
        type: 'very_risky',
        effects: { energy: 0, reputation: -18, exp: 3 },
        characterEffects: { director: -22, boss: -15 },
        voiceBonus: { ambition: 5, goodperson: -15, cautious: -10 }
      }
    ]
  },

  // 紧急信息类
  emergency_report: {
    id: 'emergency_report',
    category: '紧急信息',
    title: '⚡ 突发事件上报',
    description: '值班时接到报告：辖区发生交通事故，3人受伤，原因待查。现在是凌晨2点。',
    difficulty: 'urgent',
    timeCost: 2,
    sender: 'boss',
    options: [
      {
        text: '立即上报，先口头再书面',
        type: 'ambitious',
        effects: { energy: -20, health: -10, reputation: 15, exp: 40 },
        characterEffects: { boss: 18, director: 10 },
        voiceBonus: { ambition: 15, goodperson: 5, cautious: -5 }
      },
      {
        text: '先给王主任打电话请示',
        type: 'cautious',
        effects: { energy: -10, reputation: -5, exp: 10 },
        characterEffects: { boss: -10 },
        voiceBonus: { ambition: -5, goodperson: 5, cautious: 10 }
      },
      {
        text: '等天亮了解清楚再报，觉得不严重',
        type: 'very_risky',
        effects: { energy: -5, reputation: -25, exp: 0 },
        characterEffects: { boss: -28, director: -20 },
        voiceBonus: { ambition: -10, goodperson: -10, cautious: 5 }
      }
    ]
  },

  // 服务群众类
  mass_complaint: {
    id: 'mass_complaint',
    category: '服务群众',
    title: '👥 群众来访处理',
    description: '办公室来了几位情绪激动的群众，反映{{issue}}问题，吵着要见局长。',
    difficulty: 'service',
    timeCost: 2,
    sender: 'public',
    params: {
      issue: { values: ['拆迁补偿', '社保问题', '噪音投诉', '物业纠纷', '拖欠工资', '教育划片', '环境污染', '养老待遇'] }
    },
    options: [
      {
        text: '耐心倾听，详细记录，承诺答复时间',
        type: 'goodperson',
        effects: { energy: -15, reputation: 20, connections: 12, exp: 32 },
        characterEffects: { public: 28, colleague: 8 },
        voiceBonus: { ambition: -5, goodperson: 15, cautious: 0 }
      },
      {
        text: '按程序登记，让他们找相关部门',
        type: 'balanced',
        effects: { energy: -8, reputation: 2, exp: 15 },
        characterEffects: { public: -5 },
        voiceBonus: { ambition: 5, goodperson: -5, cautious: 5 }
      },
      {
        text: '不耐烦，说局长不在，打发他们走',
        type: 'very_risky',
        effects: { energy: -5, reputation: -25, exp: 5 },
        characterEffects: { public: -30, director: -15 },
        voiceBonus: { ambition: 10, goodperson: -15, cautious: -10 }
      }
    ]
  },

  // 人际关系类
  colleague_help: {
    id: 'colleague_help',
    category: '人际关系',
    title: '🤝 同事请求帮忙',
    description: '李姐家里有事，想让你帮她完成本该她做的报表，今天必须交。',
    difficulty: 'normal',
    timeCost: 2,
    sender: 'colleague',
    options: [
      {
        text: '爽快答应，帮她完成',
        type: 'goodperson',
        effects: { energy: -15, reputation: 12, connections: 10, exp: 22 },
        characterEffects: { colleague: 20, subordinate: 5 },
        voiceBonus: { ambition: -5, goodperson: 15, cautious: -5 }
      },
      {
        text: '教她方法，让她自己做',
        type: 'balanced',
        effects: { energy: -8, reputation: 3, exp: 15 },
        characterEffects: { colleague: 3 },
        voiceBonus: { ambition: 5, goodperson: 0, cautious: 5 }
      },
      {
        text: '借口自己也忙，婉言拒绝',
        type: 'risky',
        effects: { energy: 0, reputation: -8, connections: -5, exp: 5 },
        characterEffects: { colleague: -18 },
        voiceBonus: { ambition: 10, goodperson: -15, cautious: 5 }
      }
    ]
  },

  // 值班值守类
  night_duty: {
    id: 'night_duty',
    category: '值班值守',
    title: '🌙 春节值班',
    description: '轮到你大年三十值班，同事都想请假回家过年。',
    difficulty: 'normal',
    timeCost: 8,
    sender: 'director',
    options: [
      {
        text: '主动值班，让外地同事回家',
        type: 'goodperson',
        effects: { energy: -25, health: -15, reputation: 18, exp: 45 },
        characterEffects: { colleague: 20, director: 12 },
        voiceBonus: { ambition: 5, goodperson: 15, cautious: -5 }
      },
      {
        text: '值班但找同事替半天',
        type: 'balanced',
        effects: { energy: -15, reputation: 3, exp: 22 },
        characterEffects: { colleague: 5, director: -3 },
        voiceBonus: { ambition: 0, goodperson: 5, cautious: 10 }
      },
      {
        text: '找借口请假',
        type: 'risky',
        effects: { energy: 0, reputation: -15, exp: 5 },
        characterEffects: { colleague: -15, director: -18 },
        voiceBonus: { ambition: 10, goodperson: -15, cautious: -5 }
      }
    ]
  },

  // 职场政治类
  leader_praise: {
    id: 'leader_praise',
    category: '职场政治',
    title: '👔 领导表扬',
    description: '李局长在大会上点名表扬了你，但其实工作主要是李姐做的。',
    difficulty: 'normal',
    timeCost: 1,
    sender: 'boss',
    options: [
      {
        text: '当场说明，功劳是大家的',
        type: 'goodperson',
        effects: { energy: 0, reputation: 22, connections: 18, exp: 30 },
        characterEffects: { colleague: 25, boss: 12, director: 8 },
        voiceBonus: { ambition: -15, goodperson: 15, cautious: 0 }
      },
      {
        text: '接受表扬，事后请李姐吃饭',
        type: 'balanced',
        effects: { energy: 0, reputation: 5, exp: 20 },
        characterEffects: { colleague: -8 },
        voiceBonus: { ambition: 5, goodperson: -5, cautious: 5 }
      },
      {
        text: '欣然接受，觉得自己也有功劳',
        type: 'risky',
        effects: { energy: 0, reputation: -15, connections: -10, exp: 15 },
        characterEffects: { colleague: -28, subordinate: -10 },
        voiceBonus: { ambition: 15, goodperson: -15, cautious: -10 }
      }
    ]
  },

  // 协调沟通类
  department_coord: {
    id: 'department_coord',
    category: '协调沟通',
    title: '📞 部门协调',
    description: '需要协调{{dept_count}}个部门共同完成一项紧急任务，但其他部门都不太配合。',
    difficulty: 'important',
    timeCost: 3,
    sender: 'director',
    params: {
      dept_count: { values: [2, 3, 4, 5] },
      dept_type: { values: ['财政局', '发改委', '人社局', '住建局', '教育局', '卫健委', '公安局', '市场监管局'] }
    },
    options: [
      {
        text: '上门沟通，请各部门领导支持配合',
        type: 'ambitious',
        effects: { energy: -20, reputation: 18, connections: 15, exp: 38 },
        characterEffects: { director: 15, boss: 10 },
        voiceBonus: { ambition: 15, goodperson: 5, cautious: -10 }
      },
      {
        text: '发正式通知，强调任务重要性',
        type: 'balanced',
        effects: { energy: -12, reputation: 2, exp: 18 },
        characterEffects: { director: -3 },
        voiceBonus: { ambition: 5, goodperson: 0, cautious: 5 }
      },
      {
        text: '向领导告状，说他们不配合',
        type: 'very_risky',
        effects: { energy: -8, reputation: -18, connections: -20, exp: 8 },
        characterEffects: { director: -15 },
        voiceBonus: { ambition: 10, goodperson: -10, cautious: -15 }
      }
    ]
  },

  // 文字综合类
  leader_speech: {
    id: 'leader_speech',
    category: '文字综合',
    title: '✍️ 领导讲话稿起草',
    description: '李局长要在全市大会上讲话，让你起草一份30分钟的讲话稿。',
    difficulty: 'important',
    timeCost: 4,
    sender: 'boss',
    options: [
      {
        text: '深入调研，收集数据，写得有血有肉',
        type: 'ambitious',
        effects: { energy: -25, health: -8, reputation: 25, exp: 55 },
        characterEffects: { boss: 25, director: 15 },
        voiceBonus: { ambition: 15, goodperson: 5, cautious: -5 }
      },
      {
        text: '参考往年稿子，改改数据',
        type: 'balanced',
        effects: { energy: -15, reputation: -5, exp: 18 },
        characterEffects: { boss: -10 },
        voiceBonus: { ambition: -5, goodperson: 0, cautious: 10 }
      },
      {
        text: '网上找一篇，改改名字和地名',
        type: 'very_risky',
        effects: { energy: -5, reputation: -25, exp: 5 },
        characterEffects: { boss: -30, director: -20 },
        voiceBonus: { ambition: -10, goodperson: -10, cautious: -15 }
      }
    ]
  },

  // 两难选择类
  sticky_situation: {
    id: 'sticky_situation',
    category: '应急处置',
    title: '⚠️ 两难选择',
    description: '王主任让你把报告的数据改得"好看点"，但你知道数据不太符合实际。',
    difficulty: 'important',
    timeCost: 2,
    sender: 'director',
    options: [
      {
        text: '坚持原则，只改明显错误的数据',
        type: 'goodperson',
        effects: { energy: -10, reputation: 5, exp: 28 },
        characterEffects: { director: -8, boss: 5 },
        voiceBonus: { ambition: -10, goodperson: 15, cautious: 10 }
      },
      {
        text: '按要求改了，心想反正不是我拍板的',
        type: 'balanced',
        effects: { energy: -8, reputation: -5, exp: 20 },
        characterEffects: { director: 10 },
        voiceBonus: { ambition: 5, goodperson: -5, cautious: 0 }
      },
      {
        text: '委婉拒绝，说这样可能有问题',
        type: 'risky',
        effects: { energy: -10, reputation: -20, connections: -10, exp: 10 },
        characterEffects: { director: -25, boss: -15 },
        voiceBonus: { ambition: -15, goodperson: 10, cautious: 15 }
      }
    ]
  },

  // 办公室八卦类
  office_gossip: {
    id: 'office_gossip',
    category: '人际关系',
    title: '🍵 办公室八卦',
    description: '李姐悄悄跟你说："听说王主任最近要退休了，位置空出来了..."',
    difficulty: 'normal',
    timeCost: 1,
    sender: 'colleague',
    options: [
      {
        text: '不参与讨论，只听不说',
        type: 'cautious',
        effects: { energy: 0, reputation: 5, exp: 10 },
        characterEffects: { colleague: 8 },
        voiceBonus: { ambition: -5, goodperson: 5, cautious: 15 }
      },
      {
        text: '跟着聊几句，但不说关键信息',
        type: 'balanced',
        effects: { energy: 0, exp: 8 },
        characterEffects: { colleague: 5 },
        voiceBonus: { ambition: 5, goodperson: 0, cautious: 0 }
      },
      {
        text: '积极打听，想知道更多内幕',
        type: 'risky',
        effects: { energy: 0, reputation: -12, exp: 5 },
        characterEffects: { director: -15, colleague: -10 },
        voiceBonus: { ambition: 15, goodperson: -10, cautious: -15 }
      }
    ]
  }
};

// 事件难度配置
const EVENT_DIFFICULTY = {
  normal: { riskRate: 0.3, rewardMultiplier: 1.0 },
  important: { riskRate: 0.5, rewardMultiplier: 1.3 },
  urgent: { riskRate: 0.7, rewardMultiplier: 1.5 },
  service: { riskRate: 0.4, rewardMultiplier: 1.2 },
  critical: { riskRate: 0.9, rewardMultiplier: 2.0 }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EVENT_DATABASE, EVENT_DIFFICULTY };
}
