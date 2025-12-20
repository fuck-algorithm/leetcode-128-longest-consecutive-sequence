// 算法步骤中的变量状态
export interface VariableState {
  num_set?: number[];
  longestStreak?: number;
  currentNum?: number;
  currentStreak?: number;
  num?: number;
  [key: string]: unknown;
}

// 可视化状态
export interface VisualizationState {
  // 高亮的数字（当前正在检查的）
  highlightedNumbers: number[];
  // 当前正在构建的连续序列
  currentSequence: number[];
  // 已找到的最长序列
  longestSequence: number[];
  // 是否为序列起点
  isSequenceStart: boolean;
  // HashSet中的所有数字
  hashSetNumbers: number[];
  // 原始数组
  originalArray: number[];
  // 数据流动画（箭头指示）
  dataFlow?: DataFlow[];
  // 状态标签
  labels?: StateLabel[];
}

// 数据流动画
export interface DataFlow {
  from: { type: 'array' | 'hashset' | 'variable'; index?: number; name?: string };
  to: { type: 'array' | 'hashset' | 'variable'; index?: number; name?: string };
  value: number | string;
  description: string;
}

// 状态标签
export interface StateLabel {
  target: { type: 'array' | 'hashset' | 'variable'; index?: number; name?: string };
  text: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

// 支持的编程语言
export type CodeLanguage = 'java' | 'python' | 'golang' | 'javascript';

// 多语言代码行号映射
export interface LineMapping {
  java: number;
  python: number;
  golang: number;
  javascript: number;
}

// 算法执行步骤
export interface AlgorithmStep {
  // 当前执行的代码行号（Java语言为基准）
  lineNumber: number;
  // 变量状态
  variables: VariableState;
  // 可视化状态
  visualization: VisualizationState;
  // 步骤描述
  description: string;
}

// 播放状态
export type PlayState = 'playing' | 'paused' | 'stopped';

// 输入数据样例
export interface DataSample {
  name: string;
  data: number[];
}
