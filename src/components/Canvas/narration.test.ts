import { describe, expect, it } from 'vitest';
import { getStepNarration } from './narration';
import { VisualizationState } from '../../types';

const state: VisualizationState = {
  originalArray: [100, 4, 200, 1, 3, 2],
  hashSetNumbers: [100, 4, 200, 1, 3, 2],
  highlightedNumbers: [1],
  currentSequence: [1, 2, 3],
  longestSequence: [1, 2, 3],
  isSequenceStart: true,
};

describe('getStepNarration', () => {
  it('turns step text into a short visible start-of-run explanation', () => {
    expect(getStepNarration('999 不在HashSet中，1 是一个序列的起点', [1], state)).toEqual({
      action: '判断起点',
      message: '1 左侧没有 0，从这里开始向右扩展。',
    });
  });

  it('explains that a run ends when the next value is absent', () => {
    expect(getStepNarration('检查 4 是否在HashSet中：否，退出循环', [3], state)).toEqual({
      action: '连续段结束',
      message: '集合中没有 4，当前连续段到 3 为止。',
    });
  });

  it('explains collection insertions with their purpose', () => {
    expect(getStepNarration('将数字 7 添加到HashSet中', [7], state)).toEqual({
      action: '加入集合',
      message: '把 7 放入 HashSet，供后续常数时间查找。',
    });
  });
});
