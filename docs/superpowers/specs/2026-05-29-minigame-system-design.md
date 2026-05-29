# 体制内模拟器 - 小游戏系统集成设计

**文档版本**: 1.0
**创建日期**: 2026-05-29
**设计者**: AI Assistant
**状态**: 已批准

---

## 1. 项目概述

### 1.1 目标

将已实现的小游戏系统集成到游戏核心循环中，使小游戏成为任务完成的可选环节，通过奖励加成机制鼓励玩家参与，同时保持游戏流畅性。

### 1.2 设计决策

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 集成方式 | 可跳过小游戏（奖励加成） | 玩家可选择是否玩小游戏，跳过获得基础奖励 |
| 奖励机制 | 表现越好加成越高 | 根据小游戏表现动态计算奖励加成 |
| 技能联动 | 技能影响小游戏表现 | 玩家技能等级影响小游戏表现 |

---

## 2. 奖励机制

### 2.1 加成计算

**基础奖励**：玩家选择跳过小游戏时获得的奖励

**加成奖励**：玩家完成小游戏后获得的额外奖励

### 2.2 加成等级表

| 小游戏表现 | 奖励加成 | 说明 |
|------------|----------|------|
| 90% - 100% | +50% | 优秀 |
| 75% - 89% | +35% | 良好 |
| 60% - 74% | +25% | 合格 |
| 0% - 59% | +15% | 完成 |

### 2.3 加成计算公式

```javascript
function calculateBonus(performance) {
    if (performance >= 0.9) return 0.5;
    if (performance >= 0.75) return 0.35;
    if (performance >= 0.6) return 0.25;
    return 0.15;
}

finalReward = baseReward × (1 + bonus);
```

---

## 3. 技能联动

### 3.1 技能加成规则

- 玩家技能等级越高，小游戏表现越好
- 每级技能提供 +5% 的表现加成
- 加成上限为 +25%（5级技能）

### 3.2 任务类型与技能对应

| 任务类型 | 小游戏 | 对应技能 |
|----------|--------|----------|
| 📋 公文处理 | 公文排版 | 文字技能 |
| 👥 会议服务 | 座位安排 | 管理技能 |
| 🔍 调研任务 | 调研路线 | 洞察力 |
| 🍵 社交应酬 | 对话选择 | 社交技能 |
| 📚 学习充电 | 打字测试 | 文字技能 |
| ☕ 休息放松 | 无小游戏 | - |

### 3.3 表现计算公式

```javascript
function calculatePerformance(basePerformance, skillLevel, skillType) {
    // 技能加成
    let skillBonus = 0;
    if (skillLevel >= 1) {
        skillBonus = Math.min(skillLevel * 0.05, 0.25);
    }

    // 应用加成
    const finalPerformance = Math.min(1, basePerformance + skillBonus);

    return finalPerformance;
}
```

---

## 4. 小游戏详细设计

### 4.1 公文排版

**游戏ID**: `document_sort`

**玩法**: 拖拽公文片段到正确位置

**正确答案顺序**:
1. `一、标题`
2. `二、第二部分`
3. `（一）第一段`
4. `1. 要点一`
5. `2. 要点二`
6. `（二）第二段`
7. `附：备注`

**正确答案**: `[1, 6, 5, 2, 3, 4, 7]`

**表现计算**:
```javascript
correctCount = 正确放置的数量
performance = correctCount / 7
```

**技能加成**: 文字技能每级 +5%

---

### 4.2 打字测试

**游戏ID**: `typing_test`

**玩法**: 输入指定的公文文字

**示例文本池**:
- `关于召开年度工作会议的通知`
- `各部门要高度重视本次检查`
- `请于本周五前提交工作总结`
- `经研究决定，现就有关问题通知如下`
- `为进一步加强作风建设`

**表现计算**:
```javascript
correctCount = 正确输入的字符数
wrongCount = 错误输入的字符数
performance = correctCount / (correctCount + wrongCount)
```

**技能加成**: 文字技能每级 +5%

---

### 4.3 座位安排

**游戏ID**: `seat_arrange`

**玩法**: 拖拽参会人员到正确座位

**参会人员**:
| ID | 姓名 | 职位 | 优先级 |
|----|------|------|--------|
| leader1 | 王局长 | 主要领导 | 1 |
| leader2 | 李副市长 | 上级领导 | 2 |
| colleague | 张主任 | 本单位 | 3 |
| guest | 陈总 | 合作方 | 4 |

**正确答案**: 按优先级从左到右排列 `[leader1, leader2, colleague, guest]`

**表现计算**:
```javascript
correctSeats = 正确安排的人数
performance = correctSeats / 4
```

**技能加成**: 管理技能每级 +5%

---

### 4.4 议程排序

**游戏ID**: `agenda_order`

**玩法**: 点击上下按钮调整议程顺序

**正确答案顺序**:
1. 宣布开会
2. 领导致辞
3. 工作汇报
4. 讨论交流
5. 总结发言
6. 宣布散会

**表现计算**:
```javascript
correctItems = 正确位置的议程数
performance = correctItems / 6
```

**技能加成**: 管理技能每级 +5%

---

### 4.5 调研路线

**游戏ID**: `path_finding`

**玩法**: 点击选择最优路线

**选项**:
| 选项 | 描述 | 默认表现 |
|------|------|----------|
| A路线 | 走高速，车程40分钟 | 100% |
| B路线 | 走市区，车程60分钟，可能堵车 | 60% |
| C路线 | 走小路，车程50分钟，路况一般 | 80% |

**特殊规则**: 根据玩家"运气"状态随机决定最优路线

**技能加成**: 洞察力相关技能

---

### 4.6 对话选择

**游戏ID**: `dialogue_choice`

**玩法**: 根据情境选择最佳对话选项

**情境库**:

**情境1**: 领导突然问你对某件事的看法
- `如实回答，坦诚自己的想法` → 90%
- `谦虚地说自己还在学习中` → 70%
- `委婉地先听听别人的意见` → 80%

**情境2**: 同事在背后议论领导
- `及时制止，提醒大家注意` → 60%
- `悄悄离开，不参与讨论` → 90%
- `加入讨论，说几句好话` → 50%

**表现计算**:
```javascript
performance = 所选选项的预设表现值
```

**技能加成**: 社交技能每级 +8%

---

## 5. UI流程

### 5.1 任务执行流程

```
用户选择任务
      ↓
任务开始 → 显示任务描述
      ↓
是否显示小游戏选项？
      ↓
┌───────────────────────────────┐
│  任务类型是否有对应小游戏？    │
│  是 → 显示选项               │
│  否 → 直接完成任务            │
└───────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│            [小游戏选项面板]              │
│                                         │
│  📋 公文处理 - 公文排版小游戏           │
│                                         │
│  [🎮 开始小游戏 +50%加成]              │
│  [⏭️ 跳过，获得基础奖励]               │
└─────────────────────────────────────────┘
      ↓
┌─────────────────┐    ┌─────────────────┐
│   开始小游戏     │    │    跳过小游戏    │
│        ↓        │    │        ↓        │
│  显示小游戏UI   │    │   正常完成任务   │
│        ↓        │    │        ↓        │
│   玩家操作      │    │   +基础奖励     │
│        ↓        │    │                 │
│   完成小游戏    │    └─────────────────┘
│        ↓        │
│   显示结果      │
│        ↓        │
│   完成任务      │
│        ↓        │
│  +奖励×(1+加成) │
└─────────────────┘
```

### 5.2 小游戏结果显示

```javascript
{
    gameId: 'document_sort',
    performance: 0.86,
    bonus: 0.35,
    correctCount: 6,
    totalCount: 7,
    message: '表现不错！奖励 +35%'
}
```

---

## 6. 技术实现

### 6.1 集成点

**主要修改文件**:
- `assets/js/systems/taskSystem.js` - 添加小游戏调用逻辑
- `assets/js/systems/miniGameSystem.js` - 完善小游戏实现
- `assets/js/game.js` - 添加小游戏UI调用

### 6.2 新增事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `minigame:offer` | `{task, games}` | 询问是否开始小游戏 |
| `minigame:start` | `{gameId, taskType}` | 开始指定小游戏 |
| `minigame:completed` | `{gameId, performance, bonus}` | 小游戏完成 |
| `minigame:skip` | `{task}` | 跳过小游戏 |

### 6.3 修改 `taskSystem.completeTask()`

```javascript
completeTask(performance = 1.0) {
    const hasMiniGame = this.canShowMiniGame(this.currentTask);

    if (hasMiniGame && !this.miniGameSkipped) {
        // 显示小游戏选项
        eventBus.emit('minigame:offer', {
            task: this.currentTask,
            games: miniGameSystem.getAvailableGames(this.currentTask.type)
        });
        return null; // 暂停，等待玩家选择
    }

    // 正常完成任务流程
    return this.finishTask(performance);
}
```

### 6.4 修改 `game.executeTask()`

```javascript
executeTask(task) {
    taskSystem.startTask(task);

    // 显示开始描述
    const startDesc = this._getTaskStartDescription(task);
    eventBus.emit('ui:showMessage', { text: startDesc, type: 'system' });

    // 检查是否有小游戏
    const games = miniGameSystem.getAvailableGames(task.type);

    if (games.length > 0) {
        // 显示小游戏选项
        this._showMiniGameOptions(task, games);
    } else {
        // 无小游戏，直接完成
        this._completeTaskWithoutMiniGame(task);
    }
}

_showMiniGameOptions(task, games) {
    const choices = [
        {
            text: `🎮 开始小游戏（有机会获得额外奖励）`,
            callback: () => miniGameSystem.startGame(games[0].id, task.type)
        },
        {
            text: `⏭️ 跳过小游戏（获得基础奖励）`,
            callback: () => this._completeTaskWithoutMiniGame(task)
        }
    ];

    eventBus.emit('ui:showChoices', { choices });
}
```

---

## 7. 预期效果

### 7.1 玩家体验

- ✅ 玩家可自主选择是否挑战小游戏
- ✅ 小游戏表现与技能成长挂钩，有成长感
- ✅ 奖励加成鼓励玩家追求更好表现
- ✅ 不强迫所有玩家参与，保护休闲玩家

### 7.2 数值平衡

- 完成小游戏：最高可获得 +50% 奖励
- 跳过小游戏：仅获得基础奖励
- 技能加成：最高 +25% 表现加成
- 总体奖励差异：最高 2.25 倍

---

## 8. 测试计划

### 8.1 单元测试

- 测试各小游戏表现计算
- 测试奖励加成计算
- 测试技能加成应用

### 8.2 集成测试

- 测试小游戏与任务系统的完整流程
- 测试跳过小游戏的正常流程
- 测试存档和读取

### 8.3 平衡性测试

- 测试不同技能等级下的奖励差异
- 测试小游戏难度是否合适
- 测试整体游戏节奏

---

**文档状态**: 已完成
**下一步**: 进入实现阶段
