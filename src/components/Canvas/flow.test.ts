import { describe, expect, it } from 'vitest';
import { getInsertionCue, getMembershipCue } from './flow';

describe('getInsertionCue', () => {
  it('identifies an array-to-set insertion and its value', () => {
    expect(getInsertionCue('将数字 -7 添加到HashSet中')).toEqual({ value: -7 });
  });

  it('identifies a positive array-to-set insertion', () => {
    expect(getInsertionCue('将数字 100 添加到HashSet中')).toEqual({ value: 100 });
  });

  it('ignores non-insertion steps', () => {
    expect(getInsertionCue('检查 3 是否在HashSet中：是')).toBeNull();
  });
});

describe('getMembershipCue', () => {
  it('marks the next integer as present when a consecutive successor is found', () => {
    expect(getMembershipCue('检查 3 是否在HashSet中：是', 2)).toEqual({ value: 3, exists: true, direction: 'successor' });
  });

  it('marks the next integer as missing when the current run ends', () => {
    expect(getMembershipCue('检查 4 是否在HashSet中：否，退出循环', 3)).toEqual({ value: 4, exists: false, direction: 'successor' });
  });

  it('marks the predecessor as present when a number is not a run start', () => {
    expect(getMembershipCue('3 在HashSet中，跳过 4（它不是序列起点）', 4)).toEqual({ value: 3, exists: true, direction: 'predecessor' });
  });

  it('marks the predecessor as missing when a number starts a run', () => {
    expect(getMembershipCue('0 不在HashSet中，1 是一个序列的起点', 1)).toEqual({ value: 0, exists: false, direction: 'predecessor' });
  });

  it('does not draw a membership cue for unrelated steps', () => {
    expect(getMembershipCue('遍历HashSet中的数字 2', 2)).toBeNull();
  });
});
