import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Canvas } from './Canvas';
import { generateAlgorithmSteps, sampleData } from '../../algorithm/longestConsecutive';
import type { VisualizationState } from '../../types';

let resizeCallback: ResizeObserverCallback | undefined;

class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback;
  }

  observe() {}
  disconnect() {}
  unobserve() {}
}

beforeEach(() => {
  resizeCallback = undefined;
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
});

describe('Canvas', () => {
  const renderCanvas = (visualization: VisualizationState, stepDescription: string) => {
    const result = render(
      <Canvas
        visualization={visualization}
        stepDescription={stepDescription}
        showCode={false}
        showContext={false}
        onToggleCode={vi.fn()}
        onToggleContext={vi.fn()}
      />,
    );
    act(() => {
      resizeCallback?.([
        { contentRect: { width: 764, height: 235 } } as ResizeObserverEntry,
      ], {} as ResizeObserver);
    });
    return result.container;
  };

  it('waits for the actual drawable size before rendering the visualization', () => {
    const firstStep = generateAlgorithmSteps(sampleData[0].data)[1];
    const { container } = render(
      <Canvas
        visualization={firstStep.visualization}
        stepDescription={firstStep.description}
        showCode={false}
        showContext={false}
        onToggleCode={vi.fn()}
        onToggleContext={vi.fn()}
      />,
    );

    expect(container.querySelector('.canvas-svg text')).toBeNull();

    // The observer entry's dimensions must be used, not a guessed desktop size.
    const wrapper = container.querySelector('.canvas-wrapper');
    expect(wrapper).not.toBeNull();
    act(() => {
      resizeCallback?.([
        { contentRect: { width: 764, height: 235 } } as ResizeObserverEntry,
      ], {} as ResizeObserver);
    });

    expect(container.querySelector('.canvas-svg text')?.textContent).toBe('原始数组 nums[]');
  });

  it('draws a labeled dashed arrow when the next consecutive number is absent', () => {
    const step = generateAlgorithmSteps(sampleData[0].data).find(({ description }) => description.includes('检查 5 是否在HashSet中：否'))!;
    const container = renderCanvas(step.visualization, step.description);

    expect(container.querySelector('.missing-membership-cue')?.getAttribute('aria-label')).toBe('后继 5 缺失');
    expect(container.querySelector('.missing-membership-cue text')?.textContent).toBe('缺少 5');
  });

  it('draws a labeled dashed arrow when a sequence start has no predecessor', () => {
    const step = generateAlgorithmSteps([10, 12]).find(({ description }) => description.includes('9 不在HashSet中'))!;
    const container = renderCanvas(step.visualization, step.description);

    expect(container.querySelector('.missing-membership-cue')?.getAttribute('aria-label')).toBe('前驱 9 缺失');
    expect(container.querySelector('.missing-membership-cue text')?.textContent).toBe('缺少 9');
  });
});
