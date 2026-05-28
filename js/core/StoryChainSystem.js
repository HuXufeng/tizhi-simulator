/**
 * 剧情事件链系统 - 体制内模拟器 2.0
 * 长线剧情和隐藏结局
 */

class StoryChainSystem {
  constructor() {
    this.state = null;
    this.storyChains = null;
    this.currentProgress = null;
  }

  // 初始化
  init(state) {
    console.log('📖 初始化剧情系统...');
    this.state = state;
    this.storyChains = this.getStoryChains();
    
    // 初始化剧情进度
    if (!this.state.unlocked.storyProgress) {
      this.state.unlocked.storyProgress = {};
    }
    this.currentProgress = this.state.unlocked.storyProgress;
  }

  // 获取所有剧情链
  getStoryChains() {
    return {
      // ==================== 主线剧情：试用期转正 ====================
      trial_period: {
        id: 'trial_period',
        name: '试用期',
        description: '从新人到正式员工的蜕变',
        icon: '📝',
        rarity: 'main',
        
        // 剧情阶段
        stages: [
          {
            stage: 1,
            name: '入职第一天',
            events: ['first_day_jitters', 'office_introduction', 'first_task_confusion'],
            condition: (state) => state.day >= 1,
            result: 'learned_basics'
          },
          {
            stage: 2,
            name: '适应期',
            events: ['work_mistake_1', 'colleague_conflict_1', 'boss_criticism_1'],
            condition: (state) => state.day >= 7,
            result: 'gained_experience'
          },
          {
            stage: 3,
            name: '转正考核',
            events: ['formal_assessment', 'work_summary_review', 'leader_interview'],
            condition: (state) => state.day >= 25,
            result: 'became_official'
          }
        ],
        
        // 完成奖励
        rewards: {
          exp: 2000,
          reputation: 20,
          title: '正式员工',
          unlocks: ['promotion_system', 'faction_system']
        }
      },

      // ==================== 主线剧情：第一次晋升 ====================
      first_promotion: {
        id: 'first_promotion',
        name: '晋升之路',
        description: '从科员到副科长的奋斗',
        icon: '📈',
        rarity: 'main',
        
        stages: [
          {
            stage: 1,
            name: '崭露头角',
            events: ['outstanding_performance', 'leader_praise_2', 'task_master_50'],
            condition: (state) => state.stats.tasksCompleted >= 30 && state.reputation >= 50,
            result: 'got_noticed'
          },
          {
            stage: 2,
            name: '竞争者出现',
            events: ['promotion_competitor', 'faction_recruitment', 'key_decision_1'],
            condition: (state) => state.stats.exp >= 500,
            result: 'faced_competition'
          },
          {
            stage: 3,
            name: '晋升评审',
            events: ['promotion_interview', 'evaluation_meeting', 'final_result'],
            condition: (state) => state.position >= 1,
            result: 'achieved_promotion'
          }
        ],
        
        rewards: {
          exp: 3000,
          reputation: 30,
          connections: 20,
          title: '副科长'
        }
      },

      // ==================== 隐藏剧情：派系之争 ====================
      faction_war: {
        id: 'faction_war',
        name: '派系风云',
        description: '卷入改革派与保守派的斗争',
        icon: '⚔️',
        rarity: 'hidden',
        
        stages: [
          {
            stage: 1,
            name: '暗流涌动',
            events: ['faction_recruitment', 'secret_meeting', 'first_choice'],
            condition: (state) => state.day >= 50 && state.relationships.colleague?.trust >= 60,
            result: 'learned_truth'
          },
          {
            stage: 2,
            name: '立场抉择',
            events: ['faction_choice_2', 'loyalty_test', 'stake_raised'],
            condition: (state) => state.hiddenStats.factionStanding?.reformists >= 20 || 
                               state.hiddenStats.factionStanding?.conservatives >= 20,
            result: 'made_stand'
          },
          {
            stage: 3,
            name: '派系对决',
            events: ['faction_conflict', 'betrayal_possible', 'final_showdown'],
            condition: (state) => state.position >= 2,
            result: 'faction_winner'
          }
        ],
        
        rewards: {
          exp: 4000,
          politicalCapital: 50,
          unlocks: ['hidden_ending_possible']
        }
      },

      // ==================== 隐藏剧情：原则考验 ====================
      principle_test: {
        id: 'principle_test',
        name: '原则抉择',
        description: '在利益与原则之间的挣扎',
        icon: '⚖️',
        rarity: 'hidden',
        
        stages: [
          {
            stage: 1,
            name: '灰色地带',
            events: ['sticky_situation_2', 'temptation_1', 'principle_decision_1'],
            condition: (state) => state.hiddenStats.principles >= 40,
            result: 'faced_temptation'
          },
          {
            stage: 2,
            name: '内心挣扎',
            events: ['inner_voice_conflict', 'moral_dilemma', 'family_vs_work'],
            condition: (state) => state.needs.mood <= 50,
            result: 'inner_conflict'
          },
          {
            stage: 3,
            name: '最终选择',
            events: ['final_principle_choice', 'consequences_reveal', 'ending_path'],
            condition: (state) => state.day >= 100,
            result: 'principle_path'
          }
        ],
        
        rewards: {
          exp: 3500,
          unlocks: ['true_ending_path', 'principle_master_title']
        }
      },

      // ==================== 隐藏剧情：贵人相助 ====================
      noble_encounter: {
        id: 'noble_encounter',
        name: '贵人运',
        description: '神秘人物的赏识',
        icon: '🌟',
        rarity: 'hidden',
        
        stages: [
          {
            stage: 1,
            name: '慧眼识珠',
            events: ['secret_admired', 'special_task', 'unusual_praise'],
            condition: (state) => state.reputation >= 70 && state.skills.work.level >= 3,
            result: 'caught_attention'
          },
          {
            stage: 2,
            name: '特别培养',
            events: ['special_guidance', 'hidden_knowledge', 'opportunity_granted'],
            condition: (state) => state.relationships.director?.trust >= 80,
            result: 'received_training'
          },
          {
            stage: 3,
            name: '青云直上',
            events: ['breakthrough_opportunity', 'career_leap', 'new_horizon'],
            condition: (state) => state.position >= 3,
            result: 'achieved_greatness'
          }
        ],
        
        rewards: {
          exp: 5000,
          reputation: 50,
          connections: 30,
          title: '青云之子'
        }
      },

      // ==================== 隐藏剧情：职场危机 ====================
      crisis_survival: {
        id: 'crisis_survival',
        name: '危机四伏',
        description: '面临职业生涯的重大危机',
        icon: '⚠️',
        rarity: 'hidden',
        
        stages: [
          {
            stage: 1,
            name: '危机萌芽',
            events: ['mistake_discovery', 'rumor_spread', 'trust_shaken'],
            condition: (state) => state.stats.mistakeCount >= 2,
            result: 'crisis_emerged'
          },
          {
            stage: 2,
            name: '四面楚歌',
            events: ['allies_abandoned', 'leader_dissatisfied', 'colleagues_turn'],
            condition: (state) => state.needs.reputation <= 30,
            result: 'dire_situation'
          },
          {
            stage: 3,
            name: '绝地反击',
            events: ['last_chance', 'prove_innocence', 'comeback_possible'],
            condition: (state) => state.needs.health <= 20,
            result: 'survived_crisis'
          }
        ],
        
        rewards: {
          exp: 4000,
          unlocks: ['comeback_master_title', 'crisis_immunity']
        }
      },

      // ==================== 结局剧情：摸鱼之王 ====================
      fish_king_story: {
        id: 'fish_king_story',
        name: '摸鱼之道',
        description: '成为传说中的摸鱼大师',
        icon: '🐟',
        rarity: 'hidden',
        
        stages: [
          {
            stage: 1,
            name: '初尝摸鱼',
            events: ['first_fish_day', 'work_handoff', 'discovered_tip'],
            condition: (state) => state.stats.fishCount >= 3,
            result: 'learned_secret'
          },
          {
            stage: 2,
            name: '摸鱼技巧',
            events: ['efficiency_tips', 'delegation_master', 'time_management'],
            condition: (state) => state.stats.consecutiveFish >= 5,
            result: 'became_skilled'
          },
          {
            stage: 3,
            name: '摸鱼哲学',
            events: ['fish_philosophy', 'balance_master', 'enlightenment'],
            condition: (state) => state.stats.fishCount >= 20,
            result: 'fish_enlightened'
          }
        ],
        
        rewards: {
          exp: 2000,
          mood: 50,
          unlocks: ['fish_king_ending', 'work_life_balance']
        }
      },

      // ==================== 结局剧情：真实结局 ====================
      true_ending_story: {
        id: 'true_ending_story',
        name: '不忘初心',
        description: '找回最初的自己',
        icon: '🌟',
        rarity: 'legendary',
        
        stages: [
          {
            stage: 1,
            name: '回首往事',
            events: ['past_memory', 'original_goal', 'reflection_moment'],
            condition: (state) => state.day >= 200 && state.position >= 3,
            result: 'self_discovery'
          },
          {
            stage: 2,
            name: '艰难抉择',
            events: ['final_crossroads', 'all_paths_reviewed', 'true_choice_made'],
            condition: (state) => {
              return Object.keys(state.unlocked.endings || {}).length >= 3;
            },
            result: 'enlightenment'
          },
          {
            stage: 3,
            name: '方得始终',
            events: ['final_journey', 'truth_revealed', 'ending_determined'],
            condition: (state) => {
              const v = state.voices;
              return Math.abs(v.ambition - v.goodperson) <= 10 &&
                     Math.abs(v.goodperson - v.cautious) <= 10;
            },
            result: 'true_ending_achieved'
          }
        ],
        
        rewards: {
          exp: 8000,
          title: '不忘初心',
          unlocks: ['true_ending_unlock', 'all_secrets_revealed']
        }
      }
    };
  }

  // 检查剧情触发
  checkStoryTriggers() {
    const newlyTriggered = [];
    
    for (const [chainId, chain] of Object.entries(this.storyChains)) {
      // 跳过已完成的剧情
      if (this.currentProgress[chainId]?.completed) continue;
      
      // 检查是否已解锁
      if (!this.isChainUnlocked(chainId)) continue;
      
      // 检查当前阶段
      const currentStage = this.getCurrentStage(chainId);
      if (currentStage === null) continue;
      
      // 检查阶段条件
      const stageData = chain.stages[currentStage];
      if (stageData && stageData.condition(this.state)) {
        this.triggerStage(chainId, currentStage);
        newlyTriggered.push({
          chainId,
          stage: currentStage,
          name: stageData.name
        });
      }
    }
    
    return newlyTriggered;
  }

  // 检查剧情是否解锁
  isChainUnlocked(chainId) {
    const chain = this.storyChains[chainId];
    if (!chain) return false;
    
    // 主线剧情默认解锁
    if (chain.rarity === 'main') return true;
    
    // 隐藏剧情需要特定条件
    switch (chainId) {
      case 'faction_war':
        return this.state.relationships.colleague?.trust >= 50;
      case 'principle_test':
        return this.state.hiddenStats.principles >= 30;
      case 'noble_encounter':
        return this.state.reputation >= 60;
      case 'crisis_survival':
        return this.state.stats.mistakeCount >= 1;
      case 'fish_king_story':
        return this.state.stats.fishCount >= 1;
      case 'true_ending_story':
        return Object.keys(this.state.unlocked.endings || {}).length >= 2;
      default:
        return false;
    }
  }

  // 获取当前阶段
  getCurrentStage(chainId) {
    const progress = this.currentProgress[chainId];
    const chain = this.storyChains[chainId];
    
    if (!progress || progress.completed) return null;
    
    const currentStage = progress.currentStage || 0;
    if (currentStage >= chain.stages.length) return null;
    
    return currentStage;
  }

  // 触发阶段
  triggerStage(chainId, stageIndex) {
    const chain = this.storyChains[chainId];
    const stage = chain.stages[stageIndex];
    
    // 更新进度
    if (!this.currentProgress[chainId]) {
      this.currentProgress[chainId] = {};
    }
    this.currentProgress[chainId].currentStage = stageIndex;
    this.currentProgress[chainId][stage.result] = true;
    
    // 检查是否完成
    if (stageIndex >= chain.stages.length - 1) {
      this.completeChain(chainId);
    } else {
      this.currentProgress[chainId].currentStage = stageIndex + 1;
    }
    
    console.log(`📖 剧情触发: ${chain.name} - ${stage.name}`);
    
    return stage;
  }

  // 完成剧情链
  completeChain(chainId) {
    const chain = this.storyChains[chainId];
    
    this.currentProgress[chainId].completed = true;
    
    // 应用奖励
    if (chain.rewards) {
      if (chain.rewards.exp) {
        this.state.stats.exp = (this.state.stats.exp || 0) + chain.rewards.exp;
      }
      if (chain.rewards.reputation) {
        this.state.reputation = Math.min(100, this.state.reputation + chain.rewards.reputation);
      }
      if (chain.rewards.connections) {
        this.state.connections = Math.min(100, this.state.connections + chain.rewards.connections);
      }
      if (chain.rewards.unlocks) {
        this.state.unlocked.unlocks = this.state.unlocked.unlocks || [];
        chain.rewards.unlocks.forEach(unlock => {
          if (!this.state.unlocked.unlocks.includes(unlock)) {
            this.state.unlocked.unlocks.push(unlock);
          }
        });
      }
    }
    
    console.log(`✅ 剧情完成: ${chain.name}`);
  }

  // 获取剧情进度
  getProgress(chainId) {
    return this.currentProgress[chainId] || { currentStage: 0, completed: false };
  }

  // 获取所有剧情进度
  getAllProgress() {
    const result = {};
    
    for (const chainId of Object.keys(this.storyChains)) {
      result[chainId] = {
        unlocked: this.isChainUnlocked(chainId),
        ...this.getProgress(chainId),
        ...this.storyChains[chainId]
      };
    }
    
    return result;
  }

  // 获取可触发的剧情
  getAvailableStories() {
    const available = [];
    
    for (const [chainId, chain] of Object.entries(this.storyChains)) {
      if (!this.isChainUnlocked(chainId)) continue;
      
      const progress = this.getProgress(chainId);
      if (progress.completed) continue;
      
      const currentStage = this.getCurrentStage(chainId);
      if (currentStage === null) continue;
      
      available.push({
        chainId,
        name: chain.name,
        description: chain.description,
        icon: chain.icon,
        rarity: chain.rarity,
        stage: currentStage + 1,
        totalStages: chain.stages.length
      });
    }
    
    return available;
  }

  // 重置剧情进度
  resetStoryProgress() {
    // 保留已完成的结局
    const completedEndings = {};
    for (const [chainId, progress] of Object.entries(this.currentProgress)) {
      if (progress.completed && this.storyChains[chainId]?.rarity === 'legendary') {
        completedEndings[chainId] = progress;
      }
    }
    
    this.state.unlocked.storyProgress = completedEndings;
    console.log('🔄 剧情进度已重置');
  }
}

// 全局实例
window.StoryChainSystem = new StoryChainSystem();
