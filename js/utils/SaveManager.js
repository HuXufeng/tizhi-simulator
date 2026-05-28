/**
 * 存档管理器 - 体制内模拟器 2.0
 */

class SaveManager {
  constructor() {
    this.saveKey = 'tizhi_simulator_save';
    this.version = '2.0.0';
  }

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

  // 迁移存档
  migrateSave(oldSave) {
    try {
      // 简单迁移：如果版本不匹配，保留核心数据
      const newSave = {
        day: oldSave.day || 1,
        hour: oldSave.hour || 9,
        phase: oldSave.phase || 'probation',
        narrator: oldSave.narrator || 'laozhang',
        
        position: oldSave.position || 0,
        reputation: oldSave.reputation || 50,
        connections: oldSave.connections || 50,
        
        needs: oldSave.needs || {
          energy: 100,
          health: 100,
          mood: 100,
          belonging: 50,
          reputation: 50
        },
        
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
        
        unlocked: oldSave.unlocked || {
          achievements: [],
          endings: [],
          events: [],
          characters: []
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
          version: this.version
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
        version: saveData.meta?.version,
        lastPlayed: saveData.meta?.lastPlayed,
        playTime: saveData.meta?.playTime
      };
    } catch (error) {
      console.error('获取存档信息失败:', error);
      return null;
    }
  }

  // 导出存档
  exportSave() {
    try {
      const saveString = localStorage.getItem(this.saveKey);
      
      if (!saveString) {
        console.log('没有存档可导出');
        return null;
      }
      
      const blob = new Blob([saveString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `tizhi_simulator_save_${Date.now()}.json`;
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
          const saveData = JSON.parse(e.target.result);
          
          // 验证存档格式
          if (!saveData.day || !saveData.needs) {
            throw new Error('存档格式无效');
          }
          
          // 保存
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

  // 自动保存
  autoSave(state, interval = 30000) {
    // 每30秒自动保存一次
    setInterval(() => {
      if (state) {
        this.saveGame(state);
      }
    }, interval);
    
    console.log('⏰ 自动保存已启用');
  }
}

// 全局实例
window.SaveManager = new SaveManager();
