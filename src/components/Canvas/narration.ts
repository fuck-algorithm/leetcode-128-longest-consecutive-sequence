import { VisualizationState } from '../../types';

type Narration = { action: string; message: string };

export function getStepNarration(description: string, highlighted: number[], state: VisualizationState): Narration {
  const value = highlighted[0];
  if (description.includes('HashSet中') && description.includes('起点')) {
    return {
      action: '判断起点',
      message: description.includes('是一个序列的起点')
        ? `${value} 左侧没有 ${value - 1}，从这里开始向右扩展。`
        : `${value - 1} 已在集合中，跳过 ${value}，避免重复计数。`,
    };
  }
  if (description.includes('是否在HashSet中：是')) {
    return { action: '找到下一个数', message: `集合中有 ${value + 1}，连续段向右延伸一格。` };
  }
  if (description.includes('是否在HashSet中：否')) {
    return { action: '连续段结束', message: `集合中没有 ${value + 1}，当前连续段到 ${value} 为止。` };
  }
  if (description.startsWith('将数字')) {
    const match = description.match(/将数字 (-?\d+)/);
    return { action: '加入集合', message: `把 ${match?.[1] ?? value} 放入 HashSet，供后续常数时间查找。` };
  }
  if (description.includes('当前构建') || description.includes('currentNum =')) {
    return { action: '推进序列', message: `当前连续段包含 ${state.currentSequence.join(' → ')}，长度为 ${state.currentSequence.length}。` };
  }
  if (description.includes('更新最长序列')) {
    return { action: '刷新纪录', message: `新长度 ${state.longestSequence.length} 超过旧纪录，最长段更新为 ${state.longestSequence.join(' → ')}。` };
  }
  if (description.includes('不更新')) {
    return { action: '保留纪录', message: `当前段长度没有超过 ${state.longestSequence.length}，最长段保持不变。` };
  }
  if (description.includes('返回最长连续序列长度')) {
    return { action: '完成', message: `最长连续段长度是 ${state.longestSequence.length}。` };
  }
  if (description.includes('创建一个空的HashSet')) {
    return { action: '初始化', message: '先建立查找集合；接下来把数组中的数字逐个放入。' };
  }
  if (description.includes('初始化最长序列长度')) {
    return { action: '设置初值', message: '最长长度从 0 开始，后续只在发现更长连续段时更新。' };
  }
  if (description.includes('遍历HashSet')) {
    return { action: '检查候选数', message: `查看 ${value} 左侧是否有前驱，决定它是不是一段连续数的起点。` };
  }
  return { action: '本步操作', message: description };
}
