import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Canvas } from './Canvas';
import { generateAlgorithmSteps, sampleData } from '../../algorithm/longestConsecutive';

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
});
