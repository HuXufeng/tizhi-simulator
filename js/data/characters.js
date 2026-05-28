/**
 * 角色数据库 - 体制内模拟器 2.0
 */

// 角色数据库
const CHARACTER_DATABASE = {
  director: {
    id: 'director',
    name: '王建国',
    role: '办公室主任',
    emoji: '👨‍💼',
    description: '在机关干了20年的老资格，谨慎稳重，重规矩，但也有护犊子的一面。',
    
    // 背景特质
    background: {
      type: '老资格',
      effects: {
        initialAuthority: 10,
        workEfficiency: 15,
        resistanceToChange: 20
      }
    },
    
    // 性格特质
    traits: [
      { name: '谨慎', effects: { trustworthy: 15 } },
      { name: '重规矩', effects: { appreciatesDiscipline: 20 } },
      { name: '护犊子', effects: { protectsSubordinates: true } }
    ],
    
    // 需求/动机
    needs: {
      respect: 70,
      achievement: 60,
      control: 80
    },
    
    // 初始关系值
    initialRelationship: {
      trust: 50,
      affection: 0,
      competition: 10,
      dependency: 20
    },
    
    // 偏好事件
    eventPreferences: [
      'bureaucratic_detail',
      'discipline_appreciation',
      'mentorship'
    ],
    
    // 隐藏信息
    hiddenInfo: {
      secret: '曾经犯过错误，年轻时也被处分过',
      unlockRequirement: { social: 3, trust: 80 }
    },
    
    // 对话库
    dialogues: {
      greeting: '有什么事？',
      positive: [
        '做得不错，继续保持！',
        '年轻人有冲劲，很好！',
        '这个思路很清晰，我喜欢！',
        '考虑得很周全，有前途！'
      ],
      neutral: [
        '慢慢来，不着急。',
        '有什么不懂的可以问我。',
        '机关工作要耐得住性子。'
      ],
      negative: [
        '下次注意点，别再犯同样的错误。',
        '工作要细心，不能马虎。',
        '年轻人，稳重一点。'
      ],
      wisdom: [
        '在机关，能力是一方面，更重要的是要懂得"规矩"。',
        '做事要方，做人要圆。',
        '不请示不汇报是大忌。'
      ]
    }
  },

  boss: {
    id: 'boss',
    name: '李明华',
    role: '分管局长',
    emoji: '👴',
    description: '分管副局长，年纪大了，对年轻人既严厉又期望很高。',
    
    background: {
      type: '老领导',
      effects: {
        initialAuthority: 20,
        expectations: 15,
        pressureStyle: 'direct'
      }
    },
    
    traits: [
      { name: '严厉', effects: { strictness: 20 } },
      { name: '期望高', effects: { highExpectations: true } },
      { name: '务实', effects: { pragmatic: 15 } }
    ],
    
    needs: {
      respect: 80,
      achievement: 70,
      control: 90
    },
    
    initialRelationship: {
      trust: 45,
      affection: -10,
      competition: 5,
      dependency: 15
    },
    
    eventPreferences: [
      'achievement_focus',
      'leadership_test',
      'pressure_situation'
    ],
    
    hiddenInfo: {
      secret: '即将退休，在考虑接班人问题',
      unlockRequirement: { work: 4, trust: 85 }
    },
    
    dialogues: {
      greeting: '有什么事，简单说。',
      positive: [
        '这个年轻人不错，有潜力！',
        '能看出来是下了功夫的。',
        '思路清晰，措施有力！'
      ],
      neutral: [
        '还要继续锻炼。',
        '还需要时间成长。',
        '继续观察观察。'
      ],
      negative: [
        '这工作是怎么做的？！',
        '让我怎么交代？！',
        '低级错误，不可原谅！'
      ],
      wisdom: [
        '机遇只垂青有准备的头脑。',
        '格局决定结局，态度决定高度。',
        '能吃苦中苦，方为人上人。'
      ]
    }
  },

  colleague: {
    id: 'colleague',
    name: '李秀英',
    role: '科室同事',
    emoji: '👩',
    description: '科室的老大姐，热心肠，但在机关久了也有些圆滑。',
    
    background: {
      type: '老员工',
      effects: {
        experience: 20,
        networkKnowledge: 15,
        pragmatic: true
      }
    },
    
    traits: [
      { name: '热心', effects: { helpfulness: 15 } },
      { name: '圆滑', effects: { diplomacy: 10 } },
      { name: '爱八卦', effects: { gossipy: true } }
    ],
    
    needs: {
      respect: 50,
      achievement: 40,
      control: 30
    },
    
    initialRelationship: {
      trust: 60,
      affection: 10,
      competition: 0,
      dependency: 30
    },
    
    eventPreferences: [
      'social_interaction',
      'gossip',
      'mutual_help'
    ],
    
    hiddenInfo: {
      secret: '知道很多办公室的秘密',
      unlockRequirement: { social: 2, trust: 70 }
    },
    
    dialogues: {
      greeting: '小张啊，有什么事吗？',
      positive: [
        '小张不错啊，有前途！',
        '年轻人脑子就是活！',
        '有什么事尽管说，能帮的我一定帮。'
      ],
      neutral: [
        '差不多就行，别太较真。',
        '机关就这样，慢慢适应吧。',
        '能推就推，推不了再说。'
      ],
      negative: [
        '怎么这么不小心...',
        '年轻人还是太嫩了。'
      ],
      wisdom: [
        '在机关干活，眼里要有活，心里要有数。',
        '干得好不如干得巧，二八原则要记牢。',
        '吃亏是福，吃小亏占大便宜。'
      ]
    }
  },

  subordinate: {
    id: 'subordinate',
    name: '张伟',
    role: '年轻下属',
    emoji: '🧑',
    description: '比你晚来一年的年轻同事，勤奋好学，但经验不足。',
    
    background: {
      type: '新人',
      effects: {
        eagerness: 20,
        inexperience: -10,
        learningSpeed: 15
      }
    },
    
    traits: [
      { name: '勤奋', effects: { hardworking: 15 } },
      { name: '谦虚', effects: { modest: 10 } },
      { name: '好学', effects: { eagerToLearn: true } }
    ],
    
    needs: {
      respect: 40,
      achievement: 60,
      control: 20
    },
    
    initialRelationship: {
      trust: 70,
      affection: 15,
      competition: 5,
      dependency: 40
    },
    
    eventPreferences: [
      'mentorship',
      'learning_opportunity',
      'collaboration'
    ],
    
    hiddenInfo: {
      secret: '有关系，但从不声张',
      unlockRequirement: { psychology: 2, trust: 60 }
    },
    
    dialogues: {
      greeting: '张哥/张姐，有什么事需要帮忙吗？',
      positive: [
        '谢谢前辈指点！',
        '学到很多，我会继续努力的！',
        '有什么我能帮的尽管说！'
      ],
      neutral: [
        '好的，我知道了。',
        '这个我还不太懂，能教教我吗？'
      ],
      negative: [
        '对不起，我下次一定注意...',
        '我是不是做错了什么？'
      ],
      wisdom: [
        '刚来什么都得学啊...',
        '机关的水很深，要学的还很多。'
      ]
    }
  },

  public: {
    id: 'public',
    name: '群众代表',
    role: '服务对象',
    emoji: '👥',
    description: '来办事的群众，形形色色，有的通情达理，有的情绪激动。',
    
    background: {
      type: '群众',
      effects: {
        diversity: true,
        needsFocus: 'varies'
      }
    },
    
    traits: [
      { name: '多样性', effects: { varies: true } },
      { name: '需求导向', effects: { outcomeFocused: true } }
    ],
    
    needs: {
      respect: 60,
      achievement: 0,
      control: 20
    },
    
    initialRelationship: {
      trust: 50,
      affection: 0,
      competition: 0,
      dependency: 10
    },
    
    eventPreferences: [
      'service_delivery',
      'complaint_handling',
      'public_interaction'
    ],
    
    hiddenInfo: {
      secret: '有时候背后有人',
      unlockRequirement: { service: 3, publicTrust: 70 }
    },
    
    dialogues: {
      greeting: '同志，你好。',
      positive: [
        '谢谢同志，辛苦了！',
        '你们服务态度真好！',
        '太感谢了，帮了大忙！'
      ],
      neutral: [
        '好的，我知道了。',
        '这事儿能办吗？'
      ],
      negative: [
        '你们这是什么态度？！',
        '我要投诉你们！',
        '这事儿我找你们领导！'
      ],
      wisdom: [
        '群众的事无小事。',
        '将心比心，真诚是最好的方法。'
      ]
    }
  },

  self: {
    id: 'self',
    name: '自己',
    role: '自我反思',
    emoji: '🧘',
    description: '内心的自己，需要不断反思和成长。',
    
    background: {
      type: '成长中',
      effects: {
        selfAwareness: true,
        growth: true
      }
    },
    
    traits: [
      { name: '反思', effects: { reflective: true } },
      { name: '成长', effects: { adaptable: true } }
    ],
    
    needs: {
      respect: 50,
      achievement: 70,
      control: 40
    },
    
    initialRelationship: {
      trust: 80,
      affection: 50,
      competition: 0,
      dependency: 0
    },
    
    eventPreferences: [
      'reflection',
      'principle_dilemma',
      'growth_opportunity'
    ],
    
    dialogues: {
      greeting: '今天的我...',
      positive: [
        '今天做得不错，继续保持！',
        '每一次选择都在塑造更好的自己。',
        '坚持初心，方得始终。'
      ],
      neutral: [
        '需要反思一下今天的选择。',
        '明天要更加努力。'
      ],
      negative: [
        '今天是不是做错了什么？',
        '为什么总是犹豫不决？',
        '这样做真的对吗？'
      ],
      wisdom: [
        '不忘初心，方得始终。',
        '选择体制，就是选择了一种生活方式。',
        '活得坦荡，才能睡得安稳。'
      ]
    }
  }
};

// 派系系统
const FACTION_DATABASE = {
  reformists: {
    id: 'reformists',
    name: '改革派',
    leader: '张科长',
    members: 3,
    ideology: '创新、效率',
    influence: 35,
    color: '#3b5dc9',
    description: '主张改革创新，追求效率和政绩。'
  },
  
  conservatives: {
    id: 'conservatives',
    name: '保守派',
    leader: '王主任',
    members: 5,
    ideology: '稳定、传统',
    influence: 45,
    color: '#b13e53',
    description: '注重稳定和传统，讲究规矩和资历。'
  },
  
  neutrals: {
    id: 'neutrals',
    name: '中立派',
    leader: null,
    members: 2,
    ideology: '中立、观望',
    influence: 20,
    color: '#8b8b8b',
    description: '不参与派系斗争，保持中立。'
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CHARACTER_DATABASE, FACTION_DATABASE };
}
