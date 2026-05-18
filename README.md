<div align="center">

# 🚀 太空战机

**HTML5 Canvas 太空射击游戏 — 多种敌机、粒子爆炸、动态难度**

[![GitHub](https://img.shields.io/badge/GitHub-Project-blue?logo=github)](https://github.com/aiyangtongxue/feiji)
[![HTML5](https://img.shields.io/badge/HTML5-Canvas-E34F26?logo=html5)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📌 项目简介

太空战机是一款基于 HTML5 Canvas 开发的经典太空射击游戏。玩家操控战机在太空中与多种类型的敌机战斗，游戏包含 4 种敌机类型（普通、横向移动、加速、分裂）、CSS 粒子爆炸特效、分数浮动提示、动态难度递增等丰富的游戏机制，带来刺激的射击体验。

---

## ✨ 核心特性

- 🎮 **多种敌机类型**
  - 🔴 普通敌机 — 直线下落，1 HP
  - 🟢 横向移动敌机 — 左右蛇行，2 HP
  - 🟡 加速敌机 — 逐渐加速下落，2 HP
  - 🔵 分裂敌机 — 被击毁后分裂为 2 个小敌机，3 HP
- 🔫 **扇形自动射击** — 三发子弹扇形覆盖，火力全开
- 💥 **粒子爆炸特效** — CSS 粒子 + Canvas 光晕双层爆炸效果
- 📈 **动态难度** — 分数越高敌机越多，1000 分后敌机开始反击
- 🏆 **最高分记录** — localStorage 持久化存储
- ⏸️ **暂停/继续** — P 键暂停，窗口失焦自动暂停
- 📖 **内置教程** — 首次进入显示操作说明
- 🎵 **Web Audio 音效** — 程序化生成射击、爆炸、得分音效
- 🖥️ **侧边操作面板** — 左右面板显示操作说明与功能键

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| HTML5 Canvas | 游戏渲染引擎 |
| CSS3 | 侧边面板、粒子动画、分数浮动提示 |
| JavaScript (ES6+) | 游戏主循环、碰撞检测、状态管理 |
| Web Audio API | 程序化音效生成（OscillatorNode） |
| localStorage | 最高分持久化存储 |
| CSS Custom Properties | 粒子爆炸方向与距离控制 |

---

## 🚀 快速开始

### 前置条件

- 现代浏览器（Chrome 推荐 / Firefox / Safari / Edge）
- 键盘输入设备

### 安装步骤

```bash
git clone https://github.com/aiyangtongxue/feiji.git
cd feiji
```

### 运行命令

```bash
# 方式一：直接打开
start index.html

# 方式二：VSCode Live Server（推荐）

# 方式三：Python 简易服务器
python -m http.server 8080
```

---

## 📂 项目结构

```
feiji/
├── index.html          # 游戏主页面（Canvas + 侧边面板）
├── game.js             # 游戏核心逻辑（主循环、敌机系统、碰撞检测）
├── style.css           # 样式（侧边面板、粒子动画、分数浮动）
├── io/
│   └── favicon.ico     # 网站图标
├── CNAME               # 自定义域名配置
└── README.md           # 项目说明文档
```

---

## 🎮 操作说明

| 按键 | 功能 |
|------|------|
| W / ↑ | 向上移动 |
| S / ↓ | 向下移动 |
| A / ← | 向左移动 |
| D / → | 向右移动 |
| P | 暂停 / 继续 |
| ESC | 关闭教程 |
| 空格 | 开始 / 暂停 / 继续 |

> 💡 游戏自动发射子弹，无需手动射击。死亡后自动重新开始。

---

## 🤝 贡献与许可证

欢迎提交 Issue 和 Pull Request 来帮助改进项目！

本项目采用 **MIT License** 开源协议，详情请见 [LICENSE](LICENSE) 文件。
