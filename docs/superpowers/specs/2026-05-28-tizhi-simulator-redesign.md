# 体制内模拟器 - 重构设计方案

**文档版本**: 1.0  
**创建日期**: 2026-05-28  
**项目名称**: 体制内模拟器 2.0  
**游戏类型**: 像素风策略养成游戏  

---

## 1. 项目概述与愿景

### 1.1 项目背景

当前"体制内模拟器"游戏拥有良好的基础框架和丰富的任务事件系统，但存在以下改进空间：
- Windows 98 风格 UI 对移动端支持有限
- 技能系统相对简单，缺乏深度策略性
- 重开性（Replayability）不足
- 视觉风格较为传统

### 1.2 重构愿景

打造一款**深度策略养成 + 像素美术风格 + 移动端优先**的体制内模拟器2.0版：
- 借鉴《环世界》的故事叙述者和角色管理系统
- 融合《极乐迪斯科》的内心声音和深度对话系统
- 参考《星露谷物语》的技能树和成长机制
- 采用GBA/DS风格的像素美术，打造怀旧感
- 全面优化移动端体验，支持竖屏单手操作

### 1.3 核心设计理念

1. **策略深度**：每个选择都有代价，技能影响机遇
2. **情感共鸣**：真实的中国职场生态与人生百态
3. **重玩价值**：多条路线、随机事件、隐藏内容
4. **移动优先**：竖屏设计、单手操作、即时反馈

---

## 2. 游戏系统架构

### 2.1 故事叙述者系统（Storyteller）

借鉴《环世界》的三大叙述者设计，游戏中引入三种难度风格：

| 叙述者 | 性格 | 事件频率 | 难度曲线 | 适用玩家 |
|--------|------|----------|----------|----------|
| **老张** | 稳扎稳打 | 低 | 渐进式 | 休闲玩家 |
| **李姐** | 跌宕起伏 | 中 | 波动式 | 普通玩家 |
| **王主任** | 残酷无情 | 高 | 陡峭式 | 硬核玩家 |

**叙述者影响参数**：
```javascript
narratorConfig: {
  // 事件触发系数
  eventFrequency: 1.0,      // 基础频率
  criticalEventChance: 0.15, // 关键事件概率
  
  // 难度调整
  difficultyMultiplier: 1.0,
  mistakePenalty: 1.0,
  
  // 奖励系数
  rewardMultiplier: 1.0,
  
  // 冷却设置
  sameEventCooldown: 14,    // 同事件冷却天数
  similarTypeCooldown: 7,   // 同类型冷却天数
}
```

### 2.2 角色创建系统

#### 2.2.1 背景选择

```javascript
backgrounds: [
  {
    id: 'exam_winner',
    name: '普通遴选',
    desc: '千军万马过独木桥考进来的',
    effects: {
      workAbility: 5,
      stressAbility: 5,
      commAbility: 5
    },
    availableWeek: 1
  },
  {
    id: 'talent_import',
    name: '人才引进',
    desc: '博士学历直接入职',
    effects: {
      workAbility: 15,
      commAbility: -10,
      reputation: 10
    },
    availableWeek: 1
  },
  {
    id: 'military_transfer',
    name: '军转干部',
    desc: '从部队转业到地方',
    effects: {
      stressAbility: 20,
      commAbility: -15,
      health: 10
    },
    availableWeek: 2
  },
  {
    id: 'borrowed_official',
    name: '借调人员',
    desc: '从下级单位借调来的',
    effects: {
      connections: -15,
      workAbility: 10,
      politicalCapital: 5
    },
    availableWeek: 1
  },
  {
    id: 'connected',
    name: '关系户',
    desc: '有人打招呼进来的',
    effects: {
      connections: 20,
      reputation: 15,
      bossExpectation: 1.2
    },
    availableWeek: 3
  }
]
```

#### 2.2.2 特质系统

```javascript
traits: [
  // 稀有特质
  {
    id: 'social_butterfly',
    name: '社牛属性',
    rarity: 'rare',
    icon: '🗣️',
    effects: {
      commAbility: 15,
      relationshipGain: 1.2
    }
  },
  {
    id: 'master_writer',
    name: '材料高手',
    rarity: 'rare',
    icon: '📚',
    effects: {
      workAbility: 15,
      energyCost: 0.7
    }
  },
  {
    id: 'workaholic',
    name: '卷王体质',
    rarity: 'legendary',
    icon: '🏃',
    effects: {
      overtimeHealth: 0.5,
      stressAccumulation: 1.5,
      workAbility: 20
    }
  },
  {
    id: 'old_school',
    name: '老油条',
    rarity: 'rare',
    icon: '😎',
    effects: {
      connectionCost: 0.7,
      reputationBoost: 0.7,
      stressGain: 0.5
    }
  },
  
  // 普通特质
  {
    id: 'innocent',
    name: '小白兔',
    rarity: 'normal',
    icon: '👶',
    effects: {
      reputation: 10,
      stressVulnerable: 1.3,
      commAbility: -5
    }
  },
  {
    id: 'iron_man',
    name: '铁人',
    rarity: 'rare',
    icon: '💪',
    effects: {
      healthCost: 0.7,
      energyRecovery: 1.2
    }
  }
]
```

---

## 3. 技能系统设计

### 3.1 技能树架构

游戏包含**五大核心技能树**，每棵技能树4个等级。

#### 技能树1：业务能力（Work）

```
Lv.1: 基础办公 ★
  ├→ Lv.2: 公文写作 ★★
  │     ├→ Lv.3: 综合材料 ☆☆☆
  │     │     └→ Lv.4: 领导讲话稿 ✦✦✦✦
  │     └→ Lv.3: 会务组织 ☆☆☆
  │           └→ Lv.4: 大型会议统筹 ✦✦✦✦
  ├→ Lv.2: 沟通协调 ★★
  │     ├→ Lv.3: 跨部门协作 ☆☆☆
  │     │     └→ Lv.4: 资源整合专家 ✦✦✦✦
  │     └→ Lv.3: 向上管理 ☆☆☆
  │           └→ Lv.4: 领导心腹 ✦✦✦✦
  └→ Lv.2: 应急处理 ★★
        └→ Lv.3: 危机公关 ☆☆☆
              └→ Lv.4: 定海神针 ✦✦✦✦
```

**技能解锁效果**：
- ★★ 基础技能：解锁相关选项
- ☆☆☆ 中级技能：选项效果 +20%
- ✦✦✦✦ 高级技能：解锁特殊剧情线

#### 技能树2：人际社交（Social）

```
Lv.1: 待人接物 ★
  ├→ Lv.2: 察言观色 ★★
  │     ├→ Lv.3: 读心术 ☆☆☆
  │     │     └→ Lv.4: 人心洞察者 ✦✦✦✦
  │     └→ Lv.3: 情绪管理 ☆☆☆
  │           └→ Lv.4: 情绪大师 ✦✦✦✦
  ├→ Lv.2: 关系经营 ★★
  │     ├→ Lv.3: 派系经营 ☆☆☆
  │     │     └→ Lv.4: 政治手腕 ✦✦✦✦
  │     └→ Lv.3: 社交网络 ☆☆☆
  │           └→ Lv.4: 八面玲珑 ✦✦✦✦
  └→ Lv.2: 酒桌文化 ★★
        └→ Lv.3: 酒量惊人 ☆☆☆
              └→ Lv.4: 觥筹交错 ✦✦✦✦
```

#### 技能树3：心理素质（Psychology）

```
Lv.1: 抗压基础 ★
  ├→ Lv.2: 心理韧性 ★★
  │     ├→ Lv.3: 泰山崩于前 ☆☆☆
  │     │     └→ Lv.4: 稳如磐石 ✦✦✦✦
  │     └→ Lv.3: 自我调节 ☆☆☆
  │           └→ Lv.4: 佛系心态 ✦✦✦✦
  ├→ Lv.2: 钝感力 ★★
  │     ├→ Lv.3: 脸皮厚 ☆☆☆
  │     │     └→ Lv.4: 铜墙铁壁 ✦✦✦✦
  │     └→ Lv.3: 逆商提升 ☆☆☆
  │           └→ Lv.4: 绝处逢生 ✦✦✦✦
  └→ Lv.2: 隐忍 ★★
        └→ Lv.3: 城府深沉 ☆☆☆
              └→ Lv.4: 深藏不露 ✦✦✦✦
```

#### 技能树4：政治智慧（Political）

```
Lv.1: 规则意识 ★
  ├→ Lv.2: 潜规则 ★★
  │     ├→ Lv.3: 明哲保身 ☆☆☆
  │     │     └→ Lv.4: 滴水不漏 ✦✦✦✦
  │     └→ Lv.3: 借力打力 ☆☆☆
  │           └→ Lv.4: 四两拨千斤 ✦✦✦✦
  ├→ Lv.2: 站队艺术 ★★
  │     ├→ Lv.3: 押注眼光 ☆☆☆
  │     │     └→ Lv.4: 伯乐识马 ✦✦✦✦
  │     └→ Lv.3: 平衡术 ☆☆☆
  │           └→ Lv.4: 太极高手 ✦✦✦✦
  └→ Lv.2: 借势 ★★
        └→ Lv.3: 贵人运 ☆☆☆
              └→ Lv.4: 朝中有人 ✦✦✦✦
```

#### 技能树5：个人魅力（Charm）

```
Lv.1: 基础形象 ★
  ├→ Lv.2: 外在形象 ★★
  │     ├→ Lv.3: 仪表堂堂 ☆☆☆
  │     │     └→ Lv.4: 风度翩翩 ✦✦✦✦
  │     └→ Lv.3: 气质修养 ☆☆☆
  │           └→ Lv.4: 温文尔雅 ✦✦✦✦
  ├→ Lv.2: 内在修养 ★★
  │     ├→ Lv.3: 学识渊博 ☆☆☆
  │     │     └→ Lv.4: 博古通今 ✦✦✦✦
  │     └→ Lv.3: 情商高 ☆☆☆
  │           └→ Lv.4: 如沐春风 ✦✦✦✦
  └→ Lv.2: 个人品牌 ★★
        └→ Lv.3: 口碑经营 ☆☆☆
              └→ Lv.4: 名声在外 ✦✦✦✦
```

### 3.2 技能成长机制

```javascript
skillProgression: {
  // 经验获取配置
  expSources: [
    { action: 'complete_task', skill: 'work', exp: 10 },
    { action: 'social_event', skill: 'social', exp: 15 },
    { action: 'pressure_situation', skill: 'psychology', exp: 20 },
    { action: 'political_choice', skill: 'political', exp: 25 },
    { action: 'charm_showcase', skill: 'charm', exp: 15 }
  ],
  
  // 升级所需经验（递增）
  expToLevel: [0, 50, 120, 250, 500],
  
  // 技能效果
  levelEffects: {
    1: { optionUnlock: true },
    2: { effectBonus: 0.1 },
    3: { effectBonus: 0.2 },
    4: { specialUnlocked: true }
  },
  
  // 技能遗忘
  respec: {
    available: true,
    cost: 'temporary_stat_penalty',
    cooldownDays: 30
  }
}
```

---

## 4. 内心声音系统（Inner Voices）

借鉴《极乐迪斯科》的内心声音设计。

### 4.1 三大内心声音

```javascript
innerVoices: {
  // 野心家（红色）
  ambition: {
    name: '野心家',
    color: '#b13e53',
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
  
  // 老好人（蓝色）
  goodperson: {
    name: '老好人',
    color: '#3b5dc9',
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
  
  // 谨慎派（绿色）
  cautious: {
    name: '谨慎派',
    color: '#38b764',
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
}
```

### 4.2 声音成长与影响

```javascript
voiceProgression: {
  // 声音强度范围
  voiceStrengthRange: [0, 100],
  
  // 初始强度
  initialStrength: {
    ambition: 30,
    goodperson: 30,
    cautious: 30
  },
  
  // 选择对声音的影响
  choiceInfluence: {
    // 野心家选择
    'ambition_choice': {
      ambition: +15,
      goodperson: -5,
      cautious: -10
    },
    // 老好人选择
    'goodperson_choice': {
      ambition: -5,
      goodperson: +15,
      cautious: -5
    },
    // 谨慎派选择
    'cautious_choice': {
      ambition: -10,
      goodperson: -5,
      cautious: +15
    }
  },
  
  // 声音强度影响
  strengthEffects: {
    // 高强度时
    highThreshold: 70,
    highEffect: {
      decisionBias: 0.3,    // 30%概率自动选该声音建议
      dialogueVariation: true, // 解锁特殊对话
      voiceVisibility: 'prominent' // 声音更明显
    },
    
    // 低强度时
    lowThreshold: 30,
    lowEffect: {
      decisionBias: 0,
      dialogueVariation: false,
      voiceVisibility: 'subtle'
    }
  }
}
```

---

## 5. 事件系统设计

### 5.1 事件分类体系

```javascript
eventCategories: {
  // 日常任务事件
  dailyTasks: {
    frequency: 'per_day',
    count: [2, 4],
    required: true,
    types: [
      'document_processing',
      'meeting_service',
      'coordination',
      'security',
      'logistics'
    ]
  },
  
  // 随机触发事件
  randomEvents: {
    frequency: 'per_week',
    count: [1, 3],
    required: false,
    types: [
      'emergency_incident',
      'interpersonal_event',
      'opportunity_event',
      'reflection_event'
    ]
  },
  
  // 周期性事件
  scheduledEvents: {
    frequency: 'monthly/quarterly/annual',
    types: [
      'monthly_assessment',
      'promotion_review',
      'annual_evaluation',
      'democratic_life_meeting'
    ]
  },
  
  // 剧情事件
  storyEvents: {
    frequency: 'key_milestones',
    types: [
      'relationship_turning_point',
      'political_struggle',
      'principle_dilemma',
      'life_turning_point'
    ]
  }
}
```

### 5.2 事件触发机制

```javascript
eventTriggerSystem: {
  // 基础触发公式
  triggerProbability: function(baseProb, modifiers) {
    return baseProb
      * narratorDifficultyCoefficient
      * traitBonus
      * currentStatusModifier
      * eventRelevance;
  },
  
  // 触发条件
  triggerConditions: {
    minDay: 5,
    maxDay: Infinity,
    minPosition: 1,
    requiredTraits: ['social'],
    excludedTraits: ['isolated'],
    minStats: {
      reputation: 60
    }
  },
  
  // 事件关联
  eventRelations: {
    prerequisites: ['event_A'],
    consequences: ['event_B'],
    exclusiveWith: ['event_C', 'event_D']
  },
  
  // 冷却机制
  cooldown: {
    sameEvent: 14,
    similarType: 7,
    criticalEvent: 30
  },
  
  // 叙述者干预
  storytellerIntervention: {
    minDaysBetweenMajor: 10,
    maxFailures: 3,
    guaranteedPositive: true,
    positiveInterval: 30
  }
}
```

### 5.3 事件选项设计

```javascript
eventOption: {
  text: '选项文本',
  
  // 选项类型
  type: 'aggressive' | 'diplomatic' | 'cautious' | 'creative',
  
  // 内心声音加成
  voiceBonus: {
    ambition: +15,
    goodperson: +5,
    cautious: -10
  },
  
  // 即时效果
  effects: {
    reputation: +10,
    connections: +5,
    energy: -15,
    health: -5,
    mood: +5
  },
  
  // 角色好感度变化
  characterEffects: {
    director: +8,
    colleague: -5,
    boss: +3
  },
  
  // 长期后果
  futureModifiers: {
    event_X_probability: +0.2,
    event_Y_probability: -0.3
  },
  
  // 隐藏属性
  hiddenStats: {
    politicalCapital: +10,
    principleScore: -5
  },
  
  // 特殊标签
  tags: ['risky', 'character_building', 'relationship_critical']
}
```

### 5.4 事件链系统

```javascript
eventChains: {
  // 短链事件（2-3个）
  shortChain: {
    example: {
      chain: ['offend_colleague', 'isolated', 'work_hindered'],
      totalDays: 7,
      canBreak: true
    }
  },
  
  // 长链事件（5-10个）
  longChain: {
    example: {
      chain: ['trial_period', 'formal_转正', 'first_promotion', 'critical_choice', 'career_path_locked'],
      totalDays: 100,
      canBreak: true,
      branches: 3
    }
  },
  
  // 分支剧情链
  branchChain: {
    trigger: 'event_A',
    branches: [
      {
        choice: 'branch_A1',
        events: ['result_A1a', 'result_A1b'],
        hidden: false
      },
      {
        choice: 'branch_A2',
        events: ['result_A2a'],
        hidden: false
      },
      {
        choice: 'branch_A3',
        events: ['hidden_story_unlock'],
        hidden: true,
        requirement: { week: 2 }
      }
    ]
  }
}
```

### 5.5 事件难度等级

```javascript
eventDifficulty: {
  levels: ['EASY', 'NORMAL', 'HARD', 'CRITICAL'],
  
  difficultyModifiers: {
    EASY: {
      riskRate: 0.1,
      rewardMultiplier: 0.8,
      recoverable: true
    },
    NORMAL: {
      riskRate: 0.3,
      rewardMultiplier: 1.0,
      recoverable: true
    },
    HARD: {
      riskRate: 0.6,
      rewardMultiplier: 1.5,
      recoverable: false
    },
    CRITICAL: {
      riskRate: 1.0,
      rewardMultiplier: 2.0,
      recoverable: false,
      permanent: true
    }
  },
  
  // 难度影响因素
  difficultyFactors: {
    dayProgress: 0.1,           // 每30天+10%
    currentPosition: 0.05,       // 每级职位+5%
    narratorMultiplier: 1.3,    // 王主任模式+30%
    randomFluctuation: [0.9, 1.1] // 运气成分
  }
}
```

---

## 6. 社交关系系统

### 6.1 人际关系网络

```javascript
relationshipSystem: {
  // 关系维度
  dimensions: {
    trust: { min: 0, max: 100, decay: 0.1 },
    affection: { min: -100, max: 100, decay: 0.05 },
    competition: { min: 0, max: 100, decay: 0 },
    dependency: { min: 0, max: 100, decay: 0.2 }
  },
  
  // 关系计算
  calculation: {
    baseTrust: 50,
    baseAffection: 0,
    
    // 事件影响
    eventImpact: function(event, choice) {
      return event.effects.characterEffects[characterId];
    },
    
    // 互动频率影响
    interactionFrequency: {
      bonus: 0.1,    // 每月互动+10%
      penalty: 0.05  // 每月不互动-5%
    }
  },
  
  // 关系等级
  relationshipLevels: [
    { level: 1, name: '陌生', range: [0, 20] },
    { level: 2, name: '认识', range: [21, 40] },
    { level: 3, name: '熟悉', range: [41, 60] },
    { level: 4, name: '信任', range: [61, 80] },
    { level: 5, name: '亲密', range: [81, 100] }
  ]
}
```

### 6.2 NPC特质系统

```javascript
npcCharacter: {
  name: '王建国',
  role: '办公室主任',
  
  // 背景特质
  background: {
    type: '老资格',
    effects: {
      initialAuthority: +10,
      workEfficiency: +15,
      resistanceToChange: +20
    }
  },
  
  // 性格特质
  traits: [
    { name: '谨慎', effects: { trustworthy: +15 } },
    { name: '重规矩', effects: { appreciatesDiscipline: +20 } },
    { name: '护犊子', effects: { protectsSubordinates: true } }
  ],
  
  // 需求/动机
  needs: {
    respect: 70,
    achievement: 60,
    control: 80
  },
  
  // 偏好事件
  eventPreferences: [
    'bureaucratic_detail',
    'power_struggle',
    'mentorship'
  ],
  
  // 隐藏信息（需要特定技能解锁）
  hiddenInfo: {
    secret: '曾经犯过错误',
    unlockRequirement: { social: 4, trust: 80 }
  }
}
```

### 6.3 派系系统

```javascript
factionSystem: {
  // 派系定义
  factions: [
    {
      id: 'reformists',
      name: '改革派',
      leader: '张科长',
      members: 3,
      ideology: '创新、效率',
      influence: 35,
      color: '#3b5dc9'
    },
    {
      id: 'conservatives',
      name: '保守派',
      leader: '王主任',
      members: 5,
      ideology: '稳定、传统',
      influence: 45,
      color: '#b13e53'
    },
    {
      id: 'neutrals',
      name: '中立派',
      leader: null,
      members: 2,
      ideology: '中立、观望',
      influence: 20,
      color: '#8b8b8b'
    }
  ],
  
  // 派系关系
  factionRelations: {
    'reformists-conservatives': {
      type: 'opposition',
      strength: 0.7
    },
    'neutrals-reformists': {
      type: 'neutral',
      strength: 0.3
    }
  },
  
  // 玩家派系立场
  playerFactionStanding: {
    reformists: 0,
    conservatives: 0,
    neutrals: 50
  },
  
  // 派系影响力
  factionEffects: {
    onPromotion: 0.2,          // 影响晋升评分20%
    onInformation: 0.3,        // 影响信息获取30%
    onEventProbability: 0.15   // 影响事件触发15%
  }
}
```

---

## 7. 需求与状态系统

### 7.1 需求条系统

```javascript
needsSystem: {
  // 五大需求
  needs: {
    energy: {
      name: '精力',
      icon: '⚡',
      range: [0, 100],
      baseDecay: 10,        // 每日消耗
      baseRecovery: 15,      // 每日恢复
      effects: {
        lowThreshold: 30,
        lowEffect: {
          workEfficiency: 0.7,
          mistakeChance: 1.5
        }
      }
    },
    
    health: {
      name: '健康',
      icon: '❤️',
      range: [0, 100],
      baseDecay: 5,
      baseRecovery: 8,
      effects: {
        lowThreshold: 30,
        lowEffect: {
          sickChance: 0.3,
          eventProbability: 0.5
        }
      }
    },
    
    mood: {
      name: '心态',
      icon: '🎭',
      range: [0, 100],
      baseDecay: 8,
      baseRecovery: 12,
      effects: {
        lowThreshold: 30,
        lowEffect: {
          irrationalDecisionChance: 0.4,
          voiceStrengthBonus: 0.2
        }
      }
    },
    
    belonging: {
      name: '归属感',
      icon: '🤝',
      range: [0, 100],
      baseDecay: 3,
      baseRecovery: 10,
      effects: {
        lowThreshold: 20,
        lowEffect: {
          quitChance: 0.1,
          connectionGain: 0.5
        }
      }
    },
    
    reputation: {
      name: '声望',
      icon: '⭐',
      range: [0, 100],
      baseDecay: 2,
      baseRecovery: 5,
      effects: {
        lowThreshold: 30,
        lowEffect: {
          opportunityChance: 0.6,
          bossTrust: 0.8
        }
      }
    }
  }
}
```

---

## 8. 多周目与重开性系统

### 8.1 New Game+ 系统

```javascript
newGamePlus: {
  // 周目解锁内容
  weekUnlocks: {
    1: {
      features: ['basic_skills', 'core_characters', 'main_endings'],
      unlocks: []
    },
    2: {
      requirement: 'complete_one_ending',
      features: [
        'hidden_voice: cynic',
        'secret_characters',
        'additional_dialogue'
      ],
      bonuses: [
        'starting_reputation +10',
        'skill_exp_gain +15%'
      ]
    },
    3: {
      requirement: 'complete_two_different_endings',
      features: [
        'true_ending_path',
        'all_backgrounds',
        'hard_mode_characters'
      ],
      bonuses: [
        'all_skills_start_lv2',
        'know_secret_events'
      ]
    },
    N: {
      requirement: 'all_achievements',
      features: [
        'roguelike_mode',
        'random_traits_mode',
        'speedrun_timers'
      ]
    }
  },
  
  // 知识传承
  knowledgeTransfer: {
    week2: {
      warnings: true,
      hints: true,
      relationship_secrets: true
    },
    week3: {
      foreshadowing: true,
      secret_dialogue: true,
      true_ending_hint: true
    }
  }
}
```

### 8.2 随机化引擎

```javascript
randomizationEngine: {
  // 特质随机化
  traitRandomization: {
    protagonistTraits: [
      'fixed_5_choices',      // 第一周目：固定5选1
      'random_3_from_pool',  // 随机3选1
      'fully_random',        // 完全随机
      'negative_only',       // 只有负面特质
      'quirky_combinations'  // 奇怪组合
    ]
  },
  
  // 事件随机化
  eventRandomization: {
    daily_pool_size: 5,
    weekly_pool_size: 3,
    
    eventVariants: {
      'meeting_event': [
        'press_conference',
        'budget_review',
        'inspection_visit',
        'emergency_meeting'
      ],
      'colleague_conflict': [
        'work_credit_dispute',
        'ideological_difference',
        'personality_clash',
        'resource_competition'
      ]
    }
  },
  
  // 世界随机化
  worldRandomization: {
    faction_distribution: 'procedural',
    character_roster: 'pooled_random',
    political_climate: 'variable'
  }
}
```

### 8.3 多路线系统

```javascript
gameplayRoutes: {
  // 路线A：政绩为王
  routeA_achievement: {
    name: '政绩派',
    focus: ['work_performance', 'metrics', 'results'],
    winningCondition: 'max_reputation_300_days',
    uniqueSkills: ['data_analysis', 'public_relations'],
    endings: ['official_star', 'workaholic_burnout', 'promotion_machine']
  },
  
  // 路线B：关系经营
  routeB_relationships: {
    name: '人脉派',
    focus: ['social_network', 'faction_wars', 'influence'],
    winningCondition: 'build_kingdom_300_days',
    uniqueSkills: ['network_building', 'manipulation'],
    endings: ['kingmaker', 'lonely_king', 'trusted_advisor']
  },
  
  // 路线C：原则坚守
  routeC_principles: {
    name: '清流派',
    focus: ['integrity', 'moral_choices', 'inner_voice'],
    winningCondition: 'remain_pure_300_days',
    uniqueSkills: ['integrity', 'wisdom'],
    endings: ['lone_crane', 'vindicated', 'martyr']
  },
  
  // 路线D：摸鱼生存
  routeD_fish: {
    name: '摸鱼派',
    focus: ['minimal_effort', 'maximizing_leisure', 'survival'],
    winningCondition: 'survive_365_days',
    uniqueSkills: ['camouflage', 'delegation'],
    endings: ['fish_king', 'discovered', 'promoted_by_accident']
  }
}
```

### 8.4 Roguelike 模式

```javascript
roguelikeMode: {
  enable: true,
  
  features: {
    permadeath: true,
    
    randomStart: {
      traits: 'random',
      position: 'random_1_to_3',
      relationships: 'procedural',
      initial_events: 'shuffled'
    },
    
    scarcity: {
      reputation_gain: -30,
      connection_cost: +50,
      mistake_penalty: +100
    },
    
    acceleration: {
      daily_events: 5,
      event_frequency: 1.5,
      no_cooldowns: true
    }
  },
  
  roguelikeEndings: [
    { id: 'perfect_run', condition: 'survive_300_days', name: '完美通关' },
    { id: 'speedrun', condition: 'reach_director_100_days', name: '速通大师' },
    { id: 'comeback_king', condition: 'recover_from_0_all_stats', name: '绝地反击' }
  ]
}
```

---

## 9. 结局系统

### 9.1 结局分类

```javascript
endings: {
  // 仕途结局
  careerEndings: [
    { id: 'skyrocket', title: '青云直上', desc: '仕途光明，前途无量' },
    { id: 'steady_climb', title: '稳扎稳打', desc: '步步高升' },
    { id: 'plateau', title: '止步入局', desc: '止步于某个层级' },
    { id: 'marginal', title: '边缘人物', desc: '被调离核心岗位' }
  ],
  
  // 人生结局
  lifeEndings: [
    { id: 'balanced', title: '人生赢家', desc: '工作生活双丰收' },
    { id: 'workaholic', title: '鞠躬尽瘁', desc: '为工作牺牲一切' },
    { id: 'burnout', title: '过劳牺牲', desc: '在办公室倒下' },
    { id: 'fish_king', title: '摸鱼之王', desc: '活得最滋润' }
  ],
  
  // 隐藏结局
  hiddenEndings: [
    { id: 'true_ending', title: '不忘初心', requirement: 'all_routes_complete' },
    { id: 'dark_ending', title: '身陷囹圄', requirement: 'max_corruption' },
    { id: 'lonely_crane', title: '孤鹤高飞', requirement: 'max_integrity' }
  ]
}
```

---

## 10. 移动端 UI/UX 设计

### 10.1 屏幕布局（竖屏优先）

```javascript
mobileLayout: {
  // 顶部状态栏（32px）
  statusBar: {
    height: 32,
    elements: [
      'day_counter',
      'time_indicator',
      'quick_needs_bars'
    ]
  },
  
  // 主内容区（自适应）
  mainContent: {
    flex: 1,
    scrollable: true,
    cards: [
      'task_cards',
      'event_cards',
      'notification_cards'
    ]
  },
  
  // 内心声音面板（80px）
  voicePanel: {
    height: 80,
    scrollable: 'horizontal',
    elements: [
      'ambition_indicator',
      'goodperson_indicator',
      'cautious_indicator'
    ]
  },
  
  // 底部快捷操作（64px）
  quickActions: {
    height: 64,
    buttons: [
      { icon: '📋', action: 'tasks' },
      { icon: '👥', action: 'characters' },
      { icon: '💬', action: 'messages' },
      { icon: '📊', action: 'stats' }
    ]
  }
}
```

### 10.2 像素美术规范

```css
/* 像素风格调色板 */
:root {
  /* 主色调 */
  --pixel-black: #1a1c2c;
  --pixel-white: #f4f4f4;
  --pixel-gray: #8b8b8b;
  --pixel-light-gray: #c0c0c0;
  
  /* 强调色 */
  --pixel-red: #b13e53;
  --pixel-blue: #3b5dc9;
  --pixel-green: #38b764;
  --pixel-yellow: #ffcd75;
  --pixel-orange: #ef7d57;
  --pixel-purple: #9b59b6;
  
  /* 状态色 */
  --status-positive: #38b764;
  --status-negative: #b13e53;
  --status-warning: #ffcd75;
  --status-info: #3b5dc9;
  
  /* 像素渲染 */
  --pixel-size: 4px;
  --pixel-font: "Press Start 2P", monospace;
}

/* 像素化处理 */
.pixel-art {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
```

### 10.3 交互设计

```javascript
mobileInteractions: {
  // 手势操作
  gestures: {
    tap: 'select/confirm',
    swipeLeft: 'previous_item',
    swipeRight: 'next_item',
    swipeUp: 'scroll_up',
    swipeDown: 'scroll_down',
    longPress: 'show_details',
    doubleTap: 'quick_complete'
  },
  
  // 操作反馈
  feedback: {
    // 选择动画
    selectionAnimation: {
      duration: 200,
      type: 'pixel_flash'
    },
    
    // 效果展示
    effectAnimation: {
      type: 'floating_number',
      duration: 1500,
      direction: 'up'
    },
    
    // 状态更新
    stateUpdate: {
      transition: 'mosaic',
      duration: 300
    },
    
    // 音效
    sounds: {
      click: 'blip_select.wav',
      confirm: 'chime_success.wav',
      error: 'buzz_error.wav'
    }
  }
}
```

---

## 11. 技术架构（可选）

### 11.1 推荐技术栈

```javascript
recommendedStack: {
  // 前端
  frontend: {
    framework: 'React + TypeScript',
    pixelEngine: 'Phaser' | 'PixiJS',
    stateManagement: 'Redux Toolkit',
    styling: 'CSS-in-JS + SCSS',
    responsive: 'Mobile-first'
  },
  
  // 存储
  storage: {
    local: 'LocalStorage',
    backup: 'IndexedDB',
    cloud: 'Firebase (optional)'
  },
  
  // 音频
  audio: {
    engine: 'Howler.js',
    format: ['mp3', 'ogg']
  }
}
```

### 11.2 数据结构

```javascript
saveData: {
  version: '2.0.0',
  timestamp: Date.now(),
  
  player: {
    name: string,
    background: string,
    traits: string[],
    weekNumber: number,
    createdAt: Date,
    playTime: number
  },
  
  stats: {
    reputation: number,
    connections: number,
    politicalCapital: number,
    principles: number,
    needs: { energy, health, mood, belonging, reputation },
    voices: { ambition, goodperson, cautious },
    skills: { work, social, psychology, political, charm }
  },
  
  gameState: {
    currentDay: number,
    currentPhase: string,
    activeEvents: Event[],
    completedEvents: string[],
    eventCooldowns: Map
  },
  
  relationships: {
    characters: Map<characterId, CharacterRelationship>,
    factions: Map<factionId, FactionStanding>
  },
  
  achievements: {
    unlocked: string[],
    progress: Map<achievementId, number>
  },
  
  settings: {
    narrator: string,
    soundEnabled: boolean,
    musicVolume: number
  }
}
```

---

## 12. 实施优先级

### 阶段1：核心框架（基础版）
1. ✅ 新的像素 UI 框架搭建
2. ✅ 技能系统基础实现
3. ✅ 内心声音系统
4. ✅ 基础事件系统
5. ✅ 移动端布局适配

### 阶段2：社交与关系
6. ✅ 人际关系网络
7. ✅ NPC 特质系统
8. ✅ 派系系统
9. ✅ 需求条系统

### 阶段3：内容与深度
10. ✅ 丰富事件库
11. ✅ 事件链系统
12. ✅ 多路线系统
13. ✅ 结局系统

### 阶段4：重开性与优化
14. ✅ 多周目系统
15. ✅ 随机化引擎
16. ✅ Roguelike 模式
17. ✅ 像素美术资产
18. ✅ 音效与反馈优化

---

## 13. 附录

### 13.1 参考游戏
- 《环世界》(RimWorld) - 故事叙述者、角色管理
- 《极乐迪斯科》(Disco Elysium) - 内心声音、对话树
- 《星露谷物语》(Stardew Valley) - 技能树、社交养成
- 《中国式家长》 - 体制内模拟、人生选择

### 13.2 术语表
- **重开性 (Replayability)**: 玩家多次游玩同一游戏的意愿
- **技能树 (Skill Tree)**: 玩家能力分叉成长的结构
- **内心声音 (Inner Voice)**: 影响决策的内心角色
- **派系 (Faction)**: 游戏中的政治团体
- **周目 (Week/Playthrough)**: 完整游玩一次游戏

---

**文档状态**: 待用户审查  
**下一步**: 等待用户批准后进入实施阶段
