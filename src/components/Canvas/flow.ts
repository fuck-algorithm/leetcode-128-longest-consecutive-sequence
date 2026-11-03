export interface MembershipCue {
  value: number;
  exists: boolean;
  direction: 'predecessor' | 'successor';
}

export interface InsertionCue {
  value: number;
}

export function getInsertionCue(description: string): InsertionCue | null {
  const value = description.match(/^将数字 (-?\d+) 添加到HashSet中$/)?.[1];
  return value === undefined ? null : { value: Number(value) };
}

export function getMembershipCue(description: string, currentValue: number): MembershipCue | null {
  if (description.includes('是否在HashSet中：是') || description.includes('是否在HashSet中：否')) {
    return {
      value: currentValue + 1,
      exists: description.includes('是否在HashSet中：是'),
      direction: 'successor',
    };
  }

  if (description.includes('是一个序列的起点') || description.includes('不是序列起点')) {
    return {
      value: currentValue - 1,
      exists: description.includes('在HashSet中') && !description.includes('不在HashSet中'),
      direction: 'predecessor',
    };
  }

  return null;
}
