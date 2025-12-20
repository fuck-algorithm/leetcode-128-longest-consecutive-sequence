// 算法步骤中的变量状态
export interface VariableState {
  num_set?: number[];
  longestStreak?: number;
  currentNum?: number;
  currentStreak?: number;
  num?: number;
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
}

// 算法执行步骤
export interface AlgorithmStep {
  // 当前执行的代码行号
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
