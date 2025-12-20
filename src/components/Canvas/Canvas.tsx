import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { VisualizationState } from '../../types';
import './Canvas.css';

interface CanvasProps {
  visualization: VisualizationState;
  stepDescription: string;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export function Canvas({ visualization, stepDescription }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 处理鼠标滚轮缩放
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2, prev.scale * scaleFactor))
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

  // D3可视化渲染
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // 清除之前的内容
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${transform.x + width / 2}, ${transform.y + height / 2}) scale(${transform.scale})`);

    const { originalArray, hashSetNumbers, highlightedNumbers, currentSequence, longestSequence } = visualization;

    // 绘制原始数组
    const arrayY = -120;
    const cellWidth = 50;
    const cellHeight = 40;
    const arrayStartX = -(originalArray.length * cellWidth) / 2;

    // 原始数组标题
    g.append('text')
      .attr('x', 0)
      .attr('y', arrayY - 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a0aec0')
      .attr('font-size', '14px')
      .text('原始数组 nums[]');

    // 绘制原始数组单元格
    originalArray.forEach((num, i) => {
      const x = arrayStartX + i * cellWidth;
      const isHighlighted = highlightedNumbers.includes(num);
      const isInCurrentSeq = currentSequence.includes(num);
      const isInLongestSeq = longestSequence.includes(num);

      // 单元格背景
      g.append('rect')
        .attr('x', x)
        .attr('y', arrayY)
        .attr('width', cellWidth - 4)
        .attr('height', cellHeight)
        .attr('rx', 4)
        .attr('fill', isHighlighted ? '#ffa116' : isInLongestSeq ? '#38a169' : isInCurrentSeq ? '#4299e1' : '#2d3748')
        .attr('stroke', isHighlighted ? '#ffb84d' : '#4a5568')
        .attr('stroke-width', isHighlighted ? 2 : 1);

      // 数字
      g.append('text')
        .attr('x', x + (cellWidth - 4) / 2)
        .attr('y', arrayY + cellHeight / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', isHighlighted ? '#1a1a2e' : '#e2e8f0')
        .attr('font-size', '14px')
        .attr('font-weight', isHighlighted ? '600' : '400')
        .text(num);

      // 索引
      g.append('text')
        .attr('x', x + (cellWidth - 4) / 2)
        .attr('y', arrayY + cellHeight + 16)
        .attr('text-anchor', 'middle')
        .attr('fill', '#6b7280')
        .attr('font-size', '11px')
        .text(`[${i}]`);
    });

    // 绘制HashSet
    const hashSetY = 40;
    const hashSetCellSize = 45;
    const hashSetCols = Math.max(1, Math.min(hashSetNumbers.length, 10));
    const hashSetRows = hashSetNumbers.length > 0 ? Math.ceil(hashSetNumbers.length / hashSetCols) : 1;
    const hashSetStartX = -(hashSetCols * hashSetCellSize) / 2;

    // HashSet标题
    g.append('text')
      .attr('x', 0)
      .attr('y', hashSetY - 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a0aec0')
      .attr('font-size', '14px')
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

      // 单元格背景
      g.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', hashSetCellSize - 4)
        .attr('height', hashSetCellSize - 4)
        .attr('rx', 6)
        .attr('fill', isHighlighted ? '#ffa116' : isInLongestSeq ? '#38a169' : isInCurrentSeq ? '#4299e1' : '#374151')
        .attr('stroke', isHighlighted ? '#ffb84d' : isInLongestSeq ? '#48bb78' : isInCurrentSeq ? '#63b3ed' : '#4a5568')
        .attr('stroke-width', isHighlighted || isInCurrentSeq || isInLongestSeq ? 2 : 1);

      // 数字
      g.append('text')
        .attr('x', x + (hashSetCellSize - 4) / 2)
        .attr('y', y + (hashSetCellSize - 4) / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', isHighlighted ? '#1a1a2e' : '#e2e8f0')
        .attr('font-size', '13px')
        .attr('font-weight', isHighlighted ? '600' : '400')
        .text(num);
    });

    // 绘制当前序列信息
    const infoY = hashSetY + (hashSetNumbers.length > 0 ? hashSetRows * hashSetCellSize : hashSetCellSize) + 40;

    if (currentSequence.length > 0) {
      g.append('text')
        .attr('x', 0)
        .attr('y', infoY)
        .attr('text-anchor', 'middle')
        .attr('fill', '#4299e1')
        .attr('font-size', '14px')
        .text(`当前序列: [${currentSequence.join(' → ')}] 长度: ${currentSequence.length}`);
    }

    if (longestSequence.length > 0) {
      g.append('text')
        .attr('x', 0)
        .attr('y', infoY + 25)
        .attr('text-anchor', 'middle')
        .attr('fill', '#38a169')
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .text(`最长序列: [${longestSequence.join(' → ')}] 长度: ${longestSequence.length}`);
    }

    // 图例
    const legendY = infoY + 60;
    const legendItems = [
      { color: '#ffa116', label: '当前检查' },
      { color: '#4299e1', label: '当前序列' },
      { color: '#38a169', label: '最长序列' },
    ];

    legendItems.forEach((item, i) => {
      const x = -100 + i * 100;
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

  }, [visualization, transform]);

  return (
    <div className="canvas-container">
      <div className="canvas-header">
        <span className="canvas-title">算法可视化</span>
        <div className="canvas-controls">
          <span className="zoom-level">{Math.round(transform.scale * 100)}%</span>
          <button className="reset-btn" onClick={handleReset} title="重置视图">
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
      </div>
      <div className="step-description">
        {stepDescription}
      </div>
    </div>
  );
}
