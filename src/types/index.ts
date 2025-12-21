// ==================== 步骤类型 ====================

/**
 * 步骤类型枚举
 * 用于标识算法执行过程中的不同操作类型
 */
export type StepType =
  | 'variable_init'      // 变量初始化
  | 'loop_start'         // 循环开始
  | 'loop_iteration'     // 循环迭代
  | 'condition_check'    // 条件判断
  | 'data_operation'     // 数据结构操作
  | 'variable_update'    // 变量更新
  | 'algorithm_end';     // 算法结束

// ==================== 标注类型 ====================

/**
 * 标注类型枚举
 * 用于在画布元素上展示不同类型的文字说明
 */
export type AnnotationType =
  | 'comparison'    // 比较操作（如 "100 == 100? true"）
  | 'assignment'    // 赋值操作
  | 'value_change'  // 值变化（显示前后值）
  | 'iteration'     // 迭代信息（索引、元素值）
  | 'condition';    // 条件判断结果

/**
 * 标注位置
 */
export type AnnotationPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * 动态标注
 * 用于在画布元素上展示文字说明
 */
export interface Annotation {
  id: string;
  type: AnnotationType;
  targetId: string;           // 目标元素ID
  position: AnnotationPosition;
  text: string;               // 标注文本
  highlight?: boolean;        // 是否高亮
}

// ==================== 数据流 ====================

/**
 * 数据流
 * 表示值从一个位置传递到另一个位置
 */
export interface DataFlow {
  id: string;
  sourceId: string;           // 源元素ID
  targetId: string;           // 目标元素ID
  label: string;              // 箭头旁的文字说明
  animated?: boolean;         // 是否动画
}

/**
 * 旧版数据流格式（兼容）
 */
export interface LegacyDataFlow {
  from: { type: 'array' | 'hashset' | 'variable'; index?: number; name?: string };
  to: { type: 'array' | 'hashset' | 'variable'; index?: number; name?: string };
  value: number | string;
  description: string;
}

// ==================== 变量状态 ====================

/**
 * 变量变更记录
 */
export interface VariableChange {
  variable: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * 算法执行过程中的变量状态
 */
export interface VariableState {
  num_set?: number[];
  longestStreak?: number;
  currentNum?: number;
  currentStreak?: number;
  num?: number;
  // 变量变更记录
  changes?: VariableChange[];
  [key: string]: unknown;
}

// ==================== 可视化状态 ====================

/**
 * 数组元素
 */
export interface ArrayElement {
  index: number;
  value: number;
  highlighted: boolean;
  highlightColor?: string;
}

/**
 * HashSet元素
 */
export interface HashSetElement {
  key: number;
  highlighted: boolean;
  highlightColor?: string;
}

/**
 * 状态标签（旧版兼容）
 */
export interface StateLabel {
  target: { type: 'array' | 'hashset' | 'variable'; index?: number; name?: string };
  text: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * 可视化状态
 */
export interface VisualizationState {
  // 原始数组（带索引和值）
  originalArray: ArrayElement[] | number[];
  // HashSet数据结构
  hashSet?: HashSetElement[];
  // 高亮的数组索引
  highlightedIndices?: number[];
  // 高亮的数字（当前正在检查的）- 兼容旧版
  highlightedNumbers?: number[];
  // 当前正在构建的连续序列
  currentSequence: number[];
  // 已找到的最长序列
  longestSequence: number[];
  // 是否为序列起点
  isSequenceStart: boolean;
  // HashSet中的所有数字 - 兼容旧版
  hashSetNumbers?: number[];
  // 数据流动画（箭头指示）- 旧版兼容
  dataFlow?: LegacyDataFlow[];
  // 状态标签 - 旧版兼容
  labels?: StateLabel[];
}

// ==================== 代码语言 ====================

/**
 * 支持的编程语言
 */
export type CodeLanguage = 'java' | 'python' | 'golang' | 'javascript';

// ==================== 代码行号映射 ====================

/**
 * 单个步骤的多语言代码行号映射
 */
export interface StepLineMapping {
  java: number[];        // Java代码行号（支持多行）
  python: number[];      // Python代码行号
  golang: number[];      // Golang代码行号
  javascript: number[];  // JavaScript代码行号
}

/**
 * 多语言代码行号映射表
 * key为stepId，value为各语言的代码行号
 */
export interface LineMapping {
  [stepId: string]: StepLineMapping;
}

/**
 * 旧版单行映射（兼容）
 */
export interface LegacyLineMapping {
  java: number;
  python: number;
  golang: number;
  javascript: number;
}

// ==================== 算法步骤 ====================

/**
 * 算法执行步骤（新版）
 * 使用StepId进行多语言代码行绑定
 */
export interface AlgorithmStep {
  // 步骤唯一标识符（如 "init_hashset", "loop_start_0"）
  stepId: string;
  // 步骤类型
  stepType: StepType;
  // 当前执行的代码行号（Java语言为基准）- 兼容旧版
  lineNumber: number;
  // 变量状态
  variables: VariableState;
  // 可视化状态
  visualization: VisualizationState;
  // 动态标注
  annotations: Annotation[];
  // 数据流
  dataFlows: DataFlow[];
  // 步骤描述
  description: string;
}

// ==================== 播放控制 ====================

/**
 * 播放状态
 */
export type PlayState = 'playing' | 'paused' | 'stopped';

// ==================== 数据样例 ====================

/**
 * 输入数据样例
 */
export interface DataSample {
  name: string;
  data: number[];
}

// ==================== 缓存数据 ====================

/**
 * IndexedDB缓存数据
 */
export interface CacheData {
  stars: number;
  timestamp: number;
}

// ==================== 画布变换 ====================

/**
 * 画布变换状态
 */
export interface Transform {
  x: number;
  y: number;
  scale: number;  // 范围: 0.5 - 3.0
}

// ==================== 验证结果 ====================

/**
 * 输入验证结果
 */
export interface ValidationResult {
  valid: boolean;
  data?: number[];
  error?: string;
}
