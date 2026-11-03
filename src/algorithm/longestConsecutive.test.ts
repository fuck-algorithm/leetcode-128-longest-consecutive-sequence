import { describe, expect, it } from 'vitest';
import { generateAlgorithmSteps } from './longestConsecutive';

describe('generateAlgorithmSteps detail', () => {
  it('shows each pointer, streak, and longest-record decision as a separate step', () => {
    const steps = generateAlgorithmSteps([1, 2]);
    const descriptions = steps.map(({ description }) => description);

    expect(descriptions).toEqual(expect.arrayContaining([
      'currentNum 从 1 前进到 2',
      'currentStreak 从 1 增加到 2',
      '比较当前长度 2 与最长纪录 0',
      '最长长度从 0 更新为 2',
      '更新最长序列: 2 > 0',
    ]));
    expect(steps.filter(({ stepId }) => stepId.startsWith('increment_current_num_'))).toHaveLength(1);
    expect(steps.filter(({ stepId }) => stepId.startsWith('increment_current_streak_'))).toHaveLength(1);
    expect(steps.every(({ stepId }) => stepId)).toBe(true);
    expect(new Set(steps.map(({ stepId }) => stepId)).size).toBe(steps.length);
  });

  it('shows the explicit skip outcome when a number has a predecessor', () => {
    const steps = generateAlgorithmSteps([1, 2]);

    expect(steps.some(({ description }) => description === '跳过 2：它不是连续段起点')).toBe(true);
  });

  it('records the false while-condition before comparing the run with the best', () => {
    const steps = generateAlgorithmSteps([1, 2]);
    const exitIndex = steps.findIndex(({ description }) => description.includes('检查 3 是否在HashSet中：否'));
    const compareIndex = steps.findIndex(({ description }) => description === '比较当前长度 2 与最长纪录 0');

    expect(exitIndex).toBeGreaterThanOrEqual(0);
    expect(compareIndex).toBeGreaterThan(exitIndex);
  });
});
