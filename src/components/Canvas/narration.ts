import { VisualizationState } from '../../types';

type Narration = { action: string; message: string };

export function getStepNarration(description: string, highlighted: number[], state: VisualizationState): Narration {
  const value = highlighted[0];

  if (description.includes('创建一个空的HashSet')) {
    return { action: '准备查找', message: '先把数组数字放进集合。之后检查某个数字是否存在，不必逐个扫描数组。' };
  }
  if (description.includes('初始化最长连续序列长度')) {
    return { action: '纪录从 0 开始', message: '还没有找到连续段，所以最长长度先记为 0。' };
  }
  if (description.includes('已存在，跳过重复项')) {
    return { action: `跳过重复值 ${value}`, message: `集合里已经有 ${value}，不重复收录；相同数字只按一个计算。` };
  }
  if (description.startsWith('将数字')) {
    const number = description.match(/将数字 (-?\d+)/)?.[1] ?? String(value);
    return { action: `收录 ${number}`, message: `把 ${number} 放入查找集合；后面判断它的前一个或后一个数字是否存在。` };
  }
  if (description.startsWith('遍历HashSet中的数字')) {
    return { action: `检查 ${value}`, message: `先看 ${value - 1} 在不在集合里：没有它，${value} 才是这段连续数的起点。` };
  }
  if (description.startsWith('跳过 ') && description.includes('不是连续段起点')) {
    const skipped = description.match(/跳过 (-?\d+)/)?.[1] ?? String(value);
    return { action: `跳过 ${skipped}`, message: `前驱 ${Number(skipped) - 1} 已存在，这个数字不是新连续段的起点。` };
  }
  if (description.includes('是一个序列的起点') || description.includes('不是序列起点')) {
    const isStart = description.includes('是一个序列的起点');
    return isStart
      ? { action: `${value} 是起点`, message: `集合里没有 ${value - 1}，所以这段连续数只能从 ${value} 开始；向右找后继。` }
      : { action: `${value} 不是起点`, message: `集合里有 ${value - 1}，${value} 属于从更小数字开始的那一段；跳过它，避免重复计数。` };
  }
  if (description.startsWith('初始化 currentNum')) {
    return { action: '从起点开始数', message: `当前从 ${value} 开始，先把它记作长度 1 的连续段。` };
  }
  if (description.startsWith('currentNum 从')) {
    const [, previous, next] = description.match(/currentNum 从 (-?\d+) 前进到 (-?\d+)/) ?? [];
    return { action: `指针到 ${next ?? value}`, message: `检查到 ${previous ?? '前一个数字'} 的后继存在，currentNum 前进一格。` };
  }
  if (description.startsWith('currentStreak 从')) {
    const [, previous, next] = description.match(/currentStreak 从 (\d+) 增加到 (\d+)/) ?? [];
    return { action: `长度 ${next ?? state.currentSequence.length}`, message: `连续段新增一个数字，长度从 ${previous ?? '?'} 增加到 ${next ?? state.currentSequence.length}。` };
  }
  if (description.startsWith('currentNum =')) {
    return { action: `连续段长 ${state.currentSequence.length}`, message: `找到下一个数字后，当前这段变为 ${state.currentSequence.join(' → ')}。` };
  }
  if (description.startsWith('比较当前长度')) {
    const [, current, best] = description.match(/比较当前长度 (\d+) 与最长纪录 (\d+)/) ?? [];
    return { action: `${current ?? '?'} ${Number(current) > Number(best) ? '>' : '≤'} ${best ?? '?'}`, message: `将当前连续段长度与已保存的最长长度比较，决定是否刷新纪录。` };
  }
  if (description.includes('是否在HashSet中：是')) {
    const next = value + 1;
    return { action: `找到 ${next}`, message: `集合中有 ${next}，它紧接在 ${value} 后面；把它接到当前连续段，再继续找下一个数。` };
  }
  if (description.includes('是否在HashSet中：否')) {
    const next = value + 1;
    return { action: `停在 ${value}`, message: `集合中没有 ${next}，连续段在 ${value} 结束；现在用这段的长度更新最长纪录。` };
  }
  if (description.startsWith('最长长度从')) {
    const [, previous, next] = description.match(/最长长度从 (\d+) 更新为 (\d+)/) ?? [];
    return { action: `纪录 ${next ?? state.longestSequence.length}`, message: `最长长度从 ${previous ?? '?'} 改为 ${next ?? state.longestSequence.length}，接着保存对应的连续数字。` };
  }
  if (description.startsWith('更新最长序列:')) {
    const [, current = String(state.longestSequence.length), previous = '0'] = description.match(/更新最长序列:\s*(\d+)\s*>\s*(\d+)/) ?? [];
    return { action: `新纪录 ${current}`, message: `当前段比旧纪录 ${previous} 更长；最长连续段现在是 ${state.longestSequence.join(' → ')}。` };
  }
  if (description.includes('不是序列起点')) {
    const [, predecessor, current] = description.match(/(-?\d+) 在HashSet中，(-?\d+) 不是序列起点/) ?? [];
    return { action: `跳过 ${current ?? value}`, message: `前驱 ${predecessor ?? value - 1} 已存在，这个数字不再重复扫描。` };
  }
  if (description.startsWith('不更新:')) {
    const [, current = String(state.currentSequence.length), best = String(state.longestSequence.length)] = description.match(/不更新:\s*(\d+)\s*<=\s*(\d+)/) ?? [];
    return { action: '纪录不变', message: `当前段长度 ${current} 没有超过最长长度 ${best}，所以保留原答案。` };
  }
  if (description.includes('返回最长连续序列长度')) {
    const answer = state.longestSequence.length;
    return { action: `答案：${answer}`, message: `最长连续段是 ${state.longestSequence.join(' → ')}，共有 ${answer} 个数字。` };
  }

  return { action: '算法步骤', message: description };
}
