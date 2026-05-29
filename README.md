# 🏛️ 体制内模拟器 2.0

> 像素风策略养成游戏 - 在体制内摸爬滚打的人生模拟

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Platform](https://img.shields.io/badge/platform-GitHub%20Pages-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

## 🎮 游戏介绍

一款深度的**像素风策略养成游戏**，模拟真实的体制内工作生活。

### 核心特色

- 🎨 **像素风格** - GBA/DS 经典像素艺术
- 🎯 **深度策略** - 技能树、内心声音、多重选择
- 🤝 **社交模拟** - 复杂的人际关系网络
- 📖 **剧情系统** - 7条剧情线，50+成就
- 🔄 **多周目** - New Game+ 机制，周目加成
- 📱 **移动端优化** - 竖屏设计，单手操作

---

## 🕹️ 游戏特色系统

### 1. 技能系统
- 💼 业务能力
- 🤝 人际社交
- 🛡️ 心理素质
- 🎭 政治智慧
- ✨ 个人魅力

### 2. 内心声音
- 🎯 野心家 - 往上爬！
- 😇 老好人 - 真诚待人
- 🛡️ 谨慎派 - 稳扎稳打

### 3. 事件系统
- 30+ 精选事件
- 多重选择分支
- 难度等级系统
- 冷却机制

### 4. 社交系统
- 5个角色关系网络
- 信任/好感/竞争
- 派系系统

---

## 🚀 快速开始

### 方法一：在线游玩（推荐）

1. 访问 **GitHub Pages 地址**：
   ```
   https://huxufeng.github.io/tizhi-simulator/
   ```

2. 直接在浏览器中打开即可游玩！

### 方法二：本地运行

1. **克隆仓库**
   ```bash
   git clone https://github.com/HuXufeng/tizhi-simulator.git
   ```

2. **进入目录**
   ```bash
   cd tizhi-simulator
   ```

3. **启动本地服务器**（任选一种）

   **Python（推荐）**：
   ```bash
   python -m http.server 8000
   ```

   **Node.js**：
   ```bash
   npx serve .
   ```

   **PHP**：
   ```bash
   php -S localhost:8000
   ```

4. **打开浏览器**
   ```
   http://localhost:8000
   ```

### 方法三：直接打开

直接双击 `index.html` 文件在浏览器中打开即可（部分功能可能受限）

---

## 🛠️ 技术栈

- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **样式**：纯 CSS（响应式设计）
- **存储**：LocalStorage
- **部署**：GitHub Pages

### 无依赖
- ❌ 无需 npm/node_modules
- ❌ 无需构建工具
- ❌ 无需后端服务器
- ✅ 纯静态网站

---

## 📂 项目结构

```
tizhi-simulator/
├── index.html              # 主入口
├── css/
│   ├── pixel-theme.css     # 像素风主题
│   └── mobile-layout.css   # 移动端布局
├── js/
│   ├── core/              # 核心系统
│   │   ├── GameEngine.js
│   │   ├── SkillSystem.js
│   │   ├── InnerVoiceSystem.js
│   │   ├── EventSystem.js
│   │   ├── AchievementSystem.js
│   │   └── StoryChainSystem.js
│   ├── data/              # 数据文件
│   │   ├── events.js
│   │   ├── characters.js
│   │   └── skills.js
│   ├── ui/                # UI组件
│   │   └── UIManager.js
│   └── utils/             # 工具
│       └── SaveManager.js
└── docs/                  # 文档
    └── specs/
```

---

## 🌟 游戏系统

### 🎯 技能树
每种技能有 4 个等级：
- ★★ 基础技能：解锁相关选项
- ☆☆☆ 中级技能：选项效果 +20%
- ✦✦✦✦ 高级技能：解锁特殊剧情

### 🧠 内心声音
三大声音动态影响你的决策：
- 野心家（红色）
- 老好人（蓝色）
- 谨慎派（绿色）

### 📋 事件系统
- 公文处理
- 会议服务
- 紧急事件
- 服务群众
- 人际关系
- 职场政治
- 值班值守

### 🏆 成就系统
50+ 成就等你解锁：
- 技能类
- 关系类
- 进度类
- 特殊类
- 隐藏类

### 📖 剧情链
7条剧情线：
- 试用期转正
- 第一次晋升
- 派系之争
- 原则考验
- 贵人相助
- 职场危机
- 不忘初心（真实结局）

---

## 🎮 如何游玩

### 基本操作
- **点击** - 选择任务/选项
- **滑动** - 切换视图
- **底部导航** - 切换功能页面

### 游戏目标
- 完成工作任务
- 提升技能等级
- 建立人际关系
- 晋升职位
- 解锁成就和结局

### 存档系统
- **自动保存** - 每30秒自动保存
- **手动保存** - 点击保存按钮
- **导入导出** - 支持 JSON 格式

---

## 🔧 开发指南

### 添加新事件
编辑 `js/data/events.js`，添加新的事件对象：

```javascript
new_event: {
  id: 'new_event',
  category: '类别',
  title: '事件标题',
  description: '事件描述',
  difficulty: 'normal',
  timeCost: 2,
  options: [
    {
      text: '选项文本',
      type: 'balanced',
      effects: { energy: -10, reputation: 5, exp: 20 },
      characterEffects: { director: 10 },
      voiceBonus: { ambition: 5, goodperson: 5, cautious: 5 }
    }
  ]
}
```

### 自定义样式
编辑 `css/pixel-theme.css` 修改像素风配色：

```css
:root {
  --pixel-red: #b13e53;
  --pixel-blue: #3b5dc9;
  --pixel-green: #38b764;
  --pixel-yellow: #ffcd75;
}
```

---

## 📱 移动端适配

游戏已针对移动端优化：
- ✅ 竖屏设计
- ✅ 触摸友好
- ✅ 单手操作
- ✅ 安全区域适配

### 测试移动端
1. 打开浏览器开发者工具（F12）
2. 点击手机图标 📱
3. 选择设备（iPhone X, Pixel 2 等）
4. 刷新页面

---

## 🌐 部署到 GitHub Pages

### 自动部署
推送到 `main` 分支后，GitHub Actions 会自动部署！

### 手动部署
1. 进入仓库 Settings
2. 找到 Pages
3. Source 选择 `main` 分支
4. 点击 Save

等待 1-2 分钟即可访问！

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- 游戏灵感来源：体制内真实生活
- 设计参考：《环世界》《极乐迪斯科》《星露谷物语》
- 像素风字体：Press Start 2P (Google Fonts)

---

## 📧 联系

- GitHub: [@HuXufeng](https://github.com/HuXufeng)
- 项目地址: https://github.com/HuXufeng/tizhi-simulator

---

**🎮 祝你游戏愉快！**
