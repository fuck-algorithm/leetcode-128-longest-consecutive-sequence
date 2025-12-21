import { LineMapping, StepLineMapping, CodeLanguage } from '../types';

/**
 * 多语言代码行号映射表
 * 每个stepId对应四种语言的代码行号
 */
export const lineMapping: LineMapping = {
  // 变量初始化阶段
  'init_hashset': {
    java: [3],
    python: [3],
    golang: [2],
    javascript: [2],
  },
  'init_longest_streak': {
    java: [8],
    python: [5],
    golang: [7],
    javascript: [3],
  },

  // 构建HashSet阶段
  'build_hashset_loop': {
    java: [4, 5],
    python: [3],
    golang: [3, 4],
    javascript: [2],
  },
  'add_to_hashset': {
    java: [5],
    python: [3],
    golang: [4],
    javascript: [2],
  },

  // 主循环阶段
  'main_loop_start': {
    java: [10],
    python: [7],
    golang: [9],
    javascript: [5],
  },
  'check_sequence_start': {
    java: [11],
    python: [8],
    golang: [10],
    javascript: [6],
  },

  // 序列查找阶段
  'init_current_num': {
    java: [12],
    python: [9],
    golang: [11],
    javascript: [7],
  },
  'init_current_streak': {
    java: [13],
    python: [10],
    golang: [12],
    javascript: [8],
  },
  'while_loop_check': {
    java: [15],
    python: [12],
    golang: [14],
    javascript: [10],
  },
  'increment_current_num': {
    java: [16],
    python: [13],
    golang: [15],
    javascript: [11],
  },
  'increment_current_streak': {
    java: [17],
    python: [14],
    golang: [16],
    javascript: [12],
  },

  // 更新最长序列
  'update_longest_streak': {
    java: [20],
    python: [16],
    golang: [19, 20],
    javascript: [15],
  },

  // 算法结束
  'return_result': {
    java: [24],
    python: [18],
    golang: [24],
    javascript: [18],
  },
};

/**
 * 动态生成带索引的stepId映射
 * 用于循环迭代等需要动态生成的步骤
 */
export function generateDynamicStepId(baseId: string, index: number): string {
  return `${baseId}_${index}`;
}

/**
 * 获取指定stepId和语言的代码行号
 * @param stepId 步骤ID
 * @param language 编程语言
 * @returns 代码行号数组，如果不存在则返回空数组
 */
export function getLineNumbers(stepId: string, language: CodeLanguage): number[] {
  // 先尝试直接匹配
  if (lineMapping[stepId]) {
    return lineMapping[stepId][language];
  }

  // 尝试匹配带索引的stepId（如 "add_to_hashset_0" -> "add_to_hashset"）
  const baseId = stepId.replace(/_\d+$/, '');
  if (lineMapping[baseId]) {
    return lineMapping[baseId][language];
  }

  // 返回空数组表示未找到映射
  return [];
}

/**
 * 获取指定stepId的所有语言映射
 * @param stepId 步骤ID
 * @returns 所有语言的代码行号映射
 */
export function getStepLineMapping(stepId: string): StepLineMapping | null {
  // 先尝试直接匹配
  if (lineMapping[stepId]) {
    return lineMapping[stepId];
  }

  // 尝试匹配带索引的stepId
  const baseId = stepId.replace(/_\d+$/, '');
  if (lineMapping[baseId]) {
    return lineMapping[baseId];
  }

  return null;
}

/**
 * 验证LineMapping的完整性
 * 确保每个stepId都有四种语言的映射
 */
export function validateLineMapping(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const languages: CodeLanguage[] = ['java', 'python', 'golang', 'javascript'];

  for (const [stepId, mapping] of Object.entries(lineMapping)) {
    for (const lang of languages) {
      if (!mapping[lang] || mapping[lang].length === 0) {
        errors.push(`stepId "${stepId}" 缺少 ${lang} 语言的映射`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 获取所有已定义的stepId列表
 */
export function getAllStepIds(): string[] {
  return Object.keys(lineMapping);
}

/**
 * 获取指定语言的代码总行数
 */
export function getCodeLineCount(language: CodeLanguage): number {
  const lineCounts: Record<CodeLanguage, number> = {
    java: 26,
    python: 18,
    golang: 25,
    javascript: 19,
  };
  return lineCounts[language];
}

/**
 * 验证行号是否在有效范围内
 */
export function isValidLineNumber(lineNumber: number, language: CodeLanguage): boolean {
  return lineNumber >= 1 && lineNumber <= getCodeLineCount(language);
}
