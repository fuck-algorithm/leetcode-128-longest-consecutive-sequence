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

    // 定义箭头标记
    const defs = svg.append('defs');
    
    // 指针箭头（用于数组遍历）
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

    // 数据流箭头（用于状态转移）
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

    // 比较箭头
    defs.append('marker')
      .attr('id', 'compare-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#38a169');

    const g = svg.append('g')
      .attr('transform', `translate(${transform.x + width / 2}, ${transform.y + height / 2}) scale(${transform.scale})`);

    const { originalArray, hashSetNumbers = [], highlightedNumbers = [], currentSequence, longestSequence } = visualization;

    // 绘制原始数组
    const arrayY = -140;
    const cellWidth = 50;
    const cellHeight = 40;
    const arrayStartX = -(originalArray.length * cellWidth) / 2;

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

      // 如果当前元素被高亮，绘制指针箭头
      if (isHighlighted && highlightedNumbers[0] === num) {
        const arrowX = x + (cellWidth - 4) / 2;
        const arrowY = arrayY - 25;
        
        // 指针箭头
        g.append('line')
          .attr('x1', arrowX)
          .attr('y1', arrowY - 15)
          .attr('x2', arrowX)
          .attr('y2', arrowY)
          .attr('stroke', '#ffa116')
          .attr('stroke-width', 2)
          .attr('marker-end', 'url(#pointer-arrow)');

        // 指针标签
        g.append('text')
          .attr('x', arrowX)
          .attr('y', arrowY - 22)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffa116')
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .text('当前检查');
      }
    });

    // 绘制HashSet
    const hashSetY = 50;
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

    // 绘制当前序列的连接箭头
    if (currentSequence.length > 1) {
      const seqY = hashSetY + (hashSetNumbers.length > 0 ? hashSetRows * hashSetCellSize : hashSetCellSize) + 50;
      const seqCellWidth = 45;
      const seqStartX = -(currentSequence.length * seqCellWidth) / 2;

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
          .attr('width', seqCellWidth - 6)
          .attr('height', 35)
          .attr('rx', 4)
          .attr('fill', '#4299e1')
          .attr('stroke', '#63b3ed')
          .attr('stroke-width', 2);

        g.append('text')
          .attr('x', x + (seqCellWidth - 6) / 2)
          .attr('y', seqY + 22)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', '14px')
          .attr('font-weight', '600')
          .text(num);

        // 绘制连接箭头
        if (i < currentSequence.length - 1) {
          const arrowStartX = x + seqCellWidth - 6;
          const arrowEndX = x + seqCellWidth + 2;
          const arrowY = seqY + 17;

          g.append('line')
            .attr('x1', arrowStartX)
            .attr('y1', arrowY)
            .attr('x2', arrowEndX)
            .attr('y2', arrowY)
            .attr('stroke', '#4299e1')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#flow-arrow)');

          // +1 标注
          g.append('text')
            .attr('x', (arrowStartX + arrowEndX) / 2)
            .attr('y', arrowY - 8)
            .attr('text-anchor', 'middle')
            .attr('fill', '#63b3ed')
            .attr('font-size', '10px')
            .attr('font-weight', '600')
            .text('+1');
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

    // 绘制最长序列
    const longestSeqY = hashSetY + (hashSetNumbers.length > 0 ? hashSetRows * hashSetCellSize : hashSetCellSize) + (currentSequence.length > 1 ? 120 : 50);
    
    if (longestSequence.length > 0) {
      const seqCellWidth = 45;
      const seqStartX = -(longestSequence.length * seqCellWidth) / 2;

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
          .attr('width', seqCellWidth - 6)
          .attr('height', 35)
          .attr('rx', 4)
          .attr('fill', '#38a169')
          .attr('stroke', '#48bb78')
          .attr('stroke-width', 2);

        g.append('text')
          .attr('x', x + (seqCellWidth - 6) / 2)
          .attr('y', longestSeqY + 22)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', '14px')
          .attr('font-weight', '600')
          .text(num);

        // 绘制连接箭头
        if (i < longestSequence.length - 1) {
          const arrowStartX = x + seqCellWidth - 6;
          const arrowEndX = x + seqCellWidth + 2;
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

    // 绘制比较说明（当检查num-1是否存在时）
    if (highlightedNumbers.length === 2) {
      const num1 = highlightedNumbers[0];
      const num2 = highlightedNumbers[1];
      
      // 在HashSet中找到第一个数字的位置
      const idx1 = hashSetNumbers.indexOf(num1);
      
      if (idx1 !== -1) {
        const col1 = idx1 % hashSetCols;
        const row1 = Math.floor(idx1 / hashSetCols);
        const x1 = hashSetStartX + col1 * hashSetCellSize + (hashSetCellSize - 4) / 2;
        const y1 = hashSetY + row1 * hashSetCellSize;

        // 比较说明框
        const compareBoxX = x1 + 60;
        const compareBoxY = y1 - 10;
        
        const isNum2InSet = hashSetNumbers.includes(num2);
        const compareText = `检查 ${num2} 是否在HashSet中`;
        const resultText = isNum2InSet ? `✓ 存在` : `✗ 不存在`;
        const resultColor = isNum2InSet ? '#38a169' : '#e53e3e';

        // 比较说明背景
        g.append('rect')
          .attr('x', compareBoxX)
          .attr('y', compareBoxY)
          .attr('width', 180)
          .attr('height', 50)
          .attr('rx', 6)
          .attr('fill', 'rgba(45, 55, 72, 0.95)')
          .attr('stroke', '#4a5568')
          .attr('stroke-width', 1);

        // 比较说明文字
        g.append('text')
          .attr('x', compareBoxX + 10)
          .attr('y', compareBoxY + 20)
          .attr('fill', '#e2e8f0')
          .attr('font-size', '11px')
          .text(compareText);

        g.append('text')
          .attr('x', compareBoxX + 10)
          .attr('y', compareBoxY + 38)
          .attr('fill', resultColor)
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .text(resultText);

        // 连接线
        g.append('line')
          .attr('x1', x1 + 20)
          .attr('y1', y1 + 20)
          .attr('x2', compareBoxX)
          .attr('y2', compareBoxY + 25)
          .attr('stroke', '#4a5568')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4,2');
      }
    }

    // 图例
    const legendY = longestSeqY + (longestSequence.length > 0 ? 70 : 30);
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
      </div>
      <div className="step-description">
        <span className="step-icon">💡</span>
        {stepDescription}
      </div>
    </div>
  );
}
