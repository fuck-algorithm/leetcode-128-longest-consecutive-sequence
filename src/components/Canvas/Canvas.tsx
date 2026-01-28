import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { VisualizationState, LabelBounds, DataScaleLevel, AlgorithmStep } from '../../types';
import { createGlowFilter, stateColors } from '../../utils/animation';
import { renderComparisonAnnotation, renderDataFlowLabel } from './SmartLabels';
import './Canvas.css';

interface CanvasProps {
  visualization: VisualizationState;
  stepDescription: string;
  currentStep: number;
  steps: AlgorithmStep[];
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

export function Canvas({ visualization, stepDescription, currentStep, steps }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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
      container.addEventListener('