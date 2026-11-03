import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { VisualizationState, LabelBounds, DataScaleLevel } from '../../types';
import { getCanvasLayout } from './layout';
import { getStepNarration } from './narration';
import { getInsertionCue, getMembershipCue } from './flow';
import { createGlowFilter, stateColors } from '../../utils/animation';
import './Canvas.css';

interface CanvasProps {
  visualization: VisualizationState;
  stepDescription: string;
  showCode: boolean;
  showContext: boolean;
  onToggleCode: () => void;
  onToggleContext: () => void;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

// 自适应渲染配置
function getDataScaleLevel(dataSize: number): DataScaleLevel {
  if (dataSize <= 10) return 'small';
  if (dataSize <= 30) return 'medium';
  return 'large';
}

function getRenderConfig(scale: DataScaleLevel) {
  switch (scale) {
    case 'small':
      return { cellSize: 50, fontSize: 14, showAllLabels: true, spacing: 4 };
    case 'medium':
      return { cellSize: 45, fontSize: 13, showAllLabels: true, spacing: 3 };
    case 'large':
      return { cellSize: 38, fontSize: 11, showAllLabels: false, spacing: 2 };
  }
}

export function Canvas({ visualization, stepDescription, showCode, showContext, onToggleCode, onToggleContext }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const elementBoundsRef = useRef<Map<string, LabelBounds>>(new Map());
  const prevVisualizationRef = useRef<VisualizationState | null>(null);

  // 计算数据规模和渲染配置
  const renderConfig = useMemo(() => {
    const dataSize = visualization.originalArray.length + (visualization.hashSetNumbers?.length || 0);
    const scale = getDataScaleLevel(dataSize);
    return getRenderConfig(scale);
  }, [visualization.originalArray.length, visualization.hashSetNumbers?.length]);

  // 处理鼠标滚轮缩放
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, prev.scale * scaleFactor))
    }));
  }, []);

  // 处理拖动开始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  }, [transform.x, transform.y]);

  // 处理拖动
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  }, [isDragging, dragStart]);

  // 处理拖动结束
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 重置视图
  const handleReset = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  // 添加滚轮事件监听
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Track the drawable area independently from the fixed SVG viewBox.
  useEffect(() => {
    const wrapper = containerRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver(([entry]) => {
      setCanvasSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  // D3可视化渲染
  useEffect(() => {
    if (!svgRef.current || canvasSize.width <= 0 || canvasSize.height <= 0) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = canvasSize;
    const scale = Math.min(width / 1200, height / 720);
    const canvasScale = 1 / scale;
    const viewWidth = width / scale;
    const viewHeight = height / scale;

    // 清除之前的内容
    svg.selectAll('*').remove();
    elementBoundsRef.current.clear();

    // 定义滤镜和标记
    const defs = svg.append('defs');
    
    // 创建发光滤镜
    createGlowFilter(defs, 'glow', '#ffa116', 3);
    createGlowFilter(defs, 'glow-blue', '#4299e1', 3);
    createGlowFilter(defs, 'glow-green', '#38a169', 3);
    
    // 指针箭头
    defs.append('marker')
      .attr('id', 'pointer-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#ffa116');

    // 数据流箭头
    defs.append('marker')
      .attr('id', 'flow-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#4299e1');

    // 明确表示当前数字与候选后继的关系。
    defs.append('marker')
      .attr('id', 'compare-arrow')
      .attr('viewBox', '0 -6 12 12')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-6L12,0L0,6')
      .attr('fill', '#38a169');

    const { originalArray, hashSetNumbers = [], highlightedNumbers = [], currentSequence, longestSequence } = visualization;
    const { cellSize, fontSize, showAllLabels, spacing } = renderConfig;
    const layout = getCanvasLayout(viewWidth, viewHeight, originalArray.length, hashSetNumbers.length, cellSize, currentSequence.length, longestSequence.length);
    const { arrayY, hashSetY, sequenceY, longestSequenceY, legendY, cellWidth, arrayStartX, hashSetStartX, hashSetCellSize, hashSetColumns, sequenceCellWidth, sequenceStartX, longestSequenceStartX, membershipY } = layout;
    const hashSetCols = hashSetColumns;
    svg.attr('viewBox', `${-viewWidth / 2} ${-viewHeight / 2} ${viewWidth} ${viewHeight}`);
    const g = svg.append('g')
      .attr('transform', `translate(${transform.x}, ${transform.y}) scale(${canvasScale * transform.scale})`);

    // 检测是否有变化（用于动画）
    const prevVis = prevVisualizationRef.current;
    const hasNewHighlight = prevVis &&
      JSON.stringify(prevVis.highlightedNumbers) !== JSON.stringify(highlightedNumbers);

    // ==================== 绘制原始数组 ====================
    const cellHeight = cellSize - 10;

    // 原始数组标题
    g.append('text')
      .attr('x', 0)
      .attr('y', arrayY - 50)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a0aec0')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text('原始数组 nums[]');

    // 绘制原始数组单元格
    originalArray.forEach((item, i) => {
      const x = arrayStartX + i * cellWidth;
      const num = typeof item === 'number' ? item : item.value;
      const isHighlighted = highlightedNumbers.includes(num);
      const isInCurrentSeq = currentSequence.includes(num);
      const isInLongestSeq = longestSequence.includes(num);
      const elementId = `array-${i}`;
      const isBeingInserted = stepDescription.startsWith('将数字') && highlightedNumbers[0] === num;

      // 记录元素边界
      elementBoundsRef.current.set(elementId, {
        x, y: arrayY, width: cellWidth - spacing, height: cellHeight
      });

      // Highlight the input value being examined; prior values remain readable.
      const rect = g.append('rect')
        .attr('x', x)
        .attr('y', arrayY)
        .attr('width', cellWidth - spacing)
        .attr('height', cellHeight)
        .attr('rx', 4)
        .attr('fill', isHighlighted ? stateColors.active : isInLongestSeq ? stateColors.success : isInCurrentSeq ? stateColors.current : '#2d3748')
        .attr('stroke', isHighlighted ? '#ffb84d' : '#4a5568')
        .attr('stroke-width', isHighlighted ? 2 : 1);

      if (isHighlighted && hasNewHighlight) {
        rect.attr('filter', 'url(#glow)')
          .attr('opacity', 0.65)
          .transition('focus')
          .duration(240)
          .attr('opacity', 1)
          .attr('stroke-width', 3)
          .transition()
          .duration(180)
          .attr('stroke-width', 2);
      }

      // 数字
      g.append('text')
        .attr('x', x + (cellWidth - spacing) / 2)
        .attr('y', arrayY + cellHeight / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', isHighlighted ? '#1a1a2e' : '#e2e8f0')
        .attr('font-size', `${fontSize}px`)
        .attr('font-weight', isHighlighted ? '600' : '400')
        .text(num);

      if (isBeingInserted) {
        const source = { x: x + (cellWidth - spacing) / 2, y: arrayY + cellHeight / 2 };
        const targetIndex = hashSetNumbers.indexOf(num);
        const target = targetIndex >= 0
          ? { x: hashSetStartX + (targetIndex % hashSetCols) * hashSetCellSize + hashSetCellSize / 2, y: hashSetY + Math.floor(targetIndex / hashSetCols) * hashSetCellSize + hashSetCellSize / 2 }
          : { x: hashSetStartX + hashSetCellSize / 2, y: hashSetY + hashSetCellSize / 2 };
        const curveY = (source.y + target.y) / 2;
        const path = `M${source.x},${source.y + cellHeight / 2} Q${source.x},${curveY} ${target.x},${target.y - hashSetCellSize / 2}`;
        const cue = g.append('g').attr('class', 'insertion-flow').attr('aria-label', `将 ${num} 加入 HashSet`);
        cue.append('path').attr('d', path).attr('fill', 'none').attr('stroke', '#63c49a').attr('stroke-width', 3)
          .attr('stroke-dasharray', '8 5').attr('marker-end', 'url(#compare-arrow)');
        cue.append('rect').attr('x', (source.x + target.x) / 2 - 28).attr('y', curveY - 13).attr('width', 56).attr('height', 18)
          .attr('rx', 5).attr('fill', '#17362c').attr('stroke', '#63c49a').attr('stroke-width', 1.5);
        cue.append('text').attr('x', (source.x + target.x) / 2).attr('y', curveY).attr('text-anchor', 'middle')
          .attr('fill', '#f1f4f1').attr('font-size', 9).attr('font-weight', 700).text(`加入 ${num}`);
      }

      // 索引
      if (showAllLabels || isHighlighted) {
        g.append('text')
          .attr('x', x + (cellWidth - spacing) / 2)
          .attr('y', arrayY + cellHeight + 16)
          .attr('text-anchor', 'middle')
          .attr('fill', '#6b7280')
          .attr('font-size', '11px')
          .text(`[${i}]`);
      }

    });

    // ==================== 绘制HashSet ====================

    // HashSet标题
    g.append('text')
      .attr('x', 0)
      .attr('y', hashSetY - 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a0aec0')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text(`HashSet (size: ${hashSetNumbers.length})`);

    // 绘制HashSet单元格
    hashSetNumbers.forEach((num, i) => {
      const col = i % hashSetCols;
      const row = Math.floor(i / hashSetCols);
      const x = hashSetStartX + col * hashSetCellSize;
      const y = hashSetY + row * hashSetCellSize;
      const isHighlighted = highlightedNumbers.includes(num);
      const isInCurrentSeq = currentSequence.includes(num);
      const isInLongestSeq = longestSequence.includes(num);
      const elementId = `hashset-${num}`;

      // 记录元素边界
      elementBoundsRef.current.set(elementId, {
        x, y, width: hashSetCellSize - spacing, height: hashSetCellSize - spacing
      });

      // 单元格背景
      const rect = g.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', hashSetCellSize - spacing)
        .attr('height', hashSetCellSize - spacing)
        .attr('rx', 6)
        .attr('fill', isHighlighted ? stateColors.active : isInLongestSeq ? stateColors.success : isInCurrentSeq ? stateColors.current : '#374151')
        .attr('stroke', isHighlighted ? '#ffb84d' : isInLongestSeq ? '#48bb78' : isInCurrentSeq ? '#63b3ed' : '#4a5568')
        .attr('stroke-width', isHighlighted || isInCurrentSeq || isInLongestSeq ? 2 : 1);

      // 高亮脉冲动画
      if (isHighlighted && hasNewHighlight) {
        rect.attr('filter', 'url(#glow)');
      }

      // 数字
      g.append('text')
        .attr('x', x + (hashSetCellSize - spacing) / 2)
        .attr('y', y + (hashSetCellSize - spacing) / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', isHighlighted ? '#1a1a2e' : '#e2e8f0')
        .attr('font-size', `${fontSize - 1}px`)
        .attr('font-weight', isHighlighted ? '600' : '400')
        .text(num);
    });

    if (stepDescription.includes('已存在，跳过重复项')) {
      const value = highlightedNumbers[0];
      const arrayIndex = originalArray.findIndex((item) => (typeof item === 'number' ? item : item.value) === value && hashSetNumbers.indexOf(value) !== -1);
      const setIndex = hashSetNumbers.indexOf(value);
      if (arrayIndex >= 0 && setIndex >= 0) {
        const sourceX = arrayStartX + arrayIndex * cellWidth + cellWidth / 2;
        const sourceY = arrayY + cellHeight;
        const targetX = hashSetStartX + (setIndex % hashSetCols) * hashSetCellSize + hashSetCellSize / 2;
        const targetY = hashSetY + Math.floor(setIndex / hashSetCols) * hashSetCellSize;
        const cueY = (sourceY + targetY) / 2;
        const cue = g.append('g').attr('class', 'duplicate-skip-cue').attr('aria-label', `数组中的 ${value} 与 HashSet 中已有的 ${value} 相同，跳过重复项`);
        cue.append('path').attr('d', `M${sourceX},${sourceY} Q${sourceX},${cueY} ${targetX},${targetY - 2}`)
          .attr('fill', 'none').attr('stroke', '#d59a54').attr('stroke-width', 2.5).attr('stroke-dasharray', '6 4').attr('marker-end', 'url(#pointer-arrow)');
        cue.append('rect').attr('x', (sourceX + targetX) / 2 - 42).attr('y', cueY - 11).attr('width', 84).attr('height', 20).attr('rx', 5)
          .attr('fill', '#392d1e').attr('stroke', '#d59a54');
        cue.append('text').attr('x', (sourceX + targetX) / 2).attr('y', cueY + 3).attr('text-anchor', 'middle')
          .attr('fill', '#f1f4f1').attr('font-size', 9).attr('font-weight', 700).text('已收录，跳过');
      }
    }

    // Draw one labeled relation for the exact membership check in this frame.
    const insertionCue = getInsertionCue(stepDescription);
    if (insertionCue) {
      const sourceIndex = originalArray.findIndex((item) => (typeof item === 'number' ? item : item.value) === insertionCue.value && !hashSetNumbers.slice(0, -1).includes(insertionCue.value));
      const sourceX = arrayStartX + sourceIndex * cellWidth + cellWidth / 2;
      const sourceY = arrayY + cellHeight;
      const targetIndex = hashSetNumbers.indexOf(insertionCue.value);
      const targetX = targetIndex >= 0
        ? hashSetStartX + (targetIndex % hashSetCols) * hashSetCellSize + hashSetCellSize / 2
        : hashSetStartX + hashSetCellSize / 2;
      const targetY = targetIndex >= 0
        ? hashSetY + Math.floor(targetIndex / hashSetCols) * hashSetCellSize
        : hashSetY;
      const midY = (sourceY + targetY) / 2;
      const label = `加入 ${insertionCue.value}`;
      const labelX = (sourceX + targetX) / 2;
      const cue = g.append('g').attr('class', 'insertion-flow').attr('aria-label', label);
      cue.append('path')
        .attr('d', `M${sourceX},${sourceY} Q${sourceX},${midY} ${targetX},${targetY - 2}`)
        .attr('fill', 'none').attr('stroke', '#63c49a').attr('stroke-width', 3)
        .attr('stroke-dasharray', '8 5').attr('marker-end', 'url(#compare-arrow)');
      cue.append('rect').attr('x', labelX - 28).attr('y', midY - 13).attr('width', 56).attr('height', 18)
        .attr('rx', 5).attr('fill', '#17362c').attr('stroke', '#63c49a').attr('stroke-width', 1.5);
      cue.append('text').attr('x', labelX).attr('y', midY).attr('text-anchor', 'middle')
        .attr('fill', '#f1f4f1').attr('font-size', 9).attr('font-weight', 700).text(label);
    }

    const membershipCue = getMembershipCue(stepDescription, highlightedNumbers[0]);
    if (membershipCue) {
      const currentIndex = hashSetNumbers.indexOf(highlightedNumbers[0]);
      const targetIndex = hashSetNumbers.indexOf(membershipCue.value);
      const currentPoint = currentIndex >= 0
        ? { x: hashSetStartX + (currentIndex % hashSetCols) * hashSetCellSize + hashSetCellSize / 2, y: hashSetY + Math.floor(currentIndex / hashSetCols) * hashSetCellSize + hashSetCellSize / 2 }
        : null;
      const targetPoint = targetIndex >= 0
        ? { x: hashSetStartX + (targetIndex % hashSetCols) * hashSetCellSize + hashSetCellSize / 2, y: hashSetY + Math.floor(targetIndex / hashSetCols) * hashSetCellSize + hashSetCellSize / 2 }
        : null;
      const anchorPoint = membershipCue.direction === 'predecessor' ? currentPoint : currentPoint;

      if (anchorPoint && targetPoint) {
        const radius = hashSetCellSize * .38;
        const label = membershipCue.direction === 'predecessor'
          ? (membershipCue.exists ? `前驱 ${membershipCue.value} 存在` : `无前驱 ${membershipCue.value}`)
          : (membershipCue.exists ? `后继 ${membershipCue.value} 存在` : `无后继 ${membershipCue.value}`);
        const labelWidth = label.length * 9 + 18;
        const stroke = membershipCue.exists ? '#63c49a' : '#d59a54';
        const connector = g.append('g').attr('class', 'membership-relationship').attr('aria-label', label);
        if (membershipCue.direction === 'successor') {
          const routeY = membershipY;
          const pathData = `M${anchorPoint.x},${anchorPoint.y + radius} Q${(anchorPoint.x + targetPoint.x) / 2},${routeY} ${targetPoint.x},${targetPoint.y + radius}`;
          const badgeX = (anchorPoint.x + targetPoint.x) / 2;
          const badgeY = routeY + 4;
          connector.append('path').attr('d', pathData).attr('fill', 'none').attr('stroke', stroke)
            .attr('stroke-width', 3).attr('stroke-dasharray', membershipCue.exists ? 'none' : '7 5')
            .attr('marker-end', `url(#${membershipCue.exists ? 'compare-arrow' : 'pointer-arrow'})`);
          connector.append('rect').attr('x', badgeX - labelWidth / 2).attr('y', badgeY - 10)
            .attr('width', labelWidth).attr('height', 15).attr('rx', 5)
            .attr('fill', membershipCue.exists ? '#17362c' : '#392d1e').attr('stroke', stroke).attr('stroke-width', 1.5);
          connector.append('text').attr('x', badgeX).attr('y', badgeY + 1).attr('text-anchor', 'middle')
            .attr('fill', '#f1f4f1').attr('font-size', 7).attr('font-weight', 700).text(label);
        } else {
          const routeY = membershipY;
          const pathData = `M${anchorPoint.x},${anchorPoint.y + radius} L${anchorPoint.x},${routeY} L${targetPoint.x},${routeY} L${targetPoint.x},${targetPoint.y + radius}`;
          const badgeX = (anchorPoint.x + targetPoint.x) / 2;
          const badgeY = routeY + 15;
          connector.append('path').attr('d', pathData).attr('fill', 'none').attr('stroke', stroke)
            .attr('stroke-width', 3).attr('stroke-dasharray', membershipCue.exists ? 'none' : '7 5')
            .attr('marker-end', `url(#${membershipCue.exists ? 'compare-arrow' : 'pointer-arrow'})`);
          connector.append('rect').attr('x', badgeX - labelWidth / 2).attr('y', badgeY - 13)
            .attr('width', labelWidth).attr('height', 20).attr('rx', 5)
            .attr('fill', membershipCue.exists ? '#17362c' : '#392d1e').attr('stroke', stroke).attr('stroke-width', 1.5);
          connector.append('text').attr('x', badgeX).attr('y', badgeY + 1).attr('text-anchor', 'middle')
            .attr('fill', '#f1f4f1').attr('font-size', 9).attr('font-weight', 700).text(label);
        }
      } else if (currentPoint) {
        const label = `缺少 ${membershipCue.value}`;
        const ghostWidth = Math.max(48, label.length * 9 + 14);
        const ghostHeight = 24;
        const ghostCenterY = membershipY;
        const ghostTop = ghostCenterY - ghostHeight / 2;
        const sourceY = currentPoint.y + hashSetCellSize * .38;
        const cue = g.append('g')
          .attr('class', 'missing-membership-cue')
          .attr('aria-label', `${membershipCue.direction === 'predecessor' ? '前驱' : '后继'} ${membershipCue.value} 缺失`);
        cue.append('path')
          .attr('d', `M${currentPoint.x},${sourceY} L${currentPoint.x},${ghostTop - 3}`)
          .attr('fill', 'none').attr('stroke', '#d59a54').attr('stroke-width', 3)
          .attr('stroke-dasharray', '7 5').attr('marker-end', 'url(#pointer-arrow)');
        cue.append('rect')
          .attr('x', currentPoint.x - ghostWidth / 2).attr('y', ghostTop)
          .attr('width', ghostWidth).attr('height', ghostHeight).attr('rx', 5)
          .attr('fill', '#392d1e').attr('stroke', '#d59a54').attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '5 3');
        cue.append('text').attr('x', currentPoint.x).attr('y', ghostCenterY + 4).attr('text-anchor', 'middle')
          .attr('fill', '#f1f4f1').attr('font-size', 9).attr('font-weight', 700).text(label);
      }
    }

    // ==================== 绘制当前序列 ====================
    if (currentSequence.length > 1) {
      const seqY = sequenceY;
      const seqCellWidth = sequenceCellWidth;
      const seqStartX = sequenceStartX;

      // 当前序列标题
      g.append('text')
        .attr('x', 0)
        .attr('y', seqY - 25)
        .attr('text-anchor', 'middle')
        .attr('fill', '#4299e1')
        .attr('font-size', '13px')
        .attr('font-weight', '600')
        .text('当前构建的连续序列');

      currentSequence.forEach((num, i) => {
        const x = seqStartX + i * seqCellWidth;
        
        // 序列元素
        g.append('rect')
          .attr('x', x)
          .attr('y', seqY)
          .attr('width', seqCellWidth - 14)
          .attr('height', 35)
          .attr('rx', 4)
          .attr('fill', '#4299e1')
          .attr('stroke', '#63b3ed')
          .attr('stroke-width', 2);

        g.append('text')
          .attr('x', x + (seqCellWidth - 14) / 2)
          .attr('y', seqY + 22)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', `${fontSize}px`)
          .attr('font-weight', '600')
          .text(num);

        if (i < currentSequence.length - 1) {
          const arrowStartX = x + seqCellWidth - 13;
          const arrowEndX = x + seqCellWidth + 3;
          const arrowY = seqY + 17;
          g.append('line').attr('x1', arrowStartX).attr('y1', arrowY).attr('x2', arrowEndX).attr('y2', arrowY).attr('stroke', '#4299e1').attr('stroke-width', 2).attr('marker-end', 'url(#flow-arrow)');
        }
      });

      // 序列长度标注
      g.append('text')
        .attr('x', seqStartX + currentSequence.length * seqCellWidth + 15)
        .attr('y', seqY + 22)
        .attr('text-anchor', 'start')
        .attr('fill', '#4299e1')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text(`长度: ${currentSequence.length}`);
    }

    // ==================== 绘制最长序列 ====================
    const longestSeqY = longestSequenceY;
    
    if (longestSequence.length > 0) {
      const seqCellWidth = sequenceCellWidth;
      const seqStartX = longestSequenceStartX;

      // 最长序列标题
      g.append('text')
        .attr('x', 0)
        .attr('y', longestSeqY - 25)
        .attr('text-anchor', 'middle')
        .attr('fill', '#38a169')
        .attr('font-size', '13px')
        .attr('font-weight', '600')
        .text('✓ 最长连续序列');

      longestSequence.forEach((num, i) => {
        const x = seqStartX + i * seqCellWidth;
        
        // 序列元素
        g.append('rect')
          .attr('x', x)
          .attr('y', longestSeqY)
          .attr('width', seqCellWidth - 14)
          .attr('height', 35)
          .attr('rx', 4)
          .attr('fill', '#38a169')
          .attr('stroke', '#48bb78')
          .attr('stroke-width', 2)
          .attr('filter', 'url(#glow-green)');

        g.append('text')
          .attr('x', x + (seqCellWidth - 14) / 2)
          .attr('y', longestSeqY + 22)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', `${fontSize}px`)
          .attr('font-weight', '600')
          .text(num);

        // 绘制连接箭头
        if (i < longestSequence.length - 1) {
          const arrowStartX = x + seqCellWidth - 13;
          const arrowEndX = x + seqCellWidth + 3;
          const arrowY = longestSeqY + 17;

          g.append('line')
            .attr('x1', arrowStartX)
            .attr('y1', arrowY)
            .attr('x2', arrowEndX)
            .attr('y2', arrowY)
            .attr('stroke', '#38a169')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#compare-arrow)');
        }
      });

      // 序列长度标注
      g.append('text')
        .attr('x', seqStartX + longestSequence.length * seqCellWidth + 15)
        .attr('y', longestSeqY + 22)
        .attr('text-anchor', 'start')
        .attr('fill', '#38a169')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text(`长度: ${longestSequence.length}`);
    }

    if (stepDescription.startsWith('比较当前长度') && currentSequence.length > 0) {
      const comparisonMatch = stepDescription.match(/比较当前长度 (\d+) 与最长纪录 (\d+)/);
      const candidateLength = Number(comparisonMatch?.[1] ?? currentSequence.length);
      const savedLength = Number(comparisonMatch?.[2] ?? longestSequence.length);
      const isNewLongest = candidateLength > savedLength;
      const sourceX = Math.min(sequenceStartX + currentSequence.length * sequenceCellWidth + 12, viewWidth / 2 - 40);
      const targetX = Math.min(longestSequenceStartX + longestSequence.length * sequenceCellWidth + 12, viewWidth / 2 - 40);
      const routeX = Math.max(sourceX, targetX) + 24;
      const labelY = (sequenceY + longestSequenceY) / 2 + 12;
      const cue = g.append('g')
        .attr('class', 'record-comparison-cue')
        .attr('aria-label', `当前长度 ${candidateLength} ${isNewLongest ? '大于' : '小于或等于'} 最长纪录 ${savedLength}`);
      cue.append('path')
        .attr('d', `M${sourceX},${sequenceY + 17} C${routeX},${sequenceY + 17} ${routeX},${longestSequenceY + 17} ${targetX},${longestSequenceY + 17}`)
        .attr('fill', 'none').attr('stroke', isNewLongest ? '#63c49a' : '#d59a54').attr('stroke-width', 2.5)
        .attr('stroke-dasharray', isNewLongest ? 'none' : '6 4').attr('marker-end', `url(#${isNewLongest ? 'compare-arrow' : 'pointer-arrow'})`);
      cue.append('rect').attr('x', routeX - 58).attr('y', labelY - 10).attr('width', 116).attr('height', 20).attr('rx', 6)
        .attr('fill', isNewLongest ? '#17362c' : '#392d1e').attr('stroke', isNewLongest ? '#63c49a' : '#d59a54');
      cue.append('text').attr('x', routeX).attr('y', labelY + 4).attr('text-anchor', 'middle')
        .attr('fill', '#f1f4f1').attr('font-size', 9).attr('font-weight', 700).text('当前段 vs 最长纪录');
      cue.append('text').attr('x', routeX).attr('y', labelY + 23).attr('text-anchor', 'middle')
        .attr('fill', isNewLongest ? '#9be0bd' : '#f0c48c').attr('font-size', 10).attr('font-weight', 700)
        .text(`${candidateLength} ${isNewLongest ? '>' : '≤'} ${savedLength}`);
    }

    if (stepDescription.startsWith('更新最长序列:') && currentSequence.length > 0 && longestSequence.length > 0) {
      const labelY = longestSequenceY - 7;
      const label = g.append('g').attr('class', 'record-update-cue').attr('aria-label', `当前连续段 ${currentSequence.join(', ')} 更新最长纪录`);
      label.append('path').attr('d', `M0,${sequenceY + 36} C0,${sequenceY + 54} 0,${labelY - 22} 0,${labelY - 8}`)
        .attr('fill', 'none').attr('stroke', '#63c49a').attr('stroke-width', 3).attr('marker-end', 'url(#compare-arrow)');
      label.append('rect').attr('x', -38).attr('y', labelY - 20).attr('width', 76).attr('height', 20).attr('rx', 6)
        .attr('fill', '#17362c').attr('stroke', '#63c49a').attr('stroke-width', 1.5);
      label.append('text').attr('x', 0).attr('y', labelY - 6).attr('text-anchor', 'middle')
        .attr('fill', '#f1f4f1').attr('font-size', 10).attr('font-weight', 700).text('刷新纪录');
    }

    // ==================== 图例 ====================
    const legendItems = [
      { color: stateColors.active, label: '当前检查' },
      { color: stateColors.current, label: '当前序列' },
      { color: stateColors.success, label: '最长序列' },
    ];

    const legendItemsWidth = 3 * 126 - 18;
    const legendStartX = -legendItemsWidth / 2;
    legendItems.forEach((item, i) => {
      const x = legendStartX + i * 126;
      g.append('rect')
        .attr('x', x)
        .attr('y', legendY)
        .attr('width', 16)
        .attr('height', 16)
        .attr('rx', 3)
        .attr('fill', item.color);

      g.append('text')
        .attr('x', x + 22)
        .attr('y', legendY + 12)
        .attr('fill', '#a0aec0')
        .attr('font-size', '12px')
        .text(item.label);
    });

    // 保存当前可视化状态用于下次比较
    prevVisualizationRef.current = visualization;

  }, [visualization, stepDescription, transform, renderConfig, canvasSize]);

  const currentValues = visualization.highlightedNumbers || [];
  const narration = getStepNarration(stepDescription, currentValues, visualization);

  return (
    <div className="canvas-container">
      <div className="canvas-header">
        <span className="canvas-title">算法可视化</span>
        <div className="canvas-header-actions">
          <div className="workspace-toggles" aria-label="显示面板">
            <button type="button" className={`workspace-toggle ${showCode ? 'active' : ''}`} onClick={onToggleCode} aria-pressed={showCode} title="切换代码面板">代码</button>
            <button type="button" className={`workspace-toggle ${showContext ? 'active' : ''}`} onClick={onToggleContext} aria-pressed={showContext} title="切换调用栈与变量面板">上下文</button>
          </div>
        </div>
        <div className="canvas-controls">
          <span className="zoom-level">{Math.round(transform.scale * 100)}%</span>
          <button className="reset-view-btn" onClick={handleReset} title="重置视图">
            ⟲
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className={`canvas-wrapper ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg ref={svgRef} className="canvas-svg" />
        <div className="step-description" role="status" aria-live="polite">
          <span className="step-action">{narration.action}</span>
          <span className="step-message">{narration.message}</span>
        </div>
      </div>
    </div>
  );
}
