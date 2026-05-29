/**
 * 成就系统 - 体制内模拟器 2.0
 * 增加重玩性和目标感
 */

class AchievementSystem {
  constructor() {
    this.state = null;
    this.achievements = null;
  }

  // 初始化
  init(state) {
    console.log('🏆 初始化成就系统...');
    this.state = state;
    this.achievements = this.getAchievements();
    
    // 初始化已解锁成就
    if (!this.state.unlocked.achievements) {
      this.state.unlocked.achievements = [];
    }
  }

  // 获取所有成就
  getAchievements() {
    return {
      // ==================== 技能类成就 ====================
      skill_master_work: {
        id: 'skill_master_work',
        category: '技能',
        name: '业务精通',
        description: '业务能力达到满级',
        icon: '💼',
        rarity: 'rare',
        condition: (state) => state.skills.work.level >= 4,
        reward: { exp: 500, title: '业务精英' }
      },
      
      skill_master_social: {
        id: 'skill_master_social',
        category: '技能',
        name: '社交达人',
        description: '人际社交达到满级',
        icon: '🤝',
        rarity: 'rare',
        condition: (state) => state.skills.social.level >= 4,
        reward: { exp: 500, title: '人脉王' }
      },
      
      skill_master_psychology: {
        id: 'skill_master_psychology',
        category: '技能',
        name: '心理大师',
        description: '心理素质达到满级',
        icon: '🛡️',
        rarity: 'rare',
        condition: (state) => state.skills.psychology.level >= 4,
        reward: { exp: 500, title: '定海神针' }
      },
      
      skill_master_political: {
        id: 'skill_master_political',
        category: '技能',
        name: '政治智慧',
        description: '政治智慧达到满级',
        icon: '🎭',
        rarity: 'rare',
        condition: (state) => state.skills.political.level >= 4,
        reward: { exp: 500, title: '老谋深算' }
      },
      
      skill_master_charm: {
        id: 'skill_master_charm',
        category: '技能',
        name: '魅力四射',
        description: '个人魅力达到满级',
        icon: '✨',
        rarity: 'rare',
        condition: (state) => state.skills.charm.level >= 4,
        reward: { exp: 500, title: '万人迷' }
      },
      
      all_skills_master: {
        id: 'all_skills_master',
        category: '技能',
        name: '全能选手',
        description: '所有技能达到满级',
        icon: '🏆',
        rarity: 'legendary',
        condition: (state) => {
          return Object.values(state.skills).every(s => s.level >= 4);
        },
        reward: { exp: 2000, title: '六边形战士' }
      },

      // ==================== 人际关系类成就 ====================
      trusted_by_all: {
        id: 'trusted_by_all',
        category: '人际关系',
        name: '众望所归',
        description: '所有角色信任度达到80+',
        icon: '💕',
        rarity: 'rare',
        condition: (state) => {
          return Object.values(state.relationships).every(r => r.trust >= 80);
        },
        reward: { exp: 800, title: '人缘王' }
      },
      
      director_trust_90: {
        id: 'director_trust_90',
        category: '人际关系',
        name: '心腹之臣',
        description: '王主任信任度达到90',
        icon: '👨‍💼',
        rarity: 'epic',
        condition: (state) => state.relationships.director?.trust >= 90,
        reward: { exp: 1000, title: '心腹' }
      },
      
      boss_trust_90: {
        id: 'boss_trust_90',
        category: '人际关系',
        name: '领导赏识',
        description: '李局长信任度达到90',
        icon: '👴',
        rarity: 'epic',
        condition: (state) => state.relationships.boss?.trust >= 90,
        reward: { exp: 1000, title: '大红人' }
      },
      
      friend_maker: {
        id: 'friend_maker',
        category: '人际关系',
        name: '社交蝴蝶',
        description: '累计建立100点人脉',
        icon: '🦋',
        rarity: 'normal',
        condition: (state) => (state.connections || 0) >= 100,
        reward: { exp: 300, title: '社交达人' }
      },

      // ==================== 游戏进度类成就 ====================
      first_week: {
        id: 'first_week',
        category: '进度',
        name: '初来乍到',
        description: '完成第一个7天',
        icon: '📅',
        rarity: 'normal',
        condition: (state) => state.day >= 7,
        reward: { exp: 100 }
      },
      
      first_month: {
        id: 'first_month',
        category: '进度',
        name: '月工作总结',
        description: '完成第一个30天',
        icon: '📆',
        rarity: 'normal',
        condition: (state) => state.day >= 30,
        reward: { exp: 300 }
      },
      
      first_year: {
        id: 'first_year',
        category: '进度',
        name: '年度考核',
        description: '完成第一个365天',
        icon: '🎊',
        rarity: 'rare',
        condition: (state) => state.day >= 365,
        reward: { exp: 1500, title: '老员工' }
      },
      
      five_years: {
        id: 'five_years',
        category: '进度',
        name: '资深员工',
        description: '完成5年（1825天）',
        icon: '🎖️',
        rarity: 'epic',
        condition: (state) => state.day >= 1825,
        reward: { exp: 3000, title: '元老' }
      },

      // ==================== 任务类成就 ====================
      task_master_50: {
        id: 'task_master_50',
        category: '任务',
        name: '勤奋员工',
        description: '累计完成任务50次',
        icon: '📋',
        rarity: 'normal',
        condition: (state) => (state.stats.tasksCompleted || 0) >= 50,
        reward: { exp: 500 }
      },
      
      task_master_100: {
        id: 'task_master_100',
        category: '任务',
        name: '模范员工',
        description: '累计完成任务100次',
        icon: '🏅',
        rarity: 'rare',
        condition: (state) => (state.stats.tasksCompleted || 0) >= 100,
        reward: { exp: 1000 }
      },
      
      task_master_500: {
        id: 'task_master_500',
        category: '任务',
        name: '劳模',
        description: '累计完成任务500次',
        icon: '🥇',
        rarity: 'epic',
        condition: (state) => (state.stats.tasksCompleted || 0) >= 500,
        reward: { exp: 2000, title: '工作狂' }
      },

      // ==================== 声望类成就 ====================
      reputation_50: {
        id: 'reputation_50',
        category: '声望',
        name: '小有名气',
        description: '声望达到50',
        icon: '⭐',
        rarity: 'normal',
        condition: (state) => state.reputation >= 50,
        reward: { exp: 200 }
      },
      
      reputation_80: {
        id: 'reputation_80',
        category: '声望',
        name: '声名鹊起',
        description: '声望达到80',
        icon: '🌟',
        rarity: 'rare',
        condition: (state) => state.reputation >= 80,
        reward: { exp: 600 }
      },
      
      reputation_100: {
        id: 'reputation_100',
        category: '声望',
        name: '名满天下',
        description: '声望达到100',
        icon: '💫',
        rarity: 'epic',
        condition: (state) => state.reputation >= 100,
        reward: { exp: 1500, title: '名人堂' }
      },

      // ==================== 职位晋升类成就 ====================
      promotion_1: {
        id: 'promotion_1',
        category: '晋升',
        name: '初露锋芒',
        description: '完成第一次晋升',
        icon: '📈',
        rarity: 'normal',
        condition: (state) => state.position >= 1,
        reward: { exp: 400, title: '副主任科员' }
      },
      
      promotion_2: {
        id: 'promotion_2',
        category: '晋升',
        name: '步步高升',
        description: '晋升到主任科员',
        icon: '📊',
        rarity: 'rare',
        condition: (state) => state.position >= 2,
        reward: { exp: 800, title: '主任科员' }
      },
      
      promotion_3: {
        id: 'promotion_3',
        category: '晋升',
        name: '科级干部',
        description: '晋升到副科长',
        icon: '🎯',
        rarity: 'rare',
        condition: (state) => state.position >= 3,
        reward: { exp: 1200, title: '副科长' }
      },
      
      promotion_4: {
        id: 'promotion_4',
        category: '晋升',
        name: '中层干部',
        description: '晋升到科长',
        icon: '💼',
        rarity: 'epic',
        condition: (state) => state.position >= 4,
        reward: { exp: 2000, title: '科长' }
      },
      
      promotion_max: {
        id: 'promotion_max',
        category: '晋升',
        name: '青云直上',
        description: '达到最高职位',
        icon: '🚀',
        rarity: 'legendary',
        condition: (state) => state.position >= 7,
        reward: { exp: 5000, title: '一飞冲天' }
      },

      // ==================== 内心声音类成就 ====================
      voice_ambition_dominant: {
        id: 'voice_ambition_dominant',
        category: '内心',
        name: '野心勃勃',
        description: '野心家声音达到80',
        icon: '🎯',
        rarity: 'normal',
        condition: (state) => state.voices.ambition >= 80,
        reward: { exp: 300 }
      },
      
      voice_goodperson_dominant: {
        id: 'voice_goodperson_dominant',
        category: '内心',
        name: '心怀善意',
        description: '老好人声音达到80',
        icon: '😇',
        rarity: 'normal',
        condition: (state) => state.voices.goodperson >= 80,
        reward: { exp: 300 }
      },
      
      voice_cautious_dominant: {
        id: 'voice_cautious_dominant',
        category: '内心',
        name: '小心翼翼',
        description: '谨慎派声音达到80',
        icon: '🛡️',
        rarity: 'normal',
        condition: (state) => state.voices.cautious >= 80,
        reward: { exp: 300 }
      },
      
      voice_balanced: {
        id: 'voice_balanced',
        category: '内心',
        name: '三心二意',
        description: '三个声音都在60-70之间',
        icon: '⚖️',
        rarity: 'rare',
        condition: (state) => {
          const v = state.voices;
          return v.ambition >= 60 && v.ambition <= 70 &&
                 v.goodperson >= 60 && v.goodperson <= 70 &&
                 v.cautious >= 60 && v.cautious <= 70;
        },
        reward: { exp: 800 }
      },

      // ==================== 特殊行为类成就 ====================
      never_mistake_30: {
        id: 'never_mistake_30',
        category: '特殊',
        name: '谨小慎微',
        description: '连续30天无失误',
        icon: '🎖️',
        rarity: 'rare',
        condition: (state) => (state.stats.mistakeCount || 0) === 0 && state.day >= 30,
        reward: { exp: 800 }
      },
      
      never_mistake_100: {
        id: 'never_mistake_100',
        category: '特殊',
        name: '完美主义',
        description: '连续100天无失误',
        icon: '💎',
        rarity: 'epic',
        condition: (state) => (state.stats.mistakeCount || 0) === 0 && state.day >= 100,
        reward: { exp: 2000 }
      },
      
      fish_king: {
        id: 'fish_king',
        category: '特殊',
        name: '摸鱼之王',
        description: '累计摸鱼50天',
        icon: '🐟',
        rarity: 'rare',
        condition: (state) => (state.stats.fishCount || 0) >= 50,
        reward: { exp: 500 }
      },
      
      consecutive_fish_10: {
        id: 'consecutive_fish_10',
        category: '特殊',
        name: '躺平大师',
        description: '连续摸鱼10天',
        icon: '😴',
        rarity: 'rare',
        condition: (state) => (state.stats.consecutiveFish || 0) >= 10,
        reward: { exp: 600 }
      },
      
      health_0_escaped: {
        id: 'health_0_escaped',
        category: '特殊',
        name: '大难不死',
        description: '健康值降到10以下但没死',
        icon: '💪',
        rarity: 'epic',
        condition: (state) => state.needs.health <= 10 && state.needs.health > 0,
        reward: { exp: 1000 }
      },

      // ==================== 结局类成就 ====================
      ending_career_peak: {
        id: 'ending_career_peak',
        category: '结局',
        name: '青云直上',
        description: '达成仕途巅峰结局',
        icon: '🚀',
        rarity: 'epic',
        condition: (state) => state.unlocked.endings?.includes('career_peak'),
        reward: { exp: 3000 }
      },
      
      ending_workaholic: {
        id: 'ending_workaholic',
        category: '结局',
        name: '鞠躬尽瘁',
        description: '达成工作狂结局',
        icon: '💼',
        rarity: 'normal',
        condition: (state) => state.unlocked.endings?.includes('workaholic'),
        reward: { exp: 1000 }
      },
      
      ending_balance: {
        id: 'ending_balance',
        category: '结局',
        name: '人生赢家',
        description: '达成人生平衡结局',
        icon: '⚖️',
        rarity: 'rare',
        condition: (state) => state.unlocked.endings?.includes('balanced'),
        reward: { exp: 2000 }
      },
      
      ending_true: {
        id: 'ending_true',
        category: '结局',
        name: '不忘初心',
        description: '达成真实结局',
        icon: '🌟',
        rarity: 'legendary',
        condition: (state) => state.unlocked.endings?.includes('true_ending'),
        reward: { exp: 5000 }
      },

      // ==================== 隐藏成就类 ====================
      hidden_perfect_run: {
        id: 'hidden_perfect_run',
        category: '隐藏',
        name: '完美通关',
        description: '???',
        icon: '❓',
        rarity: 'secret',
        condition: (state) => {
          return state.day >= 365 && 
                 state.reputation >= 90 &&
                 (state.stats.mistakeCount || 0) === 0;
        },
        reward: { exp: 3000 }
      },
      
      hidden_speedrun: {
        id: 'hidden_speedrun',
        category: '隐藏',
        name: '速通大师',
        description: '???',
        icon: '⚡',
        rarity: 'secret',
        condition: (state) => state.position >= 4 && state.day <= 100,
        reward: { exp: 2500 }
      },
      
      hidden_true_neutral: {
        id: 'hidden_true_neutral',
        category: '隐藏',
        name: '中立之道',
        description: '???',
        icon: '☯️',
        rarity: 'secret',
        condition: (state) => {
          const v = state.voices;
          return Math.abs(v.ambition - v.goodperson) <= 5 &&
                 Math.abs(v.goodperson - v.cautious) <= 5 &&
                 Math.abs(v.ambition - v.cautious) <= 5;
        },
        reward: { exp: 2000 }
      },

      // ==================== 难度成就 ====================
      difficulty_lao_zhang: {
        id: 'difficulty_lao_zhang',
        category: '难度',
        name: '稳扎稳打',
        description: '使用老张模式通关',
        icon: '🐢',
        rarity: 'normal',
        condition: (state) => state.narrator === 'laozhang',
        reward: { exp: 500 }
      },
      
      difficulty_li_jie: {
        id: 'difficulty_li_jie',
        category: '难度',
        name: '跌宕起伏',
        description: '使用李姐模式通关',
        icon: '🎢',
        rarity: 'rare',
        condition: (state) => state.narrator === 'lijie',
        reward: { exp: 1000 }
      },
      
      difficulty_wang_zhu_ren: {
        id: 'difficulty_wang_zhu_ren',
        category: '难度',
        name: '残酷无情',
        description: '使用王主任模式通关',
        icon: '👹',
        rarity: 'epic',
        condition: (state) => state.narrator === 'wangzhuren',
        reward: { exp: 2000 }
      },

      // ==================== 特殊组合成就 ====================
      promotion_5plus: {
        id: 'promotion_5plus',
        category: '特殊',
        name: '破格提拔',
        description: '在100天内晋升5次',
        icon: '🌈',
        rarity: 'legendary',
        condition: (state) => state.position >= 5 && state.day <= 100,
        reward: { exp: 3000 }
      },
      
      exp_10000: {
        id: 'exp_10000',
        category: '特殊',
        name: '经验满满',
        description: '累计获得10000经验',
        icon: '📚',
        rarity: 'rare',
        condition: (state) => (state.stats.exp || 0) >= 10000,
        reward: { exp: 1000 }
      },
      
      exp_50000: {
        id: 'exp_50000',
        category: '特殊',
        name: '学富五车',
        description: '累计获得50000经验',
        icon: '🎓',
        rarity: 'epic',
        condition: (state) => (state.stats.exp || 0) >= 50000,
        reward: { exp: 2000 }
      },

      // ==================== 周目类成就 ====================
      week_2_complete: {
        id: 'week_2_complete',
        category: '周目',
        name: '再接再厉',
        description: '完成第二周目',
        icon: '🔄',
        rarity: 'rare',
        condition: (state) => (state.meta.weekNumber || 1) >= 2,
        reward: { exp: 2000 }
      },
      
      week_3_complete: {
        id: 'week_3_complete',
        category: '周目',
        name: '三生万物',
        description: '完成第三周目',
        icon: '3️⃣',
        rarity: 'epic',
        condition: (state) => (state.meta.weekNumber || 1) >= 3,
        reward: { exp: 3000 }
      },
      
      all_routes_complete: {
        id: 'all_routes_complete',
        category: '周目',
        name: '全知全能',
        description: '完成所有路线',
        icon: '🌈',
        rarity: 'legendary',
        condition: (state) => {
          return state.unlocked.routes?.length >= 4;
        },
        reward: { exp: 5000 }
      }
    };
  }

  // 检查所有成就
  checkAchievements() {
    const newlyUnlocked = [];
    
    for (const [id, achievement] of Object.entries(this.achievements)) {
      // 跳过已解锁
      if (this.state.unlocked.achievements.includes(id)) continue;
      
      // 检查条件
      if (achievement.condition(this.state)) {
        this.unlockAchievement(id);
        newlyUnlocked.push(achievement);
      }
    }
    
    return newlyUnlocked;
  }

  // 解锁成就
  unlockAchievement(id) {
    const achievement = this.achievements[id];
    if (!achievement || this.state.unlocked.achievements.includes(id)) return false;
    
    // 添加到已解锁列表
    this.state.unlocked.achievements.push(id);
    
    // 应用奖励
    if (achievement.reward) {
      if (achievement.reward.exp) {
        this.state.stats.exp = (this.state.stats.exp || 0) + achievement.reward.exp;
      }
      if (achievement.reward.title) {
        this.state.unlocked.titles = this.state.unlocked.titles || [];
        if (!this.state.unlocked.titles.includes(achievement.reward.title)) {
          this.state.unlocked.titles.push(achievement.reward.title);
        }
      }
    }
    
    console.log(`🏆 成就解锁: ${achievement.name} - ${achievement.description}`);
    
    return true;
  }

  // 获取已解锁成就
  getUnlockedAchievements() {
    return this.state.unlocked.achievements.map(id => ({
      ...this.achievements[id],
      unlocked: true
    }));
  }

  // 获取所有成就（带解锁状态）
  getAllAchievementsWithStatus() {
    const result = [];
    
    for (const [id, achievement] of Object.entries(this.achievements)) {
      result.push({
        ...achievement,
        unlocked: this.state.unlocked.achievements.includes(id)
      });
    }
    
    return result;
  }

  // 按分类获取成就
  getAchievementsByCategory(category) {
    return Object.values(this.achievements).filter(a => a.category === category);
  }

  // 获取成就统计
  getStats() {
    const total = Object.keys(this.achievements).length;
    const unlocked = this.state.unlocked.achievements.length;
    const byCategory = {};
    
    for (const [id, achievement] of Object.entries(this.achievements)) {
      if (!byCategory[achievement.category]) {
        byCategory[achievement.category] = { total: 0, unlocked: 0 };
      }
      byCategory[achievement.category].total++;
      if (this.state.unlocked.achievements.includes(id)) {
        byCategory[achievement.category].unlocked++;
      }
    }
    
    return {
      total,
      unlocked,
      percentage: Math.floor((unlocked / total) * 100),
      byCategory
    };
  }

  // 重置成就（用于新周目）
  resetAchievements() {
    // 保留永久解锁的成就
    const permanentAchievements = this.state.unlocked.achievements.filter(id => {
      const achievement = this.achievements[id];
      return achievement?.rarity === 'legendary' || achievement?.rarity === 'secret';
    });
    
    this.state.unlocked.achievements = permanentAchievements;
    console.log('🔄 成就已重置');
  }
}

// 全局实例
window.AchievementSystem = new AchievementSystem();
