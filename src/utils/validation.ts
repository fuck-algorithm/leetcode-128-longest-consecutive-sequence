/**
 * 输入验证和数据生成模块
 */

export interface ValidationResult {
  valid: boolean;
  data?: number[];
  error?: string;
}

// 数值范围限制
const MAX_VALUE = 1e9;
const MIN_VALUE = -1e9;
const MAX_LENGTH = 100;

// 随机生成参数
const RANDOM_MIN_LENGTH = 5;
const RANDOM_MAX_LENGTH = 20;
const RANDOM_MIN_VALUE = -50;
const RANDOM_MAX_VALUE = 50;

/**
 * 验证并解析用户输入的数组数据
 * 支持格式：[1,2,3] 或 1,2,3
 */
export function validateInput(input: string): ValidationResult {
  // 检查空输入
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: '输入不能为空' };
  }

  // 移除方括号（如果有）
  let cleaned = trimmed;
  if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    cleaned = cleaned.slice(1, -1);
  }

  // 检查是否只有方括号
  if (!cleaned.trim()) {
    return { valid: false, error: '输入不能为空' };
  }

  // 分割并解析数字
  const parts = cleaned.split(',').map(s => s.trim());
  const numbers: number[] = [];

  for (const part of parts) {
    if (!part) {
      return { valid: false, error: '输入格式无效，请输入数字数组，如: [1,2,3] 或 1,2,3' };
    }

    // 检查是否为有效数字
    if (!/^-?\d+$/.test(part)) {
      return { valid: false, error: '输入格式无效，请输入数字数组，如: [1,2,3] 或 1,2,3' };
    }

    const num = parseInt(part, 10);

    // 检查数值范围
    if (num < MIN_VALUE || num > MAX_VALUE) {
      return { valid: false, error: `数字必须在 ${MIN_VALUE} 到 ${MAX_VALUE} 之间` };
    }

    numbers.push(num);
  }

  // 检查数组长度
  if (numbers.length > MAX_LENGTH) {
    return { valid: false, error: `数组长度不能超过 ${MAX_LENGTH}` };
  }

  return { valid: true, data: numbers };
}

/**
 * 生成随机数据
 * 长度：5-20
 * 数值范围：-50 到 50
 * 确保生成的数据能产生有意义的连续序列
 */
export function generateRandomData(): number[] {
  const length = Math.floor(Math.random() * (RANDOM_MAX_LENGTH - RANDOM_MIN_LENGTH + 1)) + RANDOM_MIN_LENGTH;
  const numbers: number[] = [];

  // 生成一些连续序列的起点
  const numSequences = Math.floor(Math.random() * 3) + 1; // 1-3个序列
  
  for (let i = 0; i < numSequences; i++) {
    const start = Math.floor(Math.random() * (RANDOM_MAX_VALUE - RANDOM_MIN_VALUE - 5)) + RANDOM_MIN_VALUE;
    const seqLength = Math.floor(Math.random() * 5) + 2; // 2-6个连续数字
    
    for (let j = 0; j < seqLength && numbers.length < length; j++) {
      numbers.push(start + j);
    }
  }

  // 填充剩余的随机数字
  while (numbers.length < length) {
    const num = Math.floor(Math.random() * (RANDOM_MAX_VALUE - RANDOM_MIN_VALUE + 1)) + RANDOM_MIN_VALUE;
    numbers.push(num);
  }

  // 打乱数组顺序
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return numbers;
}

/**
 * 预设数据样例
 */
export const PRESET_EXAMPLES: { label: string; data: number[] }[] = [
  { label: '示例1: [100,4,200,1,3,2]', data: [100, 4, 200, 1, 3, 2] },
  { label: '示例2: [0,3,7,2,5,8,4,6,0,1]', data: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] },
  { label: '示例3: [1,2,0,1]', data: [1, 2, 0, 1] },
];
