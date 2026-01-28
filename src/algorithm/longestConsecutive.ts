import { AlgorithmStep, VisualizationState, VariableState } from '../types';

// 支持的编程语言
export type CodeLanguage = 'java' | 'python' | 'golang' | 'javascript';

// 各语言的算法代码
export const algorithmCodes: Record<CodeLanguage, string> = {
  java: `class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> num_set = new HashSet<Integer>();
        for (int num : nums) {
            num_set.add(num);
        }

        int longestStreak = 0;

        for (int num : num_set) {
            if (!num_set.contains(num - 1)) {
                int currentNum = num;
                int currentStreak = 1;

                while (num_set.contains(currentNum + 1)) {
                    currentNum += 1;
                    currentStreak += 1;
                }

                longestStreak = Math.max(longestStreak, currentStreak);
            }
        }

        return longestStreak;
    }
}`,
  python: `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        num_set = set(nums)
        
        longest_streak = 0
        
        for num in num_set:
            if num - 1 not in num_set:
                current_num = num
                current_streak = 1
                
                while current_num + 1 in num_set:
                    current_num += 1
                    current_streak += 1
                
                longest_streak = max(longest_streak, current_streak)
        
        return longest_streak`,
  golang: `func longestConsecutive(nums []int) int {
    numSet := make(map[int]bool)
    for _, num := range nums {
        numSet[num] = true
    }
    
    longestStreak := 0
    
    for num := range numSet {
        if !numSet[num-1] {
            currentNum := num
            currentStreak := 1
            
            for numSet[currentNum+1] {
                currentNum++
                currentStreak++
            }
            
            if currentStreak > longestStreak {
                longestStreak = currentStreak
            }
        }
    }
    
    return longestStreak
}`,
  javascript: `var longestConsecutive = function(nums) {
    const numSet = new Set(nums);
    let longestStreak = 0;
    
    for (const num of numSet) {
        if (!numSet.has(num - 1)) {
            let currentNum = num;
            let currentStreak = 1;
            
            while (numSet.has(currentNum + 1)) {
                currentNum++;
                currentStreak++;
            }
            
            longestStreak = Math.max(longestStreak, currentStreak);
        }
    }
    
    return longestStreak;
};`
};

// 各语言的代码行号映射
export const codeLineMappings: Record<CodeLanguage, Record<string, number>> = {
  java: {
    createHashSet: 3,
    addToHashSet: 4,
    addToHashSetLoop: 5,
    initLongestStreak: 8,
    forEachNum: 10,
    checkSequenceStart: 11,
    initCurrentNum: 12,
    initCurrentStreak: 13,
    whileLoop: 15,
    incrementCurrentNum: 16,
    incrementCurrentStreak: 17,
    updateLongestStreak: 20,
    returnResult: 24,
  },
  python: {
    createHashSet: 3,
    addToHashSet: 3,
    addToHashSetLoop: 3,
    initLongestStreak: 5,
    forEachNum: 7,
    checkSequenceStart: 8,
    initCurrentNum: 9,
    initCurrentStreak: 10,
    whileLoop: 12,
    incrementCurrentNum: 13,
    incrementCurrentStreak: 14,
    updateLongestStreak: 16,
    returnResult: 18,
  },
  golang: {
    createHashSet: 2,
    addToHashSet: 3,
    addToHashSetLoop: 4,
    initLongestStreak: 7,
    forEachNum: 9,
    checkSequenceStart: 10,
    initCurrentNum: 11,
    initCurrentStreak: 12,
    whileLoop: 14,
    incrementCurrentNum: 15,
    incrementCurrentStreak: 16,
    updateLongestStreak: 19,
    returnResult: 24,
  },
  javascript: {
    createHashSet: 2,
    addToHashSet: 2,
    addToHashSetLoop: 2,
    initLongestStreak: 3,
    forEachNum: 5,
    checkSequenceStart: 6,
    initCurrentNum: 7,
    initCurrentStreak: 8,
    whileLoop: 10,
    incrementCurrentNum: 11,
    incrementCurrentStreak: 12,
    updateLongestStreak: 15,
    returnResult: 18,
  }
};

// 兼容旧代码
export const algorithmCode = algorithmCodes.java;
export const codeLineMapping = codeLineMappings.java;

// 生成算法执行步骤
export function generateAlgorithmSteps(nums: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  let stepCounter = 0;
  
  const createStep = (
    stepId: string,
    stepType: import('../types').StepType,
    lineNumber: number,
    variables: VariableState,
    visualization: VisualizationState,
    description: string,
    annotations: import('../types').Annotation[] = [],
    dataFlows: import('../types').DataFlow[] = []
  ): AlgorithmStep => ({
    stepId: `${stepId}_${stepCounter++}`,
    stepType,
    lineNumber,
    variables: { ...variables },
    visualization: { ...visualization },
    annotations,
    dataFlows,
    description,
  });

  // 初始可视化状态
  const baseVisualization: VisualizationState = {
    highlightedNumbers: [],
    currentSequence: [],
    longestSequence: [],
    isSequenceStart: false,
    hashSetNumbers: [],
    originalArray: [...nums],
  };

  // 步骤1: 创建HashSet
  steps.push(createStep(
    'create_hashset',
    'variable_init',
    codeLineMapping.createHashSet,
    { num_set: [] },
    { ...baseVisualization },
    '创建一个空的HashSet用于存储数组中的数字',
    [{
      id: 'create-hs',
      type: 'assignment',
      targetId: 'array-title',
      position: 'bottom',
      text: '创建HashSet存储结构',
      highlight: true
    }],
    [{
      id: 'flow-create-hs',
      sourceId: 'array-title',
      targetId: 'hashset-title',
      label: '初始化',
      animated: true
    }]
  ));

  // 步骤2-n: 将数字添加到HashSet
  const numSet: number[] = [];
  let arrayIndex = 0;
  for (const num of nums) {
    const originalIndex = arrayIndex++;
    if (!numSet.includes(num)) {
      numSet.push(num);
      steps.push(createStep(
        'add_to_hashset',
        'data_operation',
        codeLineMapping.addToHashSetLoop,
        { num_set: [...numSet], num },
        { ...baseVisualization, hashSetNumbers: [...numSet], highlightedNumbers: [num] },
        `将数字 ${num} 添加到HashSet中`,
        [{
          id: `add-${num}`,
          type: 'assignment',
          targetId: `hashset-${num}`,
          position: 'right',
          text: `add(${num})`,
          highlight: true
        }],
        [{
          id: `flow-add-${num}`,
          sourceId: `array-${originalIndex}`,
          targetId: `hashset-${num}`,
          label: '添加',
          animated: true
        }]
      ));
    } else {
      steps.push(createStep(
        'skip_duplicate',
        'data_operation',
        codeLineMapping.addToHashSetLoop,
        { num_set: [...numSet], num },
        { ...baseVisualization, hashSetNumbers: [...numSet], highlightedNumbers: [num] },
        `数字 ${num} 已存在，跳过重复项`,
        [{
          id: `skip-${num}`,
          type: 'assignment',
          targetId: `array-${originalIndex}`,
          position: 'right',
          text: '重复，跳过',
          highlight: false
        }]
      ));
    }
  }

  // 步骤: 初始化longestStreak
  let longestStreak = 0;
  let longestSequence: number[] = [];
  steps.push(createStep(
    'init_longest_streak',
    'variable_init',
    codeLineMapping.initLongestStreak,
    { num_set: [...numSet], longestStreak: 0 },
    { ...baseVisualization, hashSetNumbers: [...numSet] },
    '初始化最长连续序列长度为0',
    [{
      id: 'init-longest',
      type: 'assignment',
      targetId: 'longest-var',
      position: 'top',
      text: 'longestStreak = 0',
      highlight: true
    }],
    [{
      id: 'flow-init-longest',
      sourceId: 'hashset-title',
      targetId: 'longest-var',
      label: '准备遍历',
      animated: true
    }]
  ));

  // 遍历HashSet中的每个数字
  const sortedNums = [...new Set(nums)];
  
  for (const num of sortedNums) {
    // 检查是否为序列起点
    steps.push(createStep(
      'for_each_num',
      'loop_iteration',
      codeLineMapping.forEachNum,
      { num_set: [...numSet], longestStreak, num },
      { 
        ...baseVisualization, 
        hashSetNumbers: [...numSet], 
        highlightedNumbers: [num],
        longestSequence: [...longestSequence]
      },
      `遍历HashSet中的数字 ${num}`,
      [{
        id: `loop-${num}`,
        type: 'iteration',
        targetId: `hashset-${num}`,
        position: 'top',
        text: `for num=${num}`,
        highlight: true
      }],
      [{
        id: `flow-loop-${num}`,
        sourceId: 'hashset-title',
        targetId: `hashset-${num}`,
        label: '遍历',
        animated: true
      }]
    ));

    const isStart = !numSet.includes(num - 1);
    steps.push(createStep(
      'check_sequence_start',
      'condition_check',
      codeLineMapping.checkSequenceStart,
      { num_set: [...numSet], longestStreak, num },
      { 
        ...baseVisualization, 
        hashSetNumbers: [...numSet], 
        highlightedNumbers: [num],
        isSequenceStart: isStart,
        longestSequence: [...longestSequence]
      },
      isStart 
        ? `${num - 1} 不在HashSet中，${num} 是一个序列的起点`
        : `${num - 1} 在HashSet中，跳过 ${num}（它不是序列起点）`,
      [{
        id: `check-${num}`,
        type: 'comparison',
        targetId: `hashset-${num}`,
        position: isStart ? 'right' : 'top',
        text: isStart ? `!contains(${num - 1})? true` : `contains(${num - 1})? false`,
        highlight: isStart
      }],
      isStart ? [{
        id: `flow-check-start-${num}`,
        sourceId: 'hashset-title',
        targetId: `hashset-${num}`,
        label: '序列起点',
        animated: true
      }] : [{
        id: `flow-check-skip-${num}`,
        sourceId: `hashset-${num - 1}`,
        targetId: `hashset-${num}`,
        label: '跳过',
        animated: true
      }]
    ));

    if (isStart) {
      // 初始化当前序列
      let currentNum = num;
      let currentStreak = 1;
      const currentSequence = [num];

      steps.push(createStep(
        'init_current_num',
        'variable_init',
        codeLineMapping.initCurrentNum,
        { num_set: [...numSet], longestStreak, num, currentNum, currentStreak },
        { 
          ...baseVisualization, 
          hashSetNumbers: [...numSet], 
          highlightedNumbers: [num],
          currentSequence: [...currentSequence],
          longestSequence: [...longestSequence]
        },
        `初始化 currentNum = ${num}, currentStreak = 1`,
        [{
          id: `init-${num}`,
          type: 'assignment',
          targetId: `hashset-${num}`,
          position: 'right',
          text: `currentNum=${num}, currentStreak=1`,
          highlight: true
        }],
        [{
          id: `flow-start-${num}`,
          sourceId: `hashset-${num}`,
          targetId: 'sequence-start',
          label: '开始序列',
          animated: true
        }]
      ));

      // 查找连续序列
      while (numSet.includes(currentNum + 1)) {
        const prevNum = currentNum;
        steps.push(createStep(
          'while_loop_check',
          'condition_check',
          codeLineMapping.whileLoop,
          { num_set: [...numSet], longestStreak, num, currentNum, currentStreak },
          { 
            ...baseVisualization, 
            hashSetNumbers: [...numSet], 
            highlightedNumbers: [currentNum, currentNum + 1],
            currentSequence: [...currentSequence],
            longestSequence: [...longestSequence]
          },
          `检查 ${currentNum + 1} 是否在HashSet中：是`,
          [{
            id: `check-${currentNum}`,
            type: 'comparison',
            targetId: `hashset-${currentNum}`,
            position: 'top',
            text: `contains(${currentNum + 1})? true`,
            highlight: true
          }],
          [{
            id: `flow-check-${currentNum}`,
            sourceId: `hashset-${currentNum}`,
            targetId: `hashset-${currentNum + 1}`,
            label: `+1`,
            animated: true
          }]
        ));

        currentNum += 1;
        currentStreak += 1;
        currentSequence.push(currentNum);

        steps.push(createStep(
          'increment_current',
          'variable_update',
          codeLineMapping.incrementCurrentNum,
          { num_set: [...numSet], longestStreak, num, currentNum, currentStreak },
          { 
            ...baseVisualization, 
            hashSetNumbers: [...numSet], 
            highlightedNumbers: [currentNum],
            currentSequence: [...currentSequence],
            longestSequence: [...longestSequence]
          },
          `currentNum = ${currentNum}, currentStreak = ${currentStreak}`,
          [{
            id: `update-${currentNum}`,
            type: 'value_change',
            targetId: `hashset-${currentNum}`,
            position: 'right',
            text: `++currentNum, ++currentStreak`,
            highlight: true
          }],
          [{
            id: `flow-update-${currentNum}`,
            sourceId: `hashset-${prevNum}`,
            targetId: `hashset-${currentNum}`,
            label: '推进',
            animated: true
          }]
        ));
      }

      // 检查while循环结束条件
      if (!numSet.includes(currentNum + 1)) {
        steps.push(createStep(
          'while_loop_exit',
          'condition_check',
          codeLineMapping.whileLoop,
          { num_set: [...numSet], longestStreak, num, currentNum, currentStreak },
          { 
            ...baseVisualization, 
            hashSetNumbers: [...numSet], 
            highlightedNumbers: [currentNum],
            currentSequence: [...currentSequence],
            longestSequence: [...longestSequence]
          },
          `检查 ${currentNum + 1} 是否在HashSet中：否，退出循环`,
          [{
            id: `exit-${currentNum}`,
            type: 'condition',
            targetId: `hashset-${currentNum}`,
            position: 'top',
            text: `contains(${currentNum + 1})? false`,
            highlight: true
          }]
        ));
      }

      // 更新最长序列
      const oldLongestStreak = longestStreak;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        longestSequence = [...currentSequence];
        
        steps.push(createStep(
          'update_longest_streak',
          'variable_update',
          codeLineMapping.updateLongestStreak,
          { num_set: [...numSet], longestStreak, num, currentNum, currentStreak },
          { 
            ...baseVisualization, 
            hashSetNumbers: [...numSet], 
            highlightedNumbers: [],
            currentSequence: [...currentSequence],
            longestSequence: [...longestSequence]
          },
          `更新最长序列: ${currentStreak} > ${oldLongestStreak}`,
          [{
            id: `update-longest-${num}`,
            type: 'comparison',
            targetId: 'longest-seq-label',
            position: 'top',
            text: `${currentStreak} > ${oldLongestStreak}, 更新!`,
            highlight: true
          }],
          [{
            id: `flow-longest-${num}`,
            sourceId: 'current-seq',
            targetId: 'longest-seq',
            label: `长度: ${currentStreak}`,
            animated: true
          }]
        ));
      } else {
        steps.push(createStep(
          'no_update_longest_streak',
          'variable_update',
          codeLineMapping.updateLongestStreak,
          { num_set: [...numSet], longestStreak, num, currentNum, currentStreak },
          { 
            ...baseVisualization, 
            hashSetNumbers: [...numSet], 
            highlightedNumbers: [],
            currentSequence: [...currentSequence],
            longestSequence: [...longestSequence]
          },
          `不更新: ${currentStreak} <= ${longestStreak}`,
          [{
            id: `no-update-${num}`,
            type: 'comparison',
            targetId: 'longest-seq-label',
            position: 'top',
            text: `${currentStreak} <= ${longestStreak}, 不更新`,
            highlight: false
          }]
        ));
      }
    }
  }

  // 返回结果
  steps.push(createStep(
    'return_result',
    'algorithm_end',
    codeLineMapping.returnResult,
    { num_set: [...numSet], longestStreak },
    { 
      ...baseVisualization, 
      hashSetNumbers: [...numSet], 
      longestSequence: [...longestSequence]
    },
    `算法结束，返回最长连续序列长度: ${longestStreak}`
  ));

  return steps;
}

// 验证输入数据
export function validateInput(input: string): { valid: boolean; data?: number[]; error?: string } {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { valid: false, error: '输入不能为空' };
  }

  // 支持多种格式：[1,2,3] 或 1,2,3 或 1 2 3
  let numbers: number[];
  
  try {
    // 尝试解析JSON数组格式
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      numbers = JSON.parse(trimmed);
    } else {
      // 尝试解析逗号或空格分隔的格式
      numbers = trimmed.split(/[,\s]+/).map(s => {
        const n = parseInt(s.trim(), 10);
        if (isNaN(n)) throw new Error(`无效的数字: ${s}`);
        return n;
      });
    }

    // 验证数组长度
    if (numbers.length > 100) {
      return { valid: false, error: '数组长度不能超过100（为了更好的可视化效果）' };
    }

    // 验证数字范围
    for (const n of numbers) {
      if (n < -1000000000 || n > 1000000000) {
        return { valid: false, error: '数字必须在 -10^9 到 10^9 之间' };
      }
    }

    return { valid: true, data: numbers };
  } catch {
    return { valid: false, error: '输入格式无效，请输入数字数组，如: [1,2,3] 或 1,2,3' };
  }
}

// 生成随机数据
export function generateRandomData(): number[] {
  const length = Math.floor(Math.random() * 15) + 5; // 5-20个数字
  const numbers: number[] = [];
  
  for (let i = 0; i < length; i++) {
    // 生成-50到50之间的随机数，增加连续序列的概率
    numbers.push(Math.floor(Math.random() * 101) - 50);
  }
  
  return numbers;
}

// 预设样例数据
export const sampleData = [
  { name: '示例1', data: [100, 4, 200, 1, 3, 2] },
  { name: '示例2', data: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] },
  { name: '示例3', data: [1, 0, 1, 2] },
];
