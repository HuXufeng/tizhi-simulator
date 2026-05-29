/**
 * 技能系统 - 体制内模拟器 2.0
 */

class SkillSystem {
  constructor() {
    this.state = null;
    this.skillTrees = null;
  }

  // 初始化
  init(state) {
    console.log('🎯 初始化技能系统...');
    this.state = state;
    this.skillTrees = SKILL_TREES;
  }

  // 获取技能树
  getSkillTree(skillId) {
    return this.skillTrees[skillId];
  }

  // 获取技能等级
  getSkillLevel(skillId) {
    return this.state.skills[skillId]?.level || 1;
  }

  // 获取技能经验
  getSkillExp(skillId) {
    return this.state.skills[skillId]?.exp || 0;
  }

  // 获取升级所需经验
  getExpToNextLevel(skillId) {
    const currentLevel = this.getSkillLevel(skillId);
    const tree = this.skillTrees[skillId];
    
    if (currentLevel >= 4) return Infinity; // 最高级
    
    const nextLevel = tree.levels[currentLevel];
    return nextLevel?.expRequired || Infinity;
  }

  // 检查是否可以升级
  canLevelUp(skillId) {
    const currentExp = this.getSkillExp(skillId);
    const requiredExp = this.getExpToNextLevel(skillId);
    
    return currentExp >= requiredExp;
  }

  // 检查并执行升级
  checkLevelUp() {
    for (const skillId of Object.keys(this.state.skills)) {
      if (this.canLevelUp(skillId)) {
        this.levelUp(skillId);
      }
    }
  }

  // 升级
  levelUp(skillId) {
    const currentLevel = this.getSkillLevel(skillId);
    
    if (currentLevel >= 4) return false; // 已满级
    
    this.state.skills[skillId].level++;
    
    console.log(`⬆️ ${skillId} 升级到 Lv.${this.state.skills[skillId].level}`);
    
    // 触发升级效果
    this.applyLevelUpEffects(skillId);
    
    // 更新 UI
    if (typeof UIManager !== 'undefined') {
      UIManager.updateSkillUI(skillId);
    }
    
    return true;
  }

  // 应用升级效果
  applyLevelUpEffects(skillId) {
    const tree = this.skillTrees[skillId];
    const level = this.getSkillLevel(skillId);
    const levelData = tree.levels[level - 1];
    
    if (levelData.effects) {
      // 应用效果
      console.log(`✨ ${tree.name} Lv.${level} 解锁: ${levelData.name}`);
    }
  }

  // 获取总体效率
  getOverallEfficiency() {
    let totalEfficiency = 0;
    let count = 0;
    
    for (const [skillId, skillData] of Object.entries(this.state.skills)) {
      const tree = this.skillTrees[skillId];
      const level = skillData.level;
      
      if (tree && tree.levels[level - 1]) {
        const effects = tree.levels[level - 1].effects;
        if (effects) {
          // 基础效率 1.0，每级增加 0.1
          totalEfficiency += 1.0 + (level - 1) * 0.1;
          count++;
        }
      }
    }
    
    return count > 0 ? totalEfficiency / count : 1.0;
  }

  // 获取技能效率
  getSkillEfficiency(skillId) {
    const tree = this.skillTrees[skillId];
    const level = this.getSkillLevel(skillId);
    
    if (!tree) return 1.0;
    
    return 1.0 + (level - 1) * 0.1;
  }

  // 获取可用的技能
  getAvailableSkills(skillId) {
    const tree = this.skillTrees[skillId];
    const level = this.getSkillLevel(skillId);
    
    if (!tree) return [];
    
    const currentLevel = tree.levels[level - 1];
    return currentLevel?.skills || [];
  }

  // 检查技能是否解锁
  isSkillUnlocked(skillId, skillName) {
    const level = this.getSkillLevel(skillId);
    const availableSkills = this.getAvailableSkills(skillId);
    
    return availableSkills.some(s => s.name === skillName);
  }

  // 获取技能效果加成
  getSkillBonus(skillId, bonusType) {
    const tree = this.skillTrees[skillId];
    const level = this.getSkillLevel(skillId);
    
    if (!tree || !tree.levels[level - 1]) return 0;
    
    const effects = tree.levels[level - 1].effects;
    return effects?.[bonusType] || 0;
  }

  // 应用选项加成
  applyOptionBonus(skillId, baseEffect) {
    const efficiency = this.getSkillEfficiency(skillId);
    return Math.floor(baseEffect * efficiency);
  }

  // 重置技能点
  respecSkills() {
    // 临时惩罚
    this.state.stats.respecPenalty = true;
    
    console.log('🔄 技能重置');
  }
}

// 全局实例
window.SkillSystem = new SkillSystem();
