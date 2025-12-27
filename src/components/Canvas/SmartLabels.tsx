/**
 * 智能标签渲染模块
 * 支持自动避让、上下文敏感显示
 */

import * as d3 from 'd3';
import { SmartLabel, LabelBounds, AnnotationPosition, StateTag, StateLabelType } from '../../types';
import { calculateOptimalPosition } from '../../utils/animation';

// 状态标签配置
const stateLabelConfig: Record<StateLabelType, { text: string; color: string; bgColor: string }> = {
  recursing: { text: '递归中', color: '#ffffff', bgColor: '#9f7aea' },
  visited: { text: '已访问', color: '#ffffff', bgColor: '#38a169' },
  queued: { text: '队列中', color: '#ffffff', bgColor: '#4299e1' },
  processing: { text: '处理中', color: '#1a1a2e', bgColor: '#ffa116' },
  completed: { text: '已完成', color: '#ffffff', bgColor: '#38a169' },
  skipped: { text: '已跳过', color: '#ffffff', bgColor: '#718096' }
};

/**
 * 渲染智能标签
 */
export function renderSmartLabels(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  labels: SmartLabel[],
  elementBounds: Map<string, LabelBounds>,
  containerBounds: LabelBounds,
  currentStepId?: string
): void {
  // 清除旧标签
  g.selectAll('.smart-label').remove();

  // 按优先级排序
  const sortedLabels = [...labels].sort((a, b) => b.priority - a.priority);
  
  // 已放置的标签边界
  const placedBounds: LabelBounds[] = [];

  sortedLabels.forEach(label => {
    // 检查上下文敏感性
    if (label.contextSensitive && label.showOnSteps) {
      if (!currentStepId || !label.showOnSteps.includes(currentStepId)) {
        return;
      }
    }

    if (!label.visible) return;

    const targetBounds = elementBounds.get(label.targetId);
    if (!targetBounds) return;

    // 计算最佳位置
    const { position, offset } = calculateOptimalPosition(
      label,
      targetBounds,
      placedBounds,
      containerBounds
    );

    // 计算标签位置
    const labelPos = calculateLabelPosition(targetBounds, position, offset);
    
    // 估算标签尺寸
    const labelWidth = label.text.length * 8 + 16;
    const labelHeight = 22;

    // 记录已放置的边界
    placedBounds.push({
      x: labelPos.x - labelWidth / 2,
      y: labelPos.y - labelHeight / 2,
      width: labelWidth,
      height: labelHeight
    });

    // 渲染标签
    const labelGroup = g.append('g')
      .attr('class', 'smart-label')
      .attr('transform', `translate(${labelPos.x}, ${labelPos.y})`);

    // 标签背景
    labelGroup.append('rect')
      .attr('x', -labelWidth / 2)
      .attr('y', -labelHeight / 2)
      .attr('width', labelWidth)
      .attr('height', labelHeight)
      .attr('rx', 4)
      .attr('fill', 'rgba(45, 55, 72, 0.95)')
      .attr('stroke', '#4a5568')
      .attr('stroke-width', 1);

    // 标签文本
    labelGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', '#e2e8f0')
      .attr('font-size', '11px')
      .text(label.text);

    // 连接线
    const connectorEnd = getConnectorEndpoint(targetBounds, position);
    
    labelGroup.append('line')
      .attr('x1', 0)
      .attr('y1', position === 'top' ? labelHeight / 2 : position === 'bottom' ? -labelHeight / 2 : 0)
      .attr('x2', connectorEnd.x - labelPos.x)
      .attr('y2', connectorEnd.y - labelPos.y)
      .attr('stroke', '#4a5568')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,2');
  });
}

/**
 * 渲染状态标签
 */
export function renderStateTags(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  tags: StateTag[],
  elementBounds: Map<string, LabelBounds>
): void {
  g.selectAll('.state-tag').remove();

  tags.forEach(tag => {
    const bounds = elementBounds.get(tag.elementId);
    if (!bounds) return;

    const config = stateLabelConfig[tag.type];
    const tagWidth = config.text.length * 10 + 12;
    const tagHeight = 18;

    const tagGroup = g.append('g')
      .attr('class', 'state-tag')
      .attr('transform', `translate(${bounds.x + bounds.width / 2}, ${bounds.y - tagHeight - 4})`);

    // 标签背景
    tagGroup.append('rect')
      .attr('x', -tagWidth / 2)
      .attr('y', -tagHeight / 2)
      .attr('width', tagWidth)
      .attr('height', tagHeight)
      .attr('rx', 9)
      .attr('fill', config.bgColor);

    // 标签文本
    tagGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', config.color)
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text(`[${config.text}]`);
  });
}

/**
 * 渲染比较操作标注
 */
export function renderComparisonAnnotation(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  leftValue: number | string,
  rightValue: number | string,
  operator: string,
  result: boolean,
  position: { x: number; y: number }
): void {
  g.selectAll('.comparison-annotation').remove();

  const annotationGroup = g.append('g')
    .attr('class', 'comparison-annotation')
    .attr('transform', `translate(${position.x}, ${position.y})`);

  const text = `${leftValue} ${operator} ${rightValue}`;
  const resultText = result ? '✓ true' : '✗ false';
  const resultColor = result ? '#38a169' : '#e53e3e';

  // 背景
  const bgWidth = Math.max(text.length, resultText.length) * 9 + 24;
  const bgHeight = 50;

  annotationGroup.append('rect')
    .attr('x', -bgWidth / 2)
    .attr('y', -bgHeight / 2)
    .attr('width', bgWidth)
    .attr('height', bgHeight)
    .attr('rx', 6)
    .attr('fill', 'rgba(45, 55, 72, 0.95)')
    .attr('stroke', resultColor)
    .attr('stroke-width', 2);

  // 比较表达式
  annotationGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('y', -8)
    .attr('fill', '#e2e8f0')
    .attr('font-size', '13px')
    .attr('font-weight', '500')
    .text(text);

  // 结果
  annotationGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('y', 14)
    .attr('fill', resultColor)
    .attr('font-size', '12px')
    .attr('font-weight', '600')
    .text(resultText);

  // 入场动画
  annotationGroup
    .attr('opacity', 0)
    .attr('transform', `translate(${position.x}, ${position.y - 10})`)
    .transition()
    .duration(300)
    .attr('opacity', 1)
    .attr('transform', `translate(${position.x}, ${position.y})`);
}

/**
 * 渲染数据流标注
 */
export function renderDataFlowLabel(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  fromPos: { x: number; y: number },
  toPos: { x: number; y: number },
  label: string,
  color: string = '#4299e1'
): void {
  const midX = (fromPos.x + toPos.x) / 2;
  const midY = (fromPos.y + toPos.y) / 2 - 15;

  const labelGroup = g.append('g')
    .attr('class', 'data-flow-label')
    .attr('transform', `translate(${midX}, ${midY})`);

  const labelWidth = label.length * 8 + 12;
  const labelHeight = 18;

  // 背景
  labelGroup.append('rect')
    .attr('x', -labelWidth / 2)
    .attr('y', -labelHeight / 2)
    .attr('width', labelWidth)
    .attr('height', labelHeight)
    .attr('rx', 9)
    .attr('fill', color)
    .attr('opacity', 0.9);

  // 文本
  labelGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', 4)
    .attr('fill', '#ffffff')
    .attr('font-size', '10px')
    .attr('font-weight', '600')
    .text(label);
}

// ==================== 辅助函数 ====================

function calculateLabelPosition(
  targetBounds: LabelBounds,
  position: AnnotationPosition,
  offset: { x: number; y: number }
): { x: number; y: number } {
  const gap = 25;
  
  switch (position) {
    case 'top':
      return {
        x: targetBounds.x + targetBounds.width / 2 + offset.x,
        y: targetBounds.y - gap + offset.y
      };
    case 'bottom':
      return {
        x: targetBounds.x + targetBounds.width / 2 + offset.x,
        y: targetBounds.y + targetBounds.height + gap + offset.y
      };
    case 'left':
      return {
        x: targetBounds.x - gap + offset.x,
        y: targetBounds.y + targetBounds.height / 2 + offset.y
      };
    case 'right':
      return {
        x: targetBounds.x + targetBounds.width + gap + offset.x,
        y: targetBounds.y + targetBounds.height / 2 + offset.y
      };
  }
}

function getConnectorEndpoint(
  bounds: LabelBounds,
  position: AnnotationPosition
): { x: number; y: number } {
  switch (position) {
    case 'top':
      return { x: bounds.x + bounds.width / 2, y: bounds.y };
    case 'bottom':
      return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height };
    case 'left':
      return { x: bounds.x, y: bounds.y + bounds.height / 2 };
    case 'right':
      return { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 };
  }
}
