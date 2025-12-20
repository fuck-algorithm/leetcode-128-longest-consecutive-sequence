# Design Document

## Overview

本项目是一个基于TypeScript+React+D3.js的LeetCode 128题"最长连续序列"算法可视化演示网站。系统采用单页面应用架构，通过分步动画展示算法执行过程，帮助用户理解算法逻辑。

核心功能包括：
- 多语言算法代码展示与调试模式
- 交互式画布可视化
- 分步播放控制
- 数据输入与验证
- GitHub集成与社交功能

## Architecture

```mermaid
graph TB
    subgraph UI Layer
        App[App.tsx]
        Header[Header]
        InputPanel[InputPanel]
        CodePanel[CodePanel]
        Canvas[Canvas]
        ControlPanel[ControlPanel]
        ProgressBar[ProgressBar]
        WechatFloat[WechatFloat]
    end
    
    subgraph Logic Layer
        Algorithm[Algorithm Engine]
        StepGenerator[Step Generator]
        Validator[Input Validator]
    end
    
    subgraph Data Layer
        IndexedDB[(IndexedDB)]
        GitHubAPI[GitHub API]
    end
    
    App --> Header
    App --> InputPanel
    App --> CodePanel
    App --> Canvas
    App --> ControlPanel
    App --> ProgressBar
    App --> WechatFloat
    
    InputPanel --> Validator
    InputPanel --> Algorithm
    Algorithm --> StepGenerator
    StepGenerator --> Canvas
    StepGenerator --> CodePanel
    
    Header --> GitHubAPI
    Header --> IndexedDB
    ControlPanel --> IndexedDB
```

## Components and Interfaces

### 1. Header Component
负责页面标题、GitHub徽标和Star数展示。

```typescript
interface HeaderProps {
  // 无需外部props，内部管理状态
}

// 内部状态
interface HeaderState {
  starCount: number;
}
```

### 2. InputPanel Component
负责数据输入、样例选择和随机生成。

```typescript
interface InputPanelProps {
  onDataChange: (data: number[]) => void;
  currentData: number[];
}

interface ValidationResult {
  valid: boolean;
  data?: number[];
  error?: string;
}
```

### 3. CodePanel Component
负责多语言代码展示、语法高亮和变量值显示。

```typescript
interface CodePanelProps {
  currentLine: number;
  variables: VariableState;
  language: CodeLanguage;
  onLanguageChange: (lang: CodeLanguage) => void;
}

type CodeLanguage = 'java' | 'python' | 'golang' | 'javascript';
```

### 4. Canvas Component
负责D3.js可视化渲染，支持拖动和缩放。

```typescript
interface CanvasProps {
  visualization: VisualizationState;
  stepDescription: string;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}
```

### 5. ControlPanel Component
负责播放控制和速度调节。

```typescript
interface ControlPanelProps {
  currentStep: number;
  totalSteps: number;
  playState: PlayState;
  playSpeed: number;
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

type PlayState = 'playing' | 'paused' | 'stopped';
```

### 6. ProgressBar Component
负责进度展示和拖动跳转。

```typescript
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onSeek: (step: number) => void;
}
```

### 7. WechatFloat Component
负责微信交流群悬浮球展示。

```typescript
interface WechatFloatProps {
  // 无需外部props
}
```

## Data Models

### AlgorithmStep
表示算法执行的单个步骤。

```typescript
interface AlgorithmStep {
  lineNumber: number;           // 当前执行的代码行号
  variables: VariableState;     // 变量状态
  visualization: VisualizationState;  // 可视化状态
  description: string;          // 步骤描述
}
```

### VariableState
表示算法执行过程中的变量状态。

```typescript
interface VariableState {
  num_set?: number[];
  longestStreak?: number;
  currentNum?: number;
  currentStreak?: number;
  num?: number;
}
```

### VisualizationState
表示画布可视化的状态。

```typescript
interface VisualizationState {
  highlightedNumbers: number[];   // 高亮的数字
  currentSequence: number[];      // 当前序列
  longestSequence: number[];      // 最长序列
  isSequenceStart: boolean;       // 是否为序列起点
  hashSetNumbers: number[];       // HashSet中的数字
  originalArray: number[];        // 原始数组
}
```

### CacheData
表示IndexedDB中的缓存数据。

```typescript
interface CacheData {
  stars: number;
  timestamp: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 输入验证一致性
*For any* 输入字符串，如果validateInput返回valid=true，则返回的data数组必须满足：长度不超过100，所有元素在-10^9到10^9之间；如果返回valid=false，则必须包含非空的error信息。
**Validates: Requirements 3.6, 3.7**

### Property 2: 随机数据合法性
*For any* 调用generateRandomData生成的数组，其长度必须在5-20之间，所有元素必须在-50到50之间。
**Validates: Requirements 3.5**

### Property 3: 步骤导航边界
*For any* 当前步骤currentStep和总步骤数totalSteps，执行上一步操作后currentStep >= 0，执行下一步操作后currentStep < totalSteps。
**Validates: Requirements 6.2, 6.3**

### Property 4: 播放状态切换
*For any* 播放状态playState，执行播放/暂停操作后，如果之前是'playing'则变为'paused'，如果之前是'paused'或'stopped'则变为'playing'。
**Validates: Requirements 6.4**

### Property 5: 进度条同步
*For any* 当前步骤currentStep和总步骤数totalSteps，进度条位置百分比必须等于currentStep / (totalSteps - 1) * 100。
**Validates: Requirements 7.3, 7.4**

### Property 6: 代码行号映射一致性
*For any* 算法步骤，其lineNumber必须对应当前语言代码的有效行号（1到代码总行数之间）。
**Validates: Requirements 4.3**

### Property 7: 变量值展示正确性
*For any* 算法步骤的variables对象，展示的变量值字符串必须正确反映变量的实际值。
**Validates: Requirements 4.4**

### Property 8: 缓存有效期
*For any* 缓存的Star数据，如果当前时间与缓存时间戳的差值小于1小时，则应返回缓存值而不发起新的API请求。
**Validates: Requirements 2.5**

### Property 9: 画布元素不重叠
*For any* 画布上绘制的元素集合，任意两个元素的边界框不应有超过10%的重叠面积。
**Validates: Requirements 5.10**

### Property 10: 颜色无紫色
*For any* 页面中使用的颜色值，其色相值不应在270-330度范围内（紫色色调）。
**Validates: Requirements 9.2**

## Error Handling

### 输入验证错误
- 空输入：显示"输入不能为空"
- 格式错误：显示"输入格式无效，请输入数字数组，如: [1,2,3] 或 1,2,3"
- 长度超限：显示"数组长度不能超过100"
- 数值超限：显示"数字必须在 -10^9 到 10^9 之间"

### API请求错误
- GitHub API失败：静默降级，使用缓存值或默认值0
- 网络错误：不影响核心功能，仅Star数显示为缓存值

### IndexedDB错误
- 数据库打开失败：使用默认值
- 读写失败：静默忽略，不影响用户体验

## Testing Strategy

### 单元测试
使用Vitest进行单元测试，覆盖以下模块：
- 输入验证函数 `validateInput`
- 随机数据生成函数 `generateRandomData`
- 算法步骤生成函数 `generateAlgorithmSteps`
- 缓存操作函数

### 属性测试
使用fast-check进行属性测试，验证以下属性：
- 输入验证的一致性和完整性
- 随机数据生成的合法性
- 步骤导航的边界条件
- 播放状态切换的正确性
- 进度条同步的准确性

### 集成测试
使用Playwright进行端到端测试：
- 页面加载和渲染
- 用户交互流程
- 键盘快捷键
- 画布拖动和缩放

### 测试配置
- 属性测试最少运行100次迭代
- 每个属性测试必须标注对应的设计文档属性编号
- 测试标注格式：`**Feature: algorithm-visualizer, Property {number}: {property_text}**`
