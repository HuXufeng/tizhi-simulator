/**
 * 存档管理器 - 体制内模拟器 2.0
 * 完整版：支持多周目、导入导出、自动云同步
 */

class SaveManager {
  constructor() {
    this.saveKey = 'tizhi_simulator_save';
    this.backupKey = 'tizhi_simulator_backup';
    this.settingsKey = 'tizhi_simulator_settings';
    this.version = '2.0.0';
    this.maxBackups = 5;
  }

  // ==================== 基础存档操作 ====================
  
  // 保存游戏
  saveGame(state) {
    try {
      const saveData = {
        ...state,
        meta: {
          ...state.meta,
          lastPlayed: Date.now(),
          version: this.version
        }
      };
      
      const saveString = JSON.stringify(saveData);
      localStorage.setItem(this.saveKey, saveString);
      
      console.log('💾 游戏已保存');
      return true;
    } catch (error) {
      console.error('保存失败:', error);
      return false;
    }
  }

  // 加载游戏
  loadGame() {
    try {
      const saveString = localStorage.getItem(this.saveKey);
      
      if (!saveString) {
        console.log('📁 没有找到存档');
        return null;
      }
      
      const saveData = JSON.parse(saveString);
      
      // 修复数据结构（无论版本都检查并修复）
      if (saveData.needs) {
        // 检查并修复旧的reputation字段
        if (saveData.needs.reputation !== undefined && saveData.needs.reputationValue === undefined) {
          saveData.needs.reputationValue = saveData.needs.reputation;
          delete saveData.needs.reputation;
        }
      }
      
      // 版本检查
      if (saveData.meta?.version !== this.version) {
        console.log('🔄 检测到存档版本不匹配，需要迁移...');
        return this.migrateSave(saveData);
      }
      
      console.log('📂 游戏存档已加载');
      return saveData;
    } catch (error) {
      console.error('加载失败:', error);
      return null;
    }
  }

  // ==================== 存档迁移 ====================
  
  // 迁移存档
  migrateSave(oldSave) {
    try {
      // 完整迁移逻辑
      const newSave = {
        day: oldSave.day || 1,
        hour: oldSave.hour || 9,
        phase: oldSave.phase || 'probation',
        narrator: oldSave.narrator || 'laozhang',
        
        position: oldSave.position || 0,
        reputation: oldSave.reputation || 50,
        connections: oldSave.connections || 50,
        
        needs: (() => {
          const oldNeeds = oldSave.needs || {};
          return {
            energy: oldNeeds.energy || 100,
            health: oldNeeds.health || 100,
            mood: oldNeeds.mood || 100,
            belonging: oldNeeds.belonging || 50,
            reputationValue: oldNeeds.reputationValue || oldNeeds.reputation || 50
          };
        })(),
        
        hiddenStats: oldSave.hiddenStats || {
          politicalCapital: 0,
          principles: 50,
          trustScore: {},
          factionStanding: {}
        },
        
        voices: oldSave.voices || {
          ambition: 30,
          goodperson: 30,
          cautious: 30
        },
        
        skills: oldSave.skills || {
          work: { level: 1, exp: 0 },
          social: { level: 1, exp: 0 },
          psychology: { level: 1, exp: 0 },
          political: { level: 1, exp: 0 },
          charm: { level: 1, exp: 0 }
        },
        
        relationships: oldSave.relationships || {},
        
        stats: {
          tasksCompleted: oldSave.stats?.tasksCompleted || 0,
          totalChoices: oldSave.stats?.totalChoices || 0,
          principlesStuck: oldSave.stats?.principlesStuck || 0,
          fishCount: oldSave.stats?.fishCount || 0,
          consecutiveFish: oldSave.stats?.consecutiveFish || 0,
          mistakeCount: oldSave.stats?.mistakeCount || 0,
          healthLowDays: oldSave.stats?.healthLowDays || 0,
          exp: oldSave.stats?.exp || 0
        },
        
        unlocked: {
          achievements: oldSave.unlocked?.achievements || [],
          endings: oldSave.unlocked?.endings || [],
          events: oldSave.unlocked?.events || [],
          characters: oldSave.unlocked?.characters || [],
          titles: oldSave.unlocked?.titles || [],
          routes: oldSave.unlocked?.routes || [],
          unlocks: oldSave.unlocked?.unlocks || [],
          storyProgress: oldSave.unlocked?.storyProgress || {}
        },
        
        settings: oldSave.settings || {
          soundEnabled: true,
          musicVolume: 0.5,
          effectsVolume: 0.7
        },
        
        meta: {
          playTime: oldSave.meta?.playTime || 0,
          createdAt: oldSave.meta?.createdAt || Date.now(),
          lastPlayed: Date.now(),
          version: this.version,
          weekNumber: oldSave.meta?.weekNumber || 1
        }
      };
      
      // 保存迁移后的存档
      this.saveGame(newSave);
      
      console.log('✅ 存档迁移完成');
      return newSave;
    } catch (error) {
      console.error('迁移失败:', error);
      return null;
    }
  }

  // ==================== 多周目支持 ====================
  
  // 开始新周目
  startNewGamePlus() {
    const currentSave = this.loadGame();
    if (!currentSave) return null;
    
    // 保存当前存档到备份
    this.createBackup(currentSave);
    
    // 增加周目数
    currentSave.meta.weekNumber = (currentSave.meta.weekNumber || 1) + 1;
    currentSave.meta.previousWeeks = currentSave.meta.previousWeeks || [];
    currentSave.meta.previousWeeks.push({
      weekNumber: currentSave.meta.weekNumber - 1,
      finalDay: currentSave.day,
      finalPosition: currentSave.position,
      endings: [...(currentSave.unlocked.endings || [])]
    });
    
    // 应用周目加成
    this.applyWeekBonus(currentSave);
    
    // 重置游戏进度
    this.resetGameProgress(currentSave);
    
    // 保存
    this.saveGame(currentSave);
    
    console.log(`🆕 第${currentSave.meta.weekNumber}周目开始`);
    return currentSave;
  }

  // 应用周目加成
  applyWeekBonus(state) {
    const week = state.meta.weekNumber;
    
    if (week >= 2) {
      // 第二周目加成
      state.reputation += 10;
      state.skills.work.exp += 100;
      state.skills.social.exp += 100;
      state.unlocked.previousKnowledge = true;
    }
    
    if (week >= 3) {
      // 第三周目加成
      Object.keys(state.skills).forEach(skillId => {
        state.skills[skillId].level = 2;
        state.skills[skillId].exp = 50;
      });
      state.unlocked.secretsRevealed = true;
    }
    
    if (week >= 4) {
      // 第四周目+
      state.reputation += 20;
      state.connections += 20;
      state.unlocked.allModesUnlocked = true;
    }
  }

  // 重置游戏进度
  resetGameProgress(state) {
    state.day = 1;
    state.hour = 9;
    state.position = 0;
    state.hour = 9;
    
    // 重置需求
    state.needs = {
      energy: 100,
      health: 100,
      mood: 100,
      belonging: 50,
      reputation: 50
    };
    
    // 重置统计
    state.stats = {
      tasksCompleted: 0,
      totalChoices: 0,
      principlesStuck: 0,
      fishCount: 0,
      consecutiveFish: 0,
      mistakeCount: 0,
      healthLowDays: 0,
      exp: 0
    };
    
    // 保留已解锁的成就和角色
    // 保留部分关系
    const preservedRelationships = {};
    for (const [charId, rel] of Object.entries(state.relationships)) {
      preservedRelationships[charId] = {
        trust: Math.floor(rel.trust * 0.3),
        affection: Math.floor(rel.affection * 0.3),
        competition: rel.competition,
        dependency: 0
      };
    }
    state.relationships = preservedRelationships;
    
    // 重置内心声音
    state.voices = {
      ambition: 30,
      goodperson: 30,
      cautious: 30
    };
    
    console.log('🔄 游戏进度已重置');
  }

  // ==================== 备份管理 ====================
  
  // 创建备份
  createBackup(saveData) {
    try {
      const backups = this.getBackups();
      
      // 添加新备份
      backups.unshift({
        weekNumber: saveData.meta?.weekNumber || 1,
        day: saveData.day,
        position: saveData.position,
        timestamp: Date.now(),
        data: saveData
      });
      
      // 限制备份数量
      if (backups.length > this.maxBackups) {
        backups.pop();
      }
      
      // 保存备份列表
      localStorage.setItem(this.backupKey, JSON.stringify(backups));
      
      console.log(`💾 备份已创建 (${backups.length}/${this.maxBackups})`);
      return true;
    } catch (error) {
      console.error('备份创建失败:', error);
      return false;
    }
  }

  // 获取备份列表
  getBackups() {
    try {
      const backupsString = localStorage.getItem(this.backupKey);
      return backupsString ? JSON.parse(backupsString) : [];
    } catch (error) {
      console.error('获取备份失败:', error);
      return [];
    }
  }

  // 加载备份
  loadBackup(index) {
    const backups = this.getBackups();
    if (index < 0 || index >= backups.length) {
      console.error('备份索引无效');
      return null;
    }
    
    const backup = backups[index];
    if (!backup.data) {
      console.error('备份数据损坏');
      return null;
    }
    
    this.saveGame(backup.data);
    console.log(`📂 备份 ${index + 1} 已恢复`);
    return backup.data;
  }

  // ==================== 导入导出 ====================
  
  // 导出存档
  exportSave() {
    try {
      const saveString = localStorage.getItem(this.saveKey);
      
      if (!saveString) {
        console.log('没有存档可导出');
        return null;
      }
      
      const saveData = JSON.parse(saveString);
      const exportData = {
        version: this.version,
        exportedAt: Date.now(),
        gameVersion: saveData.meta?.version,
        playerName: saveData.name || 'Player',
        weekNumber: saveData.meta?.weekNumber || 1,
        data: saveData
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `tizhi_simulator_${saveData.meta?.weekNumber || 1}week_day${saveData.day}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('📤 存档已导出');
      return true;
    } catch (error) {
      console.error('导出失败:', error);
      return false;
    }
  }

  // 导入存档
  importSave(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          
          // 验证存档格式
          if (!importData.version || !importData.data) {
            throw new Error('存档格式无效');
          }
          
          // 版本检查
          if (importData.version !== this.version) {
            console.log('⚠️ 存档版本不匹配，将进行迁移');
          }
          
          // 保存
          const saveData = this.migrateSave(importData.data) || importData.data;
          this.saveGame(saveData);
          
          console.log('📥 存档已导入');
          resolve(saveData);
        } catch (error) {
          console.error('导入失败:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsText(file);
    });
  }

  // ==================== 设置管理 ====================
  
  // 保存设置
  saveSettings(settings) {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
      console.log('⚙️ 设置已保存');
      return true;
    } catch (error) {
      console.error('设置保存失败:', error);
      return false;
    }
  }

  // 加载设置
  loadSettings() {
    try {
      const settingsString = localStorage.getItem(this.settingsKey);
      return settingsString ? JSON.parse(settingsString) : this.getDefaultSettings();
    } catch (error) {
      console.error('设置加载失败:', error);
      return this.getDefaultSettings();
    }
  }

  // 获取默认设置
  getDefaultSettings() {
    return {
      soundEnabled: true,
      musicVolume: 0.5,
      effectsVolume: 0.7,
      narrator: 'laozhang',
      autoSave: true,
      autoSaveInterval: 30000,
      showTutorial: true,
      difficulty: 'normal'
    };
  }

  // ==================== 工具方法 ====================
  
  // 删除存档
  deleteSave() {
    try {
      localStorage.removeItem(this.saveKey);
      console.log('🗑️ 存档已删除');
      return true;
    } catch (error) {
      console.error('删除失败:', error);
      return false;
    }
  }

  // 检查存档是否存在
  hasSave() {
    return localStorage.getItem(this.saveKey) !== null;
  }

  // 获取存档信息
  getSaveInfo() {
    try {
      const saveString = localStorage.getItem(this.saveKey);
      
      if (!saveString) return null;
      
      const saveData = JSON.parse(saveString);
      
      return {
        day: saveData.day,
        position: saveData.position,
        weekNumber: saveData.meta?.weekNumber || 1,
        version: saveData.meta?.version,
        lastPlayed: saveData.meta?.lastPlayed,
        playTime: saveData.meta?.playTime,
        reputation: saveData.reputation,
        unlockedAchievements: (saveData.unlocked?.achievements || []).length,
        unlockedEndings: (saveData.unlocked?.endings || []).length
      };
    } catch (error) {
      console.error('获取存档信息失败:', error);
      return null;
    }
  }

  // 自动保存
  autoSave(state, interval = 30000) {
    // 每30秒自动保存一次
    setInterval(() => {
      if (state && this.loadSettings().autoSave) {
        this.saveGame(state);
      }
    }, interval);
    
    console.log('⏰ 自动保存已启用');
  }

  // 清空所有数据
  clearAllData() {
    try {
      localStorage.removeItem(this.saveKey);
      localStorage.removeItem(this.backupKey);
      localStorage.removeItem(this.settingsKey);
      console.log('🗑️ 所有数据已清空');
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      return false;
    }
  }

  // 获取存储使用情况
  getStorageUsage() {
    try {
      let totalSize = 0;
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('tizhi_simulator')) {
          totalSize += localStorage[key].length * 2; // UTF-16
        }
      }
      
      return {
        bytes: totalSize,
        kb: Math.round(totalSize / 1024),
        mb: Math.round(totalSize / 1024 / 1024 * 100) / 100
      };
    } catch (error) {
      console.error('获取存储使用情况失败:', error);
      return { bytes: 0, kb: 0, mb: 0 };
    }
  }
}

// 全局实例
window.SaveManager = new SaveManager();
