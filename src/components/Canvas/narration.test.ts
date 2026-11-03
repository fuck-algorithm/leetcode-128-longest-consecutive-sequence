import { describe, expect, it } from 'vitest';
import { getStepNarration } from './narration';
import { VisualizationState } from '../../types';
import { generateAlgorithmSteps, sampleData } from '../../algorithm/longestConsecutive';

const state: VisualizationState = {
  originalArray: [100, 4, 200, 1, 3, 2],
  hashSetNumbers: [100, 4, 200, 1, 3, 2],
  highlightedNumbers: [1],
  currentSequence: [1, 2, 3],
  longestSequence: [1, 2, 3],
  isSequenceStart: true,
};

describe('getStepNarration', () => {
  it('explains why a number without a predecessor starts a run', () => {
    expect(getStepNarration('0 不在HashSet中，1 是一个序列的起点', [1], state)).toEqual({
      action: '1 是起点',
      message: '集合里没有 0，所以这段连续数只能从 1 开始；向右找后继。',
    });
  });

  it('explains why a number with a predecessor is skipped', () => {
    expect(getStepNarration('3 在HashSet中，跳过 4（它不是序列起点）', [4], state)).toEqual({
      action: '4 不是起点',
      message: '集合里有 3，4 属于从更小数字开始的那一段；跳过它，避免重复计数。',
    });
  });

  it('explains duplicate values without repeating raw step wording', () => {
    expect(getStepNarration('数字 0 已存在，跳过重复项', [0], state)).toEqual({
      action: '跳过重复值 0',
      message: '集合里已经有 0，不重复收录；相同数字只按一个计算。',
    });
  });

  it('explains the first currentNum assignment as the initial count', () => {
    expect(getStepNarration('初始化 currentNum = 1, currentStreak = 1', [1], state)).toEqual({
      action: '从起点开始数',
      message: '当前从 1 开始，先把它记作长度 1 的连续段。',
    });
  });

  it('explains a longer current run using the visible run values', () => {
    expect(getStepNarration('currentNum = 3, currentStreak = 3', [3], state)).toEqual({
      action: '连续段长 3',
      message: '找到下一个数字后，当前这段变为 1 → 2 → 3。',
    });
  });

  it('connects a successful successor lookup to the growing sequence', () => {
    expect(getStepNarration('检查 2 是否在HashSet中：是', [1, 2], state)).toEqual({
      action: '找到 2',
      message: '集合中有 2，它紧接在 1 后面；把它接到当前连续段，再继续找下一个数。',
    });
  });

  it('explains the stopping condition using the missing next number', () => {
    expect(getStepNarration('检查 4 是否在HashSet中：否，退出循环', [3], state)).toEqual({
      action: '停在 3',
      message: '集合中没有 4，连续段在 3 结束；现在用这段的长度更新最长纪录。',
    });
  });

  it('explains that insertion prepares later membership checks', () => {
    expect(getStepNarration('将数字 7 添加到HashSet中', [7], state)).toEqual({
      action: '收录 7',
      message: '把 7 放入查找集合；后面判断它的前一个或后一个数字是否存在。',
    });
  });

  it('states both the final sequence and its length', () => {
    expect(getStepNarration('算法结束，返回最长连续序列长度: 3', [], state)).toEqual({
      action: '答案：3',
      message: '最长连续段是 1 → 2 → 3，共有 3 个数字。',
    });
  });

  it('never falls back to raw implementation prose for any displayed sample step', () => {
    for (const sample of sampleData) {
      for (const step of generateAlgorithmSteps(sample.data)) {
        const { action, message } = getStepNarration(step.description, step.visualization.highlightedNumbers || [], step.visualization);
        expect(action).not.toBe('算法步骤');
        expect(message).not.toBe(step.description);
        expect(message.length).toBeLessThan(100);
      }
    }
  });
});
