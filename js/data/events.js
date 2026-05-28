/**
 * 事件库 - 体制内模拟器 2.0
 * 完整版：50+ 精选事件
 */

// 事件库
const EVENT_DATABASE = {
  
  // ==================== 日常公文类 ====================
  
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

  document_review: {
    id: 'document_review',
    category: '公文处理',
    title: '📄 文件审核',
    description: '收到一份{{doc_type}}需要审核，内容涉及{{content}}， deadline是今天下班前。',
    difficulty: 'normal',
    timeCost: 3,
    sender: 'director',
    params: {
      doc_type: { values: ['请示报告', '通知文件', '工作方案', '实施方案', '情况汇报'] },
      content: { values: ['人事调整', '经费使用', '项目招标', '政策落实', '绩效考核'] }
    },
    options: [
      {
        text: '逐字逐句审核，确保无误',
        type: 'cautious',
        effects: { energy: -20, reputation: 10, exp: 35 },
        characterEffects: { director: 12 },
        voiceBonus: { ambition: 5, goodperson: 10, cautious: 15 }
      },
      {
        text: '快速浏览主要条款',
        type: 'balanced',
        effects: { energy: -10, reputation: 2, exp: 18 },
        characterEffects: { director: 0 },
        voiceBonus: { ambition: 5, goodperson: -5, cautious: -5 }
      },
      {
        text: '直接签字报送',
        type: 'very_risky',
        effects: { energy: -2, reputation: -15, exp: 5 },
        characterEffects: { director: -20 },
        voiceBonus: { ambition: 10, goodperson: -15, cautious: -20 }
      }
    ]
  },

  email_reply: {
    id: 'email_reply',
    category: '公文处理',
    title: '📧 邮件回复',
    description: '收到{{email_sender}}的邮件，关于{{email_topic}}，需要今天回复。',
    difficulty: 'normal',
    timeCost: 1,
    sender: 'director',
    params: {
      email_sender: { values: ['上级部门', '兄弟单位', '区县政府', '企业代表', '群众来信'] },
      email_topic: { values: ['政策咨询', '工作协调', '情况反馈', '投诉建议', '合作意向'] }
    },
    options: [
      {
        text: '认真研究后，详尽回复',
        type: 'goodperson',
        effects: { energy: -12, reputation: 8, exp: 25 },
        characterEffects: { director: 10 },
        voiceBonus: { ambition: 0, goodperson: 15, cautious: 5 }
      },
      {
        text: '礼貌性回复，感谢关注',
        type: 'balanced',
        effects: { energy: -5, reputation: 2, exp: 12 },
        characterEffects: { director: 2 },
        voiceBonus: { ambition: 5, goodperson: -5, cautious: 0 }
      },
      {
        text: '暂不回复，等对方再催',
        type: 'risky',
        effects: { energy: 0, reputation: -12, exp: 3 },
        characterEffects: { director: -15 },
        voiceBonus: { ambition: 5, goodperson: -10, cautious: 10 }
      }
    ]
  },

  // ==================== 会议服务类 ====================
  
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

  meeting_record: {
    id: 'meeting_record',
    category: '会议服务',
    title: '📝 会议记录',
    description: '{{meeting_type}}需要完整记录，领导特别强调要准确无误。',
    difficulty: 'normal',
    timeCost: 2,
    sender: 'boss',
    params: {
      meeting_type: { values: ['党组会议', '办公会议', '专题会议', '民主生活会', '年度总结会'] }
    },
    options: [
      {
        text: '全程专注记录，会后整理成稿',
        type: 'cautious',
        effects: { energy: -15, reputation: 12, exp: 38 },
        characterEffects: { boss: 15, director: 10 },
        voiceBonus: { ambition: 5, goodperson: 10, cautious: 15 }
      },
      {
        text: '边听边记，挑重点记',
        type: 'balanced',
        effects: { energy: -10, reputation: 3, exp: 20 },
        characterEffects: { boss: 3 },
        voiceBonus: { ambition: 5, goodperson: 0, cautious: -5 }
      },
      {
        text: '用手机录音，回去整理',
        type: 'risky',
        effects: { energy: -5, reputation: -8, exp: 10 },
        characterEffects: { boss: -12 },
        voiceBonus: { ambition: 5, goodperson: -5, cautious: -10 }
      }
    ]
  },

  meeting_materials: {
    id: 'meeting_materials',
    category: '会议服务',
    title: '📑 会议材料准备',
    description: '{{meeting_name}}需要准备{{material_type}}，需要打印装订{{quantity}}份。',
    difficulty: 'normal',
    timeCost: 2,
    sender: 'director',
    params: {
      meeting_name: { values: ['专题学习会', '工作部署会', '经验交流会', '表彰大会', '动员大会'] },
      material_type: { values: ['会议议程', '领导讲话', '经验材料', '汇报材料', '会议资料'] },
      quantity: { values: [30, 50, 80, 100, 150] }
    },
    options: [
      {
        text: '提前一天准备，仔细检查',
        type: 'cautious',
        effects: { energy: -15, reputation: 8, exp: 28 },
        characterEffects: { director: 12 },
        voiceBonus: { ambition: 5, goodperson: 10, cautious: 15 }
      },
      {
        text: '提前半天准备',
        type: 'balanced',
        effects: { energy: -10, reputation: 3, exp: 18 },
        characterEffects: { director: 3 },
        voiceBonus: { ambition: 5, goodperson: 0, cautious: 0 }
      },
      {
        text: '会议前一小时才印',
        type: 'very_risky',
        effects: { energy: -8, reputation: -18, exp: 5 },
        characterEffects: { director: -20, boss: -15 },
        voiceBonus: { ambition: 10, goodperson: -15, cautious: -20 }
      }
    ]
  },

  // ==================== 紧急事件类 ====================
  
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

  public_incident: {
    id: 'public_incident',
    category: '紧急信息',
    title: '🚨 群众聚集事件',
    description: '有{{group_size}}名群众在政府门口聚集，反映{{issue}}问题，情绪激动。',
    difficulty: 'urgent',
    timeCost: 3,
    sender: 'boss',
    params: {
      group_size: { values: [10, 20, 30, 50, 80] },
      issue: { values: ['征地补偿', '环境污染', '工资拖欠', '房屋拆迁', '执法纠纷'] }
    },
    options: [
      {
        text: '立即报告领导，带人现场处置',
        type: 'ambitious',
        effects: { energy: -25, health: -15, reputation: 20, exp: 50 },
        characterEffects: { boss: 25, director: 15 },
        voiceBonus: { ambition: 15, goodperson: 5, cautious: -10 }
      },
      {
        text: '先了解情况，稳定群众情绪',
        type: 'balanced',
        effects: { energy: -20, reputation: 8, exp: 30 },
        characterEffects: { boss: 10 },
        voiceBonus: { ambition: 5, goodperson: 10, cautious: 5 }
      },
      {
        text: '打电话报警，让保安去处理',
        type: 'very_risky',
        effects: { energy: -5, reputation: -30, exp: 5 },
        characterEffects: { boss: -25, director: -20 },
        voiceBonus: { ambition: 0, goodperson: -15, cautious: -5 }
      }
    ]
  },

  safety_accident: {
    id: 'safety_accident',
    category: '紧急信息',
    title: '🏭 安全事故',
    description: '接到报告，{{location}}发生{{accident_type}}，已造成{{casualties}}人{{severity}}。',
    difficulty: 'urgent',
    timeCost: 4,
    sender: 'boss',
    params: {
      location: { values: ['工厂', '工地', '矿山', '学校', '商场'] },
      accident_type: { values: ['坍塌事故', '火灾事故', '中毒事故', '触电事故', '爆炸事故'] },
      casualties: { values: [1, 2, 3, 5, 8] },
      severity: { values: ['受伤', '重伤', '死亡', '多人伤亡'] }
    },
    options: [
      {
        text: '启动应急预案，第一时间赶赴现场',
        type: 'ambitious',
        effects: { energy: -30, health: -20, reputation: 25, exp: 60 },
        characterEffects: { boss: 28, director: 18 },
        voiceBonus: { ambition: 15, goodperson: 10, cautious: -15 }
      },
      {
        text: '按程序报告，等待指示',
        type: 'cautious',
        effects: { energy: -15, reputation: -5, exp: 20 },
        characterEffects: { boss: -8 },
        voiceBonus: { ambition: -10, goodperson: 5, cautious: 15 }
      },
      {
        text: '先调查清楚再报，不想担责',
        type: 'very_risky',
        effects: { energy: -10, reputation: -35, exp: 0 },
        characterEffects: { boss: -35, director: -30 },
        voiceBonus: { ambition: -15, goodperson: -10, cautious: -10 }
      }
    ]
  },

  internet_rumor: {
    id: 'internet_rumor',
    category: '紧急信息',
    title: '🌐 网络舆情',
    description: '网上出现关于{{topic}}的帖子，已经有{{views}}浏览量，评论很激烈。',
    difficulty: 'urgent',
    timeCost: 2,
    sender: 'director',
    params: {
      topic: { values: ['单位不作为', '领导贪腐', '政策争议', '执法过当', '环境污染'] },
      views: { values: [1000, 5000, 10000, 50000, 100000] }
    },
    options: [
      {
        text: '立即向领导汇报，准备应对方案',
        type: 'cautious',
        effects: { energy: -20, reputation: 12, exp: 40 },
        characterEffects: { director: 15, boss: 10 },
        voiceBonus: { ambition: 5, goodperson: 5, cautious: 15 }
      },
      {
        text: '先删帖，再慢慢处理',
        type: 'risky',
        effects: { energy: -15, reputation: -15, exp: 15 },
        characterEffects: { director: -18 },
        voiceBonus: { ambition: 10, goodperson: -10, cautious: -5 }
      },
      {
        text: '装作没看见，希望不了了之',
        type: 'very_risky',
        effects: { energy: -5, reputation: -25, exp: 0 },
        characterEffects: { director: -25, boss: -20 },
        voiceBonus: { ambition: 5, goodperson: -15, cautious: 5 }
      }
    ]
  },

  // ==================== 服务群众类 ====================
  
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

  petition_handling: {
    id: 'petition_handling',
    category: '服务群众',
    title: '📮 信访处理',
    description: '收到一封{{petition_type}}信访件，反映{{petition_issue}}问题，要求{{deadline}}前答复。',
    difficulty: 'normal',
    timeCost: 3,
    sender: 'director',
    params: {
      petition_type: { values: ['省级转办', '市级交办', '本级受理', '领导批示', '联合督办'] },
      petition_issue: { values: ['行政不作为', '执法不规范', '权益受侵害', '政策不落实', '工作人员态度'] },
      deadline: { values: ['3天', '5天', '7天', '10天', '15天'] }
    },
    options: [
      {
        text: '实地调查，还原真相，公正处理',
        type: 'goodperson',
        effects: { energy: -25, reputation: 22, exp: 45 },
        characterEffects: { public: 25, director: 15 },
        voiceBonus: { ambition: 0, goodperson: 15, cautious: 10 }
      },
      {
        text: '按程序调查，书面回复',
        type: 'balanced',
        effects: { energy: -15, reputation: 5, exp: 25 },
        characterEffects: { director: 5 },
        voiceBonus: { ambition: 5, goodperson: 0, cautious: 5 }
      },
      {
        text: '简单回复，应付了事',
        type: 'very_risky',
        effects: { energy: -5, reputation: -20, exp: 8 },
        characterEffects: { public: -25, director: -18 },
        voiceBonus: { ambition: 10, goodperson: -15, cautious: -10 }
      }
    ]
  },

  hotline_call: {
    id: 'hotline_call',
    category: '服务群众',
    title: '📞 热线电话',
    description: '接到市长热线转来的投诉，反映{{complaint_topic}}，要求{{response_time}}内回复。',
    difficulty: 'normal',
    timeCost: 1,
    sender: 'public',
    params: {
      complaint_topic: { values: ['办事效率低', '工作人员态度差', '推诿扯皮', '办事流程复杂', '一次性告知不到位'] },
      response_time: { values: ['1小时', '2小时', '4小时', '当天', '3天'] }
    },
    options: [
      {
        text: '第一时间联系投诉人，了解详情',
        type: 'goodperson',
        effects: { energy: -12, reputation: 15, exp: 30 },
        characterEffects: { public: 22, director: 12 },
        voiceBonus: { ambition: 0, goodperson: 15, cautious: 5 }
      },
      {
        text: '按流程转办，等待回复',
        type: 'balanced',
        effects: { energy: -5, reputation: 3, exp: 15 },
        characterEffects: { director: 3 },
        voiceBonus: { ambition: 5, goodperson: -5, cautious: 5 }
      },
      {
        text: '先放一放，等快到期再说',
        type: 'very_risky',
        effects: { energy: 0, reputation: -18, exp: 5 },
        characterEffects: { director: -20, boss: -15 },
        voiceBonus: { ambition: 5, goodperson: -15, cautious: 0 }
      }
    ]
  },

  // ==================== 人际关系类 ====================
  
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
  },

  mentor_guidance: {
    id: 'mentor_guidance',
    category: '人际关系',
    title: '👨‍🏫 导师指导',
    description: '王主任找你谈话，说要好好培养你，让你{{development_focus}}。',
    difficulty: 'normal',
    timeCost: 1,
    sender: 'director',
    params: {
      development_focus: { values: ['写材料', '搞协调', '做服务', '带队伍', '抓落实'] }
    },
    options: [
      {
        text: '感谢领导信任，认真学习',
        type: 'goodperson',
        effects: { energy: 5, reputation: 15, connections: 12, exp: 25 },
        characterEffects: { director: 20, boss: 8 },
        voiceBonus: { ambition: 10, goodperson: 10, cautious: 0 }
      },
      {
        text: '表决心，争取表现机会',
        type: 'ambitious',
        effects: { energy: 0, reputation: 10, exp: 20 },
        characterEffects: { director: 15 },
        voiceBonus: { ambition: 15, goodperson: -5, cautious: -10 }
      },
      {
        text: '谦虚低调，说自己还需要锻炼',
        type: 'cautious',
        effects: { energy: 0, reputation: 5, exp: 15 },
        characterEffects: { director: 8 },
        voiceBonus: { ambition: -10, goodperson: 5, cautious: 15 }
      }
    ]
  },

  colleague_conflict: {
    id: 'colleague_conflict',
    category: '人际关系',
    title: '⚔️ 同事矛盾',
    description: '张伟在背后说你坏话，被你无意中听到了。他说{{gossip_content}}。',
    difficulty: 'important',
    timeCost: 1,
    sender: 'subordinate',
    params: {
      gossip_content: { values: ['你能力不行', '你会拍马屁', '你抢功', '你偷懒', '你不合群'] }
    },
    options: [
      {
        text: '当面质问，要求解释清楚',
        type: 'risky',
        effects: { energy: -15, reputation: -8, connections: -15, exp: 10 },
        characterEffects: { subordinate: -30, colleague: -10 },
        voiceBonus: { ambition: 15, goodperson: -10, cautious: -15 }
      },
      {
        text: '装作不知道，以后注意',
        type: 'cautious',
        effects: { energy: -5, reputation: 5, exp: 8 },
        characterEffects: { subordinate: 5 },
        voiceBonus: { ambition: -10, goodperson: 5, cautious: 15 }
      },
      {
        text: '找王主任汇报，请领导处理',
        type: 'balanced',
        effects: { energy: -8, reputation: -5, exp: 12 },
        characterEffects: { subordinate: -15, director: 10 },
        voiceBonus: { ambition: 5, goodperson: 0, cautious: 5 }
      }
    ]
  },

  birthday_party: {
    id: 'birthday_party',
    category: '人际关系',
    title: '🎂 同事生日',
    description: '今天是李姐的50岁生日，大家商量着要不要热闹一下。但单位有规定，不能{{violation_type}}。',
    difficulty: 'normal',
    timeCost: 2,
    sender: 'colleague',
    params: {
      violation_type: { values: ['工作时间聚会', '动用公款', '收受礼品', '大操大办', '影响工作'] }
    },
    options: [
      {
        text: '简单庆祝，不违规就好',
        type: 'goodperson',
        effects: { energy: -10, connections: 15, reputation: 8, exp: 20 },
        characterEffects: { colleague: 20, director: 5 },
        voiceBonus: { ambition: -5, goodperson: 15, cautious: 10 }
      },
      {
        text: '随个份子，不参加聚会',
        type: 'balanced',
        effects: { energy: 0, connections: 8, exp: 10 },
        characterEffects: { colleague: 8 },
        voiceBonus: { ambition: 5, goodperson: 0, cautious: 5 }
      },
      {
        text: '借口不参加，不想惹麻烦',
        type: 'risky',
        effects: { energy: 0, connections: -12, reputation: -5, exp: 5 },
        characterEffects: { colleague: -20 },
        voiceBonus: { ambition: 10, goodperson: -15, cautious: 10 }
      }
    ]
  },

  // ==================== 职场政治类 ====================
  
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

  promotion_opportunity: {
    id: 'promotion_opportunity',
    category: '职场政治',
    title: '📈 晋升机会',
    description: '听说有一个晋升名额，但竞争很激烈。符合条件的包括你和{{rival}}。',
    difficulty: 'important',
    timeCost: 1,
    sender: 'colleague',
    params: {
      rival: { values: ['张伟', '刘芳', '陈明', '王强', '李娜'] }
    },
    options: [
      {
        text: '主动找领导表态，争取机会',
        type: 'ambitious',
        effects: { energy: -15, reputation: 18, connections: -5, exp: 30 },
        characterEffects: { director: 15, boss: 10, colleague: -10 },
        voiceBonus: { ambition: 15, goodperson: -10, cautious: -10 }
      },
      {
        text: '默默努力，让成绩说话',
        type: 'goodperson',
        effects: { energy: -20, reputation: 12, exp: 35 },
        characterEffects: { director: 10, boss: 8 },
        voiceBonus: { ambition: 5, goodperson: 15, cautious: 5 }
      },
      {
        text: '找人说情，走关系路线',
        type: 'very_risky',
        effects: { energy: -10, reputation: -25, connections: -15, exp: 15 },
        characterEffects: { director: -15, boss: -20 },
        voiceBonus: { ambition: 10, goodperson: -15, cautious: -20 }
      }
    ]
  },

  faction_choice: {
    id: 'faction_choice',
    category: '职场政治',
    title: '⚖️ 站队选择',
    description: '张科长私下找你，说改革派需要你这样的年轻人支持。你知道这意味着{{meaning}}。',
    difficulty: 'important',
    timeCost: 1,
    sender: 'director',
    params: {
      meaning: { values: ['要和现任领导对着干', '要得罪王主任', '要卷入党派斗争', '要做出选择'] }
    },
    options: [
      {
        text: '婉言谢绝，不想卷入派系',
        type: 'cautious',
        effects: { energy: 0, reputation: -8, connections: -10, exp: 15 },
        characterEffects: { director: -15 },
        voiceBonus: { ambition: -15, goodperson: 5, cautious: 20 }
      },
      {
        text: '表面答应，私下不参与',
        type: 'balanced',
        effects: { energy: 0, reputation: -5, exp: 12 },
        characterEffects: { director: -5 },
        voiceBonus: { ambition: 5, goodperson: -10, cautious: 15 }
      },
      {
        text: '明确表态，加入改革派',
        type: 'very_risky',
        effects: { energy: -10, reputation: 15, connections: 20, exp: 25 },
        characterEffects: { director: -20, boss: -15 },
        voiceBonus: { ambition: 20, goodperson: -15, cautious: -20 }
      }
    ]
  },

  // ==================== 值班值守类 ====================
  
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

  holiday_work: {
    id: 'holiday_work',
    category: '值班值守',
    title: '🏖️ 节假日加班',
    description: '周末接到紧急任务，需要{{task_type}}，领导要求{{urgency}}完成。',
    difficulty: 'normal',
    timeCost: 6,
    sender: 'boss',
    params: {
      task_type: { values: ['赶材料', '迎接检查', '处置突发事件', '写总结报告', '组织会议'] },
      urgency: { values: ['必须今天', '明天上午', '周一上班前', '三天内', '一周内'] }
    },
    options: [
      {
        text: '毫无怨言，立即加班完成',
        type: 'goodperson',
        effects: { energy: -30, health: -12, reputation: 20, exp: 50 },
        characterEffects: { boss: 20, director: 15 },
        voiceBonus: { ambition: 10, goodperson: 15, cautious: -10 }
      },
      {
        text: '按时完成，但有情绪',
        type: 'balanced',
        effects: { energy: -25, reputation: 5, exp: 30 },
        characterEffects: { boss: 5 },
        voiceBonus: { ambition: 5, goodperson: -5, cautious: 5 }
      },
      {
        text: '找借口推脱',
        type: 'very_risky',
        effects: { energy: 0, reputation: -20, exp: 5 },
        characterEffects: { boss: -25, director: -18 },
        voiceBonus: { ambition: 10, goodperson: -20, cautious: 5 }
      }
    ]
  },

  emergency_phone: {
    id: 'emergency_phone',
    category: '值班值守',
    title: '📱 深夜电话',
    description: '凌晨3点，值班室打来电话，说{{emergency_type}}，需要你马上处理。',
    difficulty: 'urgent',
    timeCost: 3,
    sender: 'boss',
    params: {
      emergency_type: { values: ['群众上访', '突发舆情', '安全事故', '信访交办', '领导临时要材料'] }
    },
    options: [
      {
        text: '二话不说，立即处理',
        type: 'ambitious',
        effects: { energy: -25, health: -15, reputation: 22, exp: 45 },
        characterEffects: { boss: 22, director: 15 },
        voiceBonus: { ambition: 15, goodperson: 10, cautious: -15 }
      },
      {
        text: '先了解情况，看是否紧急',
        type: 'cautious',
        effects: { energy: -15, reputation: 8, exp: 25 },
        characterEffects: { boss: 8 },
        voiceBonus: { ambition: -5, goodperson: 5, cautious: 15 }
      },
      {
        text: '说太晚了，明天再说',
        type: 'very_risky',
        effects: { energy: 0, reputation: -28, exp: 0 },
        characterEffects: { boss: -28, director: -20 },
        voiceBonus: { ambition: -10, goodperson: -15, cautious: 10 }
      }
    ]
  },

  // ==================== 文字综合类 ====================
  
  policy_draft: {
    id: 'policy_draft',
    category: '文字综合',
    title: '📜 政策文件起草',
    description: '根据领导指示，需要起草一份关于{{policy_topic}}的实施意见。',
    difficulty: 'important',
    timeCost: 5,
    sender: 'boss',
    params: {
      policy_topic: { values: ['优化营商环境', '乡村振兴', '基层治理', '民生保障', '生态文明建设'] }
    },
    options: [
      {
        text: '深入调研，结合实际，起草高质量文件',
        type: 'ambitious',
        effects: { energy: -30, health: -10, reputation: 28, exp: 60 },
        characterEffects: { boss: 28, director: 18 },
        voiceBonus: { ambition: 15, goodperson: 10, cautious: -5 }
      },
      {
        text: '参考上级文件，结合本单位情况',
        type: 'balanced',
        effects: { energy: -20, reputation: 5, exp: 35 },
        characterEffects: { boss: 5 },
        voiceBonus: { ambition: 5, goodperson: 0, cautious: 5 }
      },
      {
        text: '网上抄一篇，改改单位名称',
        type: 'very_risky',
        effects: { energy: -5, reputation: -22, exp: 8 },
        characterEffects: { boss: -28, director: -20 },
        voiceBonus: { ambition: -5, goodperson: -15, cautious: -15 }
      }
    ]
  },

  inspection_report: {
    id: 'inspection_report',
    category: '文字综合',
    title: '📊 迎检材料',
    description: '上级要来检查{{inspection_type}}工作，需要准备一套完整的汇报材料。',
    difficulty: 'important',
    timeCost: 4,
    sender: 'director',
    params: {
      inspection_type: { values: ['党建工作', '安全生产', '环境保护', '脱贫攻坚', '意识形态'] }
    },
    options: [
      {
        text: '实事求是，全面展示工作成效',
        type: 'goodperson',
        effects: { energy: -25, reputation: 20, exp: 50 },
        characterEffects: { director: 18, boss: 12 },
        voiceBonus: { ambition: 5, goodperson: 15, cautious: 5 }
      },
      {
        text: '突出亮点，适度包装',
        type: 'balanced',
        effects: { energy: -18, reputation: 8, exp: 32 },
        characterEffects: { director: 8 },
        voiceBonus: { ambition: 10, goodperson: -5, cautious: 0 }
      },
      {
        text: '材料造假，夸大成绩',
        type: 'very_risky',
        effects: { energy: -12, reputation: -28, exp: 10 },
        characterEffects: { director: -25, boss: -22 },
        voiceBonus: { ambition: 15, goodperson: -20, cautious: -15 }
      }
    ]
  },

  year_summary: {
    id: 'year_summary',
    category: '文字综合',
    title: '📝 年度工作总结',
    description: '又到年底了，需要写年度工作总结。领导特别强调要写出{{highlight}}。',
    difficulty: 'normal',
    timeCost: 4,
    sender: 'boss',
    params: {
      highlight: { values: ['工作亮点', '创新举措', '突出成绩', '典型经验', '个人贡献'] }
    },
    options: [
      {
        text: '全面回顾，突出重点，实事求是',
        type: 'goodperson',
        effects: { energy: -25, reputation: 18, exp: 45 },
        characterEffects: { boss: 15, director: 10 },
        voiceBonus: { ambition: 5, goodperson: 15, cautious: 10 }
      },
      {
        text: '参考去年框架，适当调整',
        type: 'balanced',
        effects: { energy: -15, reputation: 5, exp: 25 },
        characterEffects: { boss: 3 },
        voiceBonus: { ambition: 5, goodperson: 0, cautious: 5 }
      },
      {
        text: '敷衍了事，网上抄抄',
        type: 'risky',
        effects: { energy: -5, reputation: -18, exp: 8 },
        characterEffects: { boss: -20, director: -15 },
        voiceBonus: { ambition: 5, goodperson: -15, cautious: -10 }
      }
    ]
  },

  // ==================== 特殊事件类 ====================
  
  surprise_inspection: {
    id: 'surprise_inspection',
    category: '应急处置',
    title: '🔍 突击检查',
    description: '毫无征兆，上级领导突然来检查{{inspection_target}}工作。你一点准备都没有。',
    difficulty: 'urgent',
    timeCost: 2,
    sender: 'boss',
    params: {
      inspection_target: { values: ['办公室环境', '工作纪律', '档案管理', '值班情况', '食品安全'] }
    },
    options: [
      {
        text: '坦诚相待，展现真实工作状态',
        type: 'goodperson',
        effects: { energy: -15, reputation: 15, exp: 35 },
        characterEffects: { boss: 12, director: 8 },
        voiceBonus: { ambition: 0, goodperson: 15, cautious: 10 }
      },
      {
        text: '找借口拖延，争取准备时间',
        type: 'cautious',
        effects: { energy: -10, reputation: -8, exp: 15 },
        characterEffects: { boss: -8 },
        voiceBonus: { ambition: -5, goodperson: -5, cautious: 15 }
      },
      {
        text: '手忙脚乱，漏洞百出',
        type: 'very_risky',
        effects: { energy: -12, reputation: -25, exp: 5 },
        characterEffects: { boss: -25, director: -20 },
        voiceBonus: { ambition: -5, goodperson: -10, cautious: -15 }
      }
    ]
  },

  secret_gift: {
    id: 'secret_gift',
    category: '应急处置',
    title: '🎁 神秘礼物',
    description: '下班后，发现办公桌上有一份{{gift_type}}，没有署名。据说是{{giver}}送的。',
    difficulty: 'important',
    timeCost: 1,
    sender: 'director',
    params: {
      gift_type: { values: ['购物卡', '茶叶', '水果篮', '特产礼盒', '红包'] },
      giver: { values: ['有求于你的', '想巴结你的', '感谢你的', '试探你的', '不明身份'] }
    },
    options: [
      {
        text: '原封不动上交纪委',
        type: 'goodperson',
        effects: { energy: 0, reputation: 25, exp: 30 },
        characterEffects: { director: 15, boss: 12 },
        voiceBonus: { ambition: -10, goodperson: 20, cautious: 15 }
      },
      {
        text: '先收下，以后再说',
        type: 'risky',
        effects: { energy: 0, reputation: -18, exp: 10 },
        characterEffects: { director: -20 },
        voiceBonus: { ambition: 15, goodperson: -15, cautious: -10 }
      },
      {
        text: '直接退还给对方',
        type: 'cautious',
        effects: { energy: 0, reputation: 12, exp: 20 },
        characterEffects: { director: 10 },
        voiceBonus: { ambition: -5, goodperson: 10, cautious: 15 }
      }
    ]
  },

  office_conflict: {
    id: 'office_conflict',
    category: '人际关系',
    title: '💢 办公室冲突',
    description: '你和李姐因为{{conflict_reason}}发生了激烈争吵，声音很大，引来了很多人围观。',
    difficulty: 'important',
    timeCost: 1,
    sender: 'colleague',
    params: {
      conflict_reason: { values: ['工作责任归属', '功劳分配不均', '沟通方式问题', '性格不合', '积怨已久'] }
    },
    options: [
      {
        text: '立即道歉，化解矛盾',
        type: 'goodperson',
        effects: { energy: -10, reputation: -5, connections: 15, exp: 15 },
        characterEffects: { colleague: 20, director: -10 },
        voiceBonus: { ambition: -15, goodperson: 20, cautious: 10 }
      },
      {
        text: '坚持立场，不卑不亢',
        type: 'balanced',
        effects: { energy: -12, reputation: 8, connections: -10, exp: 18 },
        characterEffects: { colleague: -15, director: 5 },
        voiceBonus: { ambition: 10, goodperson: 0, cautious: 5 }
      },
      {
        text: '拍桌子据理力争',
        type: 'very_risky',
        effects: { energy: -15, reputation: -20, connections: -25, exp: 10 },
        characterEffects: { colleague: -30, director: -25 },
        voiceBonus: { ambition: 15, goodperson: -15, cautious: -15 }
      }
    ]
  },

  learning_opportunity: {
    id: 'learning_opportunity',
    category: '职场政治',
    title: '🎓 培训机会',
    description: '有一个去{{training_location}}的培训机会，{{training_theme}}，时间{{training_duration}}。',
    difficulty: 'normal',
    timeCost: 1,
    sender: 'director',
    params: {
      training_location: { values: ['北京', '上海', '党校', '省城', '发达地区'] },
      training_theme: { values: ['领导力提升', '业务能力培训', '综合素能培训', '专项技能培训'] },
      training_duration: { values: ['一周', '两周', '一个月', '三个月'] }
    },
    options: [
      {
        text: '主动申请，珍惜学习机会',
        type: 'ambitious',
        effects: { energy: 10, reputation: 15, exp: 35, connections: 10 },
        characterEffects: { director: 15, boss: 10 },
        voiceBonus: { ambition: 15, goodperson: 5, cautious: -5 }
      },
      {
        text: '服从组织安排',
        type: 'balanced',
        effects: { energy: 5, reputation: 8, exp: 25 },
        characterEffects: { director: 8 },
        voiceBonus: { ambition: 0, goodperson: 10, cautious: 5 }
      },
      {
        text: '找借口推辞，不想离开',
        type: 'risky',
        effects: { energy: 0, reputation: -12, exp: 8 },
        characterEffects: { director: -15, boss: -12 },
        voiceBonus: { ambition: -10, goodperson: 5, cautious: 15 }
      }
    ]
  },

  family_work_balance: {
    id: 'family_work_balance',
    category: '人生抉择',
    title: '⚖️ 工作与家庭',
    description: '孩子生病住院，但单位有{{urgent_task}}，领导要求{{requirement}}。',
    difficulty: 'important',
    timeCost: 1,
    sender: 'boss',
    params: {
      urgent_task: { values: ['紧急任务', '重要会议', '上级检查', '材料赶写', '突发事件'] },
      requirement: { values: ['必须到岗', '不能请假', '克服困难', '取消休假', '加班完成'] }
    },
    options: [
      {
        text: '以家庭为重，请假照顾孩子',
        type: 'goodperson',
        effects: { energy: -15, health: -10, reputation: -15, connections: 10, exp: 20 },
        characterEffects: { boss: -15, colleague: 10 },
        voiceBonus: { ambition: -15, goodperson: 20, cautious: 5 }
      },
      {
        text: '请家人帮忙，坚守岗位',
        type: 'balanced',
        effects: { energy: -25, mood: -20, reputation: 12, exp: 35 },
        characterEffects: { boss: 12 },
        voiceBonus: { ambition: 10, goodperson: -5, cautious: 5 }
      },
      {
        text: '抛下家人，全力以赴工作',
        type: 'ambitious',
        effects: { energy: -30, mood: -30, reputation: 18, exp: 45 },
        characterEffects: { boss: 18, director: 12 },
        voiceBonus: { ambition: 20, goodperson: -20, cautious: -15 }
      }
    ]
  },

  boss_criticism: {
    id: 'boss_criticism',
    category: '职场政治',
    title: '😤 领导批评',
    description: '李局长在会议上当众批评了你，说{{criticism_content}}，让你很没面子。',
    difficulty: 'important',
    timeCost: 1,
    sender: 'boss',
    params: {
      criticism_content: { values: ['工作不认真', '态度不端正', '效率太低', '能力不行', '责任心不强'] }
    },
    options: [
      {
        text: '虚心接受，当场表态改进',
        type: 'goodperson',
        effects: { energy: -10, mood: -15, reputation: 12, exp: 25 },
        characterEffects: { boss: 15, director: 8 },
        voiceBonus: { ambition: -10, goodperson: 15, cautious: 10 }
      },
      {
        text: '保持沉默，会后反思',
        type: 'cautious',
        effects: { energy: -5, mood: -10, reputation: 5, exp: 15 },
        characterEffects: { boss: 5 },
        voiceBonus: { ambition: -5, goodperson: 5, cautious: 15 }
      },
      {
        text: '当场辩解，维护自尊',
        type: 'very_risky',
        effects: { energy: -15, mood: -20, reputation: -25, exp: 10 },
        characterEffects: { boss: -28, director: -18 },
        voiceBonus: { ambition: 15, goodperson: -10, cautious: -20 }
      }
    ]
  },

  work_error: {
    id: 'work_error',
    category: '应急处置',
    title: '❌ 工作失误',
    description: '你犯了一个错误，导致{{consequence}}。领导还不知道，但纸包不住火。',
    difficulty: 'urgent',
    timeCost: 1,
    sender: 'director',
    params: {
      consequence: { values: ['材料迟到', '数据出错', '工作延误', '群众投诉', '领导不满'] }
    },
    options: [
      {
        text: '主动承认错误，立即补救',
        type: 'goodperson',
        effects: { energy: -15, reputation: -8, exp: 20 },
        characterEffects: { director: 8, boss: 5 },
        voiceBonus: { ambition: -10, goodperson: 15, cautious: 10 }
      },
      {
        text: '想办法掩盖，不让人知道',
        type: 'risky',
        effects: { energy: -10, reputation: -15, exp: 10 },
        characterEffects: { director: -18 },
        voiceBonus: { ambition: 10, goodperson: -15, cautious: 5 }
      },
      {
        text: '推卸责任给别人',
        type: 'very_risky',
        effects: { energy: -5, reputation: -28, connections: -20, exp: 5 },
        characterEffects: { director: -25, colleague: -25, boss: -20 },
        voiceBonus: { ambition: 15, goodperson: -25, cautious: -10 }
      }
    ]
  },

  interview_chance: {
    id: 'interview_chance',
    category: '职场政治',
    title: '🎤 遴选面试',
    description: '你通过了遴选笔试，现在要进行面试。竞争对手都很强，你有{{confidence}}把握。',
    difficulty: 'important',
    timeCost: 2,
    sender: 'director',
    params: {
      confidence: { values: ['很大', '一般', '没什么', '不确定'] }
    },
    options: [
      {
        text: '认真准备全力以赴',
        type: 'ambitious',
        effects: { energy: -20, mood: -15, reputation: 15, exp: 40 },
        characterEffects: { boss: 15, director: 10 },
        voiceBonus: { ambition: 20, goodperson: 5, cautious: -10 }
      },
      {
        text: '正常准备，顺其自然',
        type: 'balanced',
        effects: { energy: -10, mood: -5, reputation: 5, exp: 25 },
        characterEffects: { director: 5 },
        voiceBonus: { ambition: 5, goodperson: 10, cautious: 5 }
      },
      {
        text: '找人打招呼，走关系',
        type: 'very_risky',
        effects: { energy: -8, reputation: -20, connections: -15, exp: 15 },
        characterEffects: { boss: -18, director: -15 },
        voiceBonus: { ambition: 15, goodperson: -15, cautious: -15 }
      }
    ]
  },

  secret_revelation: {
    id: 'secret_revelation',
    category: '职场政治',
    title: '🤫 秘密发现',
    description: '你无意中发现了{{secret_type}}的秘密。这个秘密如果公开，会{{impact}}。',
    difficulty: 'important',
    timeCost: 1,
    sender: 'director',
    params: {
      secret_type: { values: ['领导贪污', '同事违规', '工作失误', '人际关系', '历史问题'] },
      impact: { values: ['影响很大', '后果严重', '有人会倒霉', '引发动荡'] }
    },
    options: [
      {
        text: '守口如瓶，当作不知道',
        type: 'cautious',
        effects: { energy: -5, reputation: 8, exp: 18 },
        characterEffects: { director: 10 },
        voiceBonus: { ambition: -5, goodperson: 5, cautious: 20 }
      },
      {
        text: '向领导汇报，请示如何处理',
        type: 'balanced',
        effects: { energy: -8, reputation: -5, exp: 15 },
        characterEffects: { director: 5, boss: 5 },
        voiceBonus: { ambition: 5, goodperson: 0, cautious: 10 }
      },
      {
        text: '以此要挟，获取利益',
        type: 'very_risky',
        effects: { energy: 0, reputation: -35, connections: -25, exp: 5 },
        characterEffects: { director: -30, boss: -28 },
        voiceBonus: { ambition: 20, goodperson: -25, cautious: -25 }
      }
    ]
  },

  retirement_choice: {
    id: 'retirement_choice',
    category: '人生抉择',
    title: '🌅 退休选择',
    description: '你工作了一辈子，现在面临退休。有人说：退休后{{advice}}。',
    difficulty: 'important',
    timeCost: 1,
    sender: 'self',
    params: {
      advice: { values: ['可以发挥余热', '要好好享受生活', '不能闲着', '要找点事做'] }
    },
    options: [
      {
        text: '继续关注单位发展，献计献策',
        type: 'goodperson',
        effects: { mood: 20, reputation: 15, connections: 12, exp: 25 },
        characterEffects: { director: 15, colleague: 18 },
        voiceBonus: { ambition: 0, goodperson: 15, cautious: 5 }
      },
      {
        text: '含饴弄孙，享受天伦之乐',
        type: 'balanced',
        effects: { mood: 25, health: 10, exp: 15 },
        characterEffects: {},
        voiceBonus: { ambition: -15, goodperson: 10, cautious: 10 }
      },
      {
        text: '另谋职业，继续奋斗',
        type: 'ambitious',
        effects: { mood: 10, reputation: 8, exp: 20 },
        characterEffects: { boss: 5 },
        voiceBonus: { ambition: 20, goodperson: -5, cautious: -10 }
      }
    ]
  }
};

// 事件难度配置
const EVENT_DIFFICULTY = {
  normal: { 
    riskRate: 0.3, 
    rewardMultiplier: 1.0,
    cooldown: 7
  },
  important: { 
    riskRate: 0.5, 
    rewardMultiplier: 1.3,
    cooldown: 10
  },
  urgent: { 
    riskRate: 0.7, 
    rewardMultiplier: 1.5,
    cooldown: 14
  },
  service: { 
    riskRate: 0.4, 
    rewardMultiplier: 1.2,
    cooldown: 7
  },
  critical: { 
    riskRate: 0.9, 
    rewardMultiplier: 2.0,
    cooldown: 20
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EVENT_DATABASE, EVENT_DIFFICULTY };
}
