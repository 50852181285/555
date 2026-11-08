# 桌面大肥鱼插件

一只可爱的大肥鱼游弋在你的鸿蒙桌面上！支持喂食、互动、心情变化、升级系统等丰富功能。

## ✨ 功能特性

- 🐟 **桌面宠物**：一只可爱的大肥鱼在桌面上自由游动
- 🍽️ **喂食系统**：三种食物（面包、虾米、零食），不同效果
- 🎮 **互动玩耍**：玩球、追逐、吹泡泡三种小游戏
- 💤 **睡眠恢复**：让鱼儿睡觉恢复精力
- 😊 **心情系统**：开心、兴奋、饥饿、困倦、平静五种心情，外观随心情变化
- ⬆️ **等级成长**：通过喂食和玩耍获得经验，升级解锁新内容
- 📊 **状态面板**：实时显示饥饿度、开心度、精力值
- ⚙️ **丰富设置**：自定义名字、自动喂食、动画速度、显示选项等
- 🎨 **精美动画**：SVG 矢量图形 + CSS 动画，流畅不占资源

## 📦 安装方法

### 方法一：通过 DSHM 插件管理安装（推荐）

1. 打开 DSHM 设置 → 插件
2. 点击「安装插件」
3. 输入：`/storage/Users/currentUser/Download/com.dshm.dshclient/desktop-fat-fish-plugin`
4. 重启 DSHM 应用

### 方法二：命令行安装

```bash
pnpm add /storage/Users/currentUser/Download/com.dshm.dshclient/desktop-fat-fish-plugin
```

然后重启 DSHM 应用。

## 🚀 使用指南

### 添加桌面组件

1. 在 DSHM 桌面长按空白处
2. 选择「添加组件」
3. 找到「桌面大肥鱼」并添加

### 基本操作

- **左键点击鱼儿**：随机触发喂食/玩耍/睡眠
- **右键点击鱼儿**：打开快捷菜单，选择具体操作
- **设置页面**：在 DSHM 设置 → 桌面大肥鱼 中详细配置

### 心情系统

| 心情 | 触发条件 | 外观变化 |
|------|----------|----------|
| 😊 开心 | 开心度≥60 且 饥饿度≥50 | 身体发粉红光芒 |
| 🤩 兴奋 | 开心度≥80 且 饥饿度≥60 | 身体发亮粉光芒 + 抖动 |
| 😋 饥饿 | 饥饿度≤20 | 身体偏橙色 |
| 😴 困倦 | 精力≤20 | 身体偏蓝灰 + 半透明 |
| 😐 平静 | 其他情况 | 默认外观 |

### 等级系统

- 每次喂食获得 10-25 经验
- 每次玩耍获得 10-20 经验
- 升级公式：`100 × 1.5^(等级-1)`

## ⚙️ 配置选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `fishName` | 鱼的名字 | "大肥鱼" |
| `autoFeed` | 自动喂食开关 | false |
| `feedInterval` | 自动喂食间隔(毫秒) | 3600000 (1小时) |
| `animationSpeed` | 动画速度倍率 | 1.0 |
| `showMood` | 显示心情图标 | true |
| `showStatusBar` | 显示状态栏 | true |
| `showExpBar` | 显示经验条 | true |

## 🛠️ 开发说明

### 项目结构

```
desktop-fat-fish-plugin/
├── index.js              # Host 侧主入口
├── package.json          # 包配置
├── cordis.patch.yml      # Cordis 挂载配置
├── icon.svg              # 插件图标
├── LICENSE               # 许可证
├── README.md             # 说明文档
└── src/
    ├── client.js         # Client 侧入口
    └── components/
        ├── DesktopFatFishWidget.vue  # 桌面组件
        └── DesktopFatFishSettings.vue # 设置页面
```

### 技术栈

- **Host 侧**：Node.js (ESM) + Cordis 插件系统
- **Client 侧**：Vue 3 + TypeScript (通过 DSH Web 运行时)
- **通信**：DSH 服务注入机制 (`ctx.provide` / `useService`)
- **存储**：本地 JSON 文件持久化

### 本地开发

```bash
# 进入插件目录
cd /storage/Users/currentUser/Download/com.dshm.dshclient/desktop-fat-fish-plugin

# 类型检查
npm run typecheck

# 运行测试
npm test
```

## 📝 更新日志

### v1.0.0 (2024-xx-xx)
- 🎉 首个版本发布
- ✨ 完整的桌面宠物功能
- 🎨 精美的 SVG 动画
- ⚙️ 完整的设置页面

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

**享受与大肥鱼的桌面时光吧！🐟💕**