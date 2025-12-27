/**
 * 动画工具模块
 * 提供粒子效果、脉冲动画、轨迹绘制等功能
 */

import * as d3 from 'd3';
import { ParticleEffect, PulseAnimation, PointerTrail, LabelBounds, SmartLabel, AnnotationPosition } from '../types';

// ==================== 粒子动画 ====================

/**
 * 创建粒子效果
 */
export function createParticle(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  value: string | number,
  color: string = '#ffa116',
  duration: number = 800
): ParticleEffect {
  return {
    id: `particle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sourceX,
    sourceY,
    targetX,
    targetY,
    value,
    color,
    progress: 0,
    duration
  };
}

/**
 * 绘制粒子动画
 */
export function renderParticle(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  particle: ParticleEffect,
  onComplete?: () => void
): void {
  const particleGroup = g.append('g')
    .attr('class', 'particle-effect')
    .attr('opacity', 0);

  // 计算贝塞尔曲线控制点
  const midX = (particle.sourceX + particle.targetX) / 2;
  const midY = Math.min(particle.sourceY, particle.targetY) - 30;

  // 粒子主体（发光圆点）
  particleGroup.append('circle')
    .attr('r', 8)
    .attr('fill', particle.color)
    .attr('filter', 'url(#glow)');

  // 粒子值标签
  particleGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', -12)
    .attr('fill', particle.color)
    .attr('font-size', '12px')
    .attr('font-weight', '600')
    .text(particle.value);

  // 轨迹线
  const pathData = `M ${particle.sourceX} ${particle.sourceY} Q ${midX} ${midY} ${particle.targetX} ${particle.targetY}`;
  
  g.append('path')
    .attr('class', 'particle-trail')
    .attr('d', pathData)
    .attr('fill', 'none')
    .attr('stroke', particle.color)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '5,5')
    .attr('opacity', 0.3);

  // 动画
  particleGroup
    .attr('opacity', 1)
    .transition()
    .duration(particle.duration)
    .ease(d3.easeCubicInOut)
    .attrTween('transform', () => {
      return (t: number) => {
        // 二次贝塞尔曲线插值
        const x = (1 - t) * (1 - t) * particle.sourceX + 2 * (1 - t) * t * midX + t * t * particle.targetX;
        const y = (1 - t) * (1 - t) * particle.sourceY + 2 * (1 - t) * t * midY + t * t * particle.targetY;
        return `translate(${x}, ${y})`;
      };
    })
    .on('end', () => {
      particleGroup.remove();
      g.select('.particle-trail').remove();
      onComplete?.();
    });
}

// ==================== 脉冲动画 ====================

/**
 * 应用脉冲动画到元素
 */
export function applyPulseAnimation(
  selection: d3.Selection<SVGElement, unknown, null, undefined>,
  pulse: PulseAnimation
): void {
  const animate = (count: number) => {
    if (count <= 0) return;
    
    selection
      .transition()
      .duration(pulse.duration / 2)
      .attr('fill', pulse.toColor)
      .attr('stroke', pulse.toColor)
      .transition()
      .duration(pulse.duration / 2)
      .attr('fill', pulse.fromColor)
      .attr('stroke', pulse.fromColor)
      .on('end', () => animate(count - 1));
  };
  
  animate(pulse.repeat);
}

/**
 * 创建发光滤镜
 */
export function createGlowFilter(
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
  id: string = 'glow',
  color: string = '#ffa116',
  stdDeviation: number = 3
): void {
  const filter = defs.append('filter')
    .attr('id', id)
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

  filter.append('feGaussianBlur')
    .attr('in', 'SourceGraphic')
    .attr('stdDeviation', stdDeviation)
    .attr('result', 'blur');

  filter.append('feFlood')
    .attr('flood-color', color)
    .attr('flood-opacity', '0.5')
    .attr('result', 'color');

  filter.append('feComposite')
    .attr('in', 'color')
    .attr('in2', 'blur')
    .attr('operator', 'in')
    .attr('result', 'glow');

  const merge = filter.append('feMerge');
  merge.append('feMergeNode').attr('in', 'glow');
  merge.append('feMergeNode').attr('in', 'SourceGraphic');
}

// ==================== 指针轨迹 ====================

/**
 * 绘制指针移动轨迹
 */
export function renderPointerTrail(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  trail: PointerTrail,
  animated: boolean = true
): void {
  if (trail.path.length < 2) return;

  const lineGenerator = d3.line<{ x: number; y: number }>()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveCatmullRom.alpha(0.5));

  const pathData = lineGenerator(trail.path);
  if (!pathData) return;

  // 轨迹线
  const trailPath = g.append('path')
    .attr('class', `pointer-trail-${trail.id}`)
    .attr('d', pathData)
    .attr('fill', 'none')
    .attr('stroke', trail.color)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '8,4')
    .attr('opacity', 0.6);

  if (animated) {
    const totalLength = (trailPath.node() as SVGPathElement)?.getTotalLength() || 0;
    trailPath
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);
  }

  // 当前位置指示器
  const currentPos = trail.path[trail.currentIndex] || trail.path[trail.path.length - 1];
  
  g.append('circle')
    .attr('class', `pointer-indicator-${trail.id}`)
    .attr('cx', currentPos.x)
    .attr('cy', currentPos.y)
    .attr('r', 6)
    .attr('fill', trail.color)
    .attr('filter', 'url(#glow)');

  // 指针名称标签
  g.append('text')
    .attr('class', `pointer-label-${trail.id}`)
    .attr('x', currentPos.x)
    .attr('y', currentPos.y - 15)
    .attr('text-anchor', 'middle')
    .attr('fill', trail.color)
    .attr('font-size', '11px')
    .attr('font-weight', '600')
    .text(`${trail.name}→`);
}

// ==================== 标签避让算法 ====================

/**
 * 检测两个边界框是否重叠
 */
export function boundsOverlap(a: LabelBounds, b: LabelBounds, padding: number = 4): boolean {
  return !(
    a.x + a.width + padding < b.x ||
    b.x + b.width + padding < a.x ||
    a.y + a.height + padding < b.y ||
    b.y + b.height + padding < a.y
  );
}

/**
 * 计算标签的最佳位置
 */
export function calculateOptimalPosition(
  label: SmartLabel,
  targetBounds: LabelBounds,
  existingBounds: LabelBounds[],
  _containerBounds: LabelBounds
): { position: AnnotationPosition; offset: { x: number; y: number } } {
  const positions: AnnotationPosition[] = ['top', 'right', 'bottom', 'left'];
  const labelWidth = label.text.length * 8 + 16;
  const labelHeight = 20;

  // 计算每个位置的边界框
  const getPositionBounds = (pos: AnnotationPosition): LabelBounds => {
    switch (pos) {
      case 'top':
        return {
          x: targetBounds.x + targetBounds.width / 2 - labelWidth / 2,
          y: targetBounds.y - labelHeight - 8,
          width: labelWidth,
          height: labelHeight
        };
      case 'bottom':
        return {
          x: targetBounds.x + targetBounds.width / 2 - labelWidth / 2,
          y: targetBounds.y + targetBounds.height + 8,
          width: labelWidth,
          height: labelHeight
        };
      case 'left':
        return {
          x: targetBounds.x - labelWidth - 8,
          y: targetBounds.y + targetBounds.height / 2 - labelHeight / 2,
          width: labelWidth,
          height: labelHeight
        };
      case 'right':
        return {
          x: targetBounds.x + targetBounds.width + 8,
          y: targetBounds.y + targetBounds.height / 2 - labelHeight / 2,
          width: labelWidth,
          height: labelHeight
        };
    }
  };

  // 优先使用首选位置
  const preferredBounds = getPositionBounds(label.preferredPosition);
  const hasOverlap = existingBounds.some(b => boundsOverlap(preferredBounds, b));
  
  if (!hasOverlap) {
    return {
      position: label.preferredPosition,
      offset: { x: 0, y: 0 }
    };
  }

  // 尝试其他位置
  for (const pos of positions) {
    if (pos === label.preferredPosition) continue;
    
    const bounds = getPositionBounds(pos);
    const overlap = existingBounds.some(b => boundsOverlap(bounds, b));
    
    if (!overlap) {
      return { position: pos, offset: { x: 0, y: 0 } };
    }
  }

  // 如果所有位置都有重叠，使用偏移
  return {
    position: label.preferredPosition,
    offset: { x: 0, y: -20 }
  };
}

// ==================== 状态颜色映射 ====================

export const stateColors = {
  idle: '#4a5568',
  active: '#ffa116',
  visited: '#38a169',
  current: '#4299e1',
  comparing: '#9f7aea',
  error: '#e53e3e',
  success: '#38a169',
  warning: '#ecc94b'
};

/**
 * 获取状态对应的颜色
 */
export function getStateColor(state: string): string {
  return stateColors[state as keyof typeof stateColors] || stateColors.idle;
}

// ==================== 缓动函数 ====================

export const easings = {
  easeInOut: d3.easeCubicInOut,
  easeOut: d3.easeCubicOut,
  easeIn: d3.easeCubicIn,
  elastic: d3.easeElasticOut,
  bounce: d3.easeBounceOut,
  linear: d3.easeLinear
};
