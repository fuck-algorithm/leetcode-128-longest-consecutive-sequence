# Requirements Document

## Introduction

本项目是一个基于TypeScript+React+D3.js的算法可视化演示网站，用于教学目的展示LeetCode 128题"最长连续序列"算法的分步执行过程。网站为单屏幕应用，通过动画形式演示算法步骤，帮助用户理解算法逻辑。

## Glossary

- **Algorithm Visualizer**: 算法可视化演示系统，用于以动画形式展示算法执行步骤
- **Canvas**: 画布组件，用于绘制数据结构和算法执行过程的可视化
- **HashSet**: 哈希集合数据结构，用于存储不重复的数字
- **Step**: 算法执行的单个步骤，包含代码行号、变量状态和可视化状态
- **PlayState**: 播放状态，包括playing（播放中）、paused（暂停）、stopped（停止）
- **CodePanel**: 代码面板组件，展示算法代码并高亮当前执行行
- **ControlPanel**: 控制面板组件，提供播放控制按钮
- **ProgressBar**: 进度条组件，展示和控制播放进度
- **IndexedDB**: 浏览器本地数据库，用于缓存设置和GitHub数据

## Requirements

### Requirement 1: 页面标题与导航

**User Story:** 作为用户，我希望页面标题与LeetCode题目保持一致，以便快速识别当前演示的算法题目。

#### Acceptance Criteria

1. WHEN 页面加载完成 THEN Algorithm Visualizer SHALL 在页面顶部展示题目标题，包含题目编号"128"和中文标题"最长连续序列"
2. WHEN 用户单击题目标题 THEN Algorithm Visualizer SHALL 在新标签页打开LeetCode对应题目页面(https://leetcode.cn/problems/longest-consecutive-sequence/)
3. WHEN 页面加载完成 THEN Algorithm Visualizer SHALL 设置浏览器标签页标题为"128. 最长连续序列 - 算法可视化"

### Requirement 2: GitHub徽标与Star数展示

**User Story:** 作为用户，我希望看到项目的GitHub仓库链接和Star数，以便了解项目热度并支持项目。

#### Acceptance Criteria

1. WHEN 页面加载完成 THEN Algorithm Visualizer SHALL 在页面左侧展示GitHub徽标图标
2. WHEN 用户单击GitHub徽标 THEN Algorithm Visualizer SHALL 在新标签页打开项目GitHub仓库(https://github.com/fuck-algorithm/leetcode-128-longest-consecutive-sequence)
3. WHEN 用户将鼠标悬停在GitHub徽标上 THEN Algorithm Visualizer SHALL 展示提示文字"去GitHub仓库Star支持一下"
4. WHEN 页面加载完成 THEN Algorithm Visualizer SHALL 在GitHub徽标旁边展示仓库Star数
5. WHEN 获取Star数成功 THEN Algorithm Visualizer SHALL 将Star数缓存到IndexedDB，缓存有效期为1小时
6. WHEN 获取Star数失败 THEN Algorithm Visualizer SHALL 从IndexedDB读取上次缓存的Star数
7. IF IndexedDB中无缓存数据 THEN Algorithm Visualizer SHALL 展示默认值0

### Requirement 3: 数据输入功能

**User Story:** 作为用户，我希望能够输入自定义数据或选择预设样例，以便测试不同输入下的算法执行过程。

#### Acceptance Criteria

1. WHEN 页面加载完成 THEN Algorithm Visualizer SHALL 在标题下方展示数据输入区域，布局紧凑适应单屏幕
2. WHEN 用户输入自定义数据 THEN Algorithm Visualizer SHALL 支持数组格式输入（如[1,2,3]或1,2,3）
3. WHEN 页面加载完成 THEN Algorithm Visualizer SHALL 平铺展示至少3个预设数据样例供用户单击选择
4. WHEN 用户单击预设样例 THEN Algorithm Visualizer SHALL 立即使用该样例数据更新可视化
5. WHEN 用户单击随机生成按钮 THEN Algorithm Visualizer SHALL 生成符合题目约束的随机数据（数组长度5-20，数值范围-50到50）
6. WHEN 用户提交数据 THEN Algorithm Visualizer SHALL 验证数据合法性（数组长度不超过100，数值在-10^9到10^9之间）
7. IF 用户输入数据不合法 THEN Algorithm Visualizer SHALL 展示具体错误提示信息并阻止提交

### Requirement 4: 算法代码展示

**User Story:** 作为用户，我希望查看多种编程语言的算法代码，并看到当前执行行的高亮和变量值，以便理解算法逻辑。

#### Acceptance Criteria

1. WHEN 页面加载完成 THEN Algorithm Visualizer SHALL 展示算法代码面板，支持Java、Python、Golang、JavaScript四种语言切换
2. WHEN 用户切换编程语言 THEN Algorithm Visualizer SHALL 立即更新代码展示为对应语言的实现
3. WHEN 算法执行到某一步 THEN Algorithm Visualizer SHALL 高亮显示当前执行的代码行
4. WHEN 算法执行到某一步 THEN Algorithm Visualizer SHALL 在对应代码行后方展示当前变量的内存值
5. WHEN 代码展示时 THEN Algorithm Visualizer SHALL 为每行代码显示行号
6. WHEN 代码展示时 THEN Algorithm Visualizer SHALL 应用语法高亮，区分关键字、变量、字符串等
7. WHEN 代码展示时 THEN Algorithm Visualizer SHALL 确保代码对齐正确，无缩进错误
8. WHEN 代码展示时 THEN Algorithm Visualizer SHALL 调整代码框尺寸以避免出现水平或垂直滚动条

### Requirement 5: 画布可视化

**User Story:** 作为用户，我希望在画布上看到算法执行过程的可视化动画，包括数据结构变化和状态转移，以便直观理解算法。

#### Acceptance Criteria

1. WHEN 页面加载完成 THEN Algorithm Visualizer SHALL 将页面大部分空间分配给画布区域
2. WHEN 用户拖动画布 THEN Algorithm Visualizer SHALL 支持画布平移操作
3. WHEN 用户滚动鼠标滚轮 THEN Algorithm Visualizer SHALL 支持画布缩放操作
4. WHEN 算法执行时 THEN Algorithm Visualizer SHALL 在画布上绘制原始数组的可视化表示
5. WHEN 算法执行时 THEN Algorithm Visualizer SHALL 在画布上绘制HashSet数据结构及其内容变化
6. WHEN 算法执行时 THEN Algorithm Visualizer SHALL 用不同颜色高亮当前操作的元素
7. WHEN 算法执行时 THEN Algorithm Visualizer SHALL 用颜色区分当前序列和最长序列
8. WHEN 数据发生变更时 THEN Algorithm Visualizer SHALL 使用箭头指示数据流向，并在箭头旁添加文字说明
9. WHEN 状态发生转移时 THEN Algorithm Visualizer SHALL 在节点上方或旁边展示状态变更的标签文本
10. WHEN 画布绘制元素时 THEN Algorithm Visualizer SHALL 确保元素分散布局，避免重叠
11. WHEN 数据结构较大时 THEN Algorithm Visualizer SHALL 自动调整视图以适应内容

### Requirement 6: 播放控制面板

**User Story:** 作为用户，我希望通过控制面板控制算法演示的播放，以便按自己的节奏学习算法。

#### Acceptance Criteria

1. WHEN 页面加载完成 THEN Algorithm Visualizer SHALL 展示包含上一步、下一步、播放/暂停、重置按钮的控制面板
2. WHEN 用户单击上一步按钮或按左方向键 THEN Algorithm Visualizer SHALL 回退到上一个算法步骤
3. WHEN 用户单击下一步按钮或按右方向键 THEN Algorithm Visualizer SHALL 前进到下一个算法步骤
4. WHEN 用户单击播放/暂停按钮或按空格键 THEN Algorithm Visualizer SHALL 切换播放/暂停状态
5. WHEN 用户单击重置按钮或按R键 THEN Algorithm Visualizer SHALL 重置到第一步并停止播放
6. WHEN 按钮展示时 THEN Algorithm Visualizer SHALL 在按钮上显示对应的快捷键文案（←、→、空格、R）
7. WHEN 页面加载完成 THEN Algorithm Visualizer SHALL 展示播放速度控制器，默认速度为1x
8. WHEN 用户调整播放速度 THEN Algorithm Visualizer SHALL 立即应用新的播放速度
9. WHEN 用户调整播放速度 THEN Algorithm Visualizer SHALL 将速度设置保存到IndexedDB
10. WHEN 页面重新加载 THEN Algorithm Visualizer SHALL 从IndexedDB恢复上次保存的播放速度

### Requirement 7: 播放进度条

**User Story:** 作为用户，我希望通过进度条查看和控制播放进度，以便快速跳转到特定步骤。

#### Acceptance Criteria

1. WHEN 页面加载完成 THEN Algorithm Visualizer SHALL 在控制面板底部展示占满宽度的进度条
2. WHEN 算法播放时 THEN Algorithm Visualizer SHALL 用绿色显示已播放部分，灰色显示未播放部分
3. WHEN 用户拖动进度条 THEN Algorithm Visualizer SHALL 跳转到对应的算法步骤
4. WHEN 算法步骤变化时 THEN Algorithm Visualizer SHALL 实时更新进度条位置

### Requirement 8: 微信交流群悬浮球

**User Story:** 作为用户，我希望能够加入算法交流群与其他学习者交流，以便共同学习进步。

#### Acceptance Criteria

1. WHEN 页面加载完成 THEN Algorithm Visualizer SHALL 在页面右下角展示带有"交流群"字样的微信群图标悬浮球
2. WHEN 用户将鼠标悬停在悬浮球上 THEN Algorithm Visualizer SHALL 展示微信二维码图片，保持原始比例不变形
3. WHEN 展示二维码时 THEN Algorithm Visualizer SHALL 提示用户"使用微信扫码发送'leetcode'加入算法交流群"

### Requirement 9: 页面配色与样式

**User Story:** 作为用户，我希望页面配色协调美观，以便获得良好的视觉体验。

#### Acceptance Criteria

1. WHEN 页面渲染时 THEN Algorithm Visualizer SHALL 使用协调统一的配色方案
2. WHEN 页面渲染时 THEN Algorithm Visualizer SHALL 确保所有颜色中不包含任何紫色色调
3. WHEN 页面渲染时 THEN Algorithm Visualizer SHALL 保持单屏幕布局，无需垂直滚动

### Requirement 10: GitHub Pages部署

**User Story:** 作为开发者，我希望项目能够自动部署到GitHub Pages，以便用户访问在线演示。

#### Acceptance Criteria

1. WHEN 代码推送到main分支 THEN GitHub Actions SHALL 自动触发构建和部署流程
2. WHEN 构建完成 THEN GitHub Actions SHALL 将构建产物部署到GitHub Pages
3. WHEN 部署成功 THEN Algorithm Visualizer SHALL 可通过GitHub Pages URL访问

### Requirement 11: 代码质量保证

**User Story:** 作为开发者，我希望代码在提交前通过质量检查，以便保持代码质量。

#### Acceptance Criteria

1. WHEN 代码提交前 THEN Developer SHALL 确保无TypeScript编译错误
2. WHEN 代码提交前 THEN Developer SHALL 确保无ESLint错误
3. WHEN 代码提交时 THEN Developer SHALL 将变更分为多次有意义的commit

### Requirement 12: README文档

**User Story:** 作为访问者，我希望README简洁明了，以便快速了解项目用途。

#### Acceptance Criteria

1. WHEN 查看README THEN README SHALL 说明这是LeetCode 128题的可视化动画演示
2. WHEN 查看README THEN README SHALL 包含GitHub Pages在线演示的链接
