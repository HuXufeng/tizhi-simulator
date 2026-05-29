# 🏛️ 体制内模拟器

> 像素风策略养成游戏 - 在体制内摸爬滚打的人生模拟

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-GitHub%20Pages-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

## 🎮 游戏介绍

一款深度的**像素风策略养成游戏**，模拟真实的体制内工作生活。采用模块化架构，纯前端技术栈（HTML5+CSS3+Vanilla JS+Canvas），无外部依赖。

### 核心特色

- 🎨 **像素风格** - GBA/DS 经典像素艺术
- 🎯 **深度策略** - 技能系统、任务系统、多重选择
- 🤝 **社交模拟** - 复杂的人际关系网络
- 📖 **剧情系统** - 多结局、成就系统
- 🔄 **多周目** - New Game+ 机制
- 📱 **移动端优化** - 竖屏设计，单手操作
- 🎵 **音效系统** - 沉浸式体验

---

## 🕹️ 游戏特色系统

### 1. 技能系统
- 💼 业务能力
- 🤝 人际社交
- 🛡️ 心理素质
- 🎭 政治智慧
- ✨ 个人魅力

### 2. 任务系统
- 公文处理
- 会议服务
- 紧急事件
- 服务群众
- 人际关系
- 职场政治
- 值班值守

### 3. 角色系统
- 5个主要角色关系网络
- 信任/好感/竞争
- 派系系统

### 4. 成就与结局
- 50+ 成就等你解锁
- 多结局系统
- New Game+ 周目加成

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
- **架构**：模块化设计，事件总线解耦
- **存储**：LocalStorage
- **部署**：GitHub Pages + Vercel

### 无依赖
- ❌ 无需 npm/node_modules
- ❌ 无需构建工具
- ❌ 无需后端服务器
- ✅ 纯静态网站

---

## 📂 项目结构

```
tizhi-simulator/
├── index.html                    # 主入口
├── assets/                       # 资源文件
│   ├── css/                      # 样式
│   │   ├── main.css
│   │   ├── pixel-fonts.css
│   │   └── modules/pixel-components.css
│   ├── js/                       # JavaScript 模块
│   │   ├── core/                 # 核心系统
│   │   │   ├── eventBus.js       # 事件总线
│   │   │   ├── gameState.js      # 游戏状态
│   │   │   ├── saveSystem.js     # 存档系统
│   │   │   └── timeSystem.js     # 时间系统
│   │   ├── systems/              # 游戏系统
│   │   │   ├── achievementSystem.js
│   │   │   ├── audioSystem.js
│   │   │   ├── canvasSystem.js
│   │   │   ├── cardSystem.js
│   │   │   ├── characterSystem.js
│   │   │   ├── economySystem.js
│   │   │   ├── endingSystem.js
│   │   │   ├── eventSystem.js
│   │   │   ├── miniGameSystem.js
│   │   │   ├── narratorSystem.js
│   │   │   ├── needsSystem.js
│   │   │   ├── newGamePlusSystem.js
│   │   │   ├── pixelSceneRenderer.js
│   │   │   ├── sceneCardRenderer.js
│   │   │   ├── skillSystem.js
│   │   │   └── taskSystem.js
│   │   └── ui/                   # UI 组件
│   │       ├── dialogueUI.js
│   │       ├── mainUI.js
│   │       └── skillTreeUI.js
│   ├── images/                   # 图片资源
│   │   ├── bg/                   # 背景
│   │   ├── characters/           # 角色
│   │   └── ui/                   # UI 元素
│   └── sounds/                   # 音效
├── css/                          # 全局样式
│   ├── pixel-theme.css           # 像素风主题
│   └── mobile-layout.css         # 移动端布局
├── js/                           # 旧版 JS（兼容）
│   ├── core/                     # 核心模块
│   ├── data/                     # 数据文件
│   ├── ui/                       # UI 模块
│   └── utils/                    # 工具函数
├── docs/                         # 文档
│   └── superpowers/specs/        # 系统设计文档
├── 2026-05-28-tizhi-simulator-redesign.md  # 重构文档
├── 开发计划.md                   # 开发计划
└── README.md                     # 本文件
```

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

### 模块化架构
项目采用事件总线（Event Bus）解耦各系统，所有模块通过事件通信：

```javascript
// 发布事件
eventBus.publish('task.completed', { taskId: 'doc_001', exp: 50 });

// 订阅事件
eventBus.subscribe('task.completed', (data) => {
  console.log('任务完成:', data);
});
```

### 添加新系统
1. 在 `assets/js/systems/` 创建新系统文件
2. 实现系统逻辑
3. 通过事件总线与其他系统通信
4. 在 `assets/js/game.js` 中初始化

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
- ✅ 圆形悬浮按钮（摸鱼按钮）

### 移动端布局
- 卡片流布局
- 消息按时间倒序排列（最新在最上）
- 始终悬浮的圆形操作按钮

### 测试移动端
1. 打开浏览器开发者工具（F12）
2. 点击手机图标 📱
3. 选择设备（iPhone X, Pixel 2 等）
4. 刷新页面

---

## 🌐 部署

### GitHub Pages
推送到 `main` 分支后，GitHub Pages 会自动部署：
1. 进入仓库 Settings → Pages
2. Source 选择 `main` 分支
3. 点击 Save

### Vercel
1. 登录 Vercel
2. 导入 GitHub 仓库
3. 自动检测为静态网站
4. 一键部署

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
- 在线游玩: https://huxufeng.github.io/tizhi-simulator/

---

**🎮 祝你游戏愉快！**
