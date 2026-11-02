import { describe, expect, it } from 'vitest';
import { getCanvasLayout, hasCanvasCollisions } from './layout';
import { generateAlgorithmSteps, sampleData } from '../../algorithm/longestConsecutive';

describe('canvas layout', () => {
  it.each([
    { width: 1200, height: 520, values: [100, 4, 200, 1, 3, 2] },
    { width: 1870, height: 900, values: Array.from({ length: 40 }, (_, index) => index - 20) },
    { width: 720, height: 430, values: Array.from({ length: 100 }, (_, index) => index) },
  ])('separates data structures and keeps them within the canvas at $width x $height', ({ width, height, values }) => {
    const layout = getCanvasLayout(width, height, values.length, values.length, 50, 12, 12);
    const h = layout.hashSetCellSize;
    const rows = Math.ceil(values.length / layout.hashSetColumns);
    const arrayBox = { x: -values.length * layout.cellWidth / 2, y: layout.arrayY - 50, width: values.length * layout.cellWidth, height: 60 };
    const hashBox = { x: layout.hashSetStartX, y: layout.hashSetY - 30, width: layout.hashSetColumns * h, height: rows * h + 38 };
    const boxes = [
      arrayBox,
      hashBox,
      { x: layout.sequenceStartX, y: layout.sequenceY - 25, width: 12 * layout.sequenceCellWidth, height: 60 },
      { x: layout.longestSequenceStartX, y: layout.longestSequenceY - 25, width: 12 * layout.sequenceCellWidth, height: 60 },
    ];

    expect(hasCanvasCollisions(boxes)).toBe(false);
    expect(boxes.every((box) => box.y >= -layout.viewHeight / 2 && box.y + box.height <= layout.viewHeight / 2)).toBe(true);
  });

  it('keeps the actual sample frames collision-free at narrow, desktop, and wide viewport sizes', () => {
    for (const sample of sampleData) {
      for (const step of generateAlgorithmSteps(sample.data)) {
        for (const [width, height] of [[720, 430], [1200, 520], [1870, 900]]) {
          const state = step.visualization;
          const layout = getCanvasLayout(width, height, state.originalArray.length, state.hashSetNumbers?.length || 0, 50, state.currentSequence.length, state.longestSequence.length);
          const rows = Math.max(1, Math.ceil((state.hashSetNumbers?.length || 0) / layout.hashSetColumns));
          const boxes = [
            { x: -state.originalArray.length * layout.cellWidth / 2, y: layout.arrayY - 50, width: state.originalArray.length * layout.cellWidth, height: 60 },
            { x: layout.hashSetStartX, y: layout.hashSetY - 30, width: layout.hashSetColumns * layout.hashSetCellSize, height: rows * layout.hashSetCellSize + 38 },
          ];
          if (state.currentSequence.length > 1) boxes.push({ x: layout.sequenceStartX, y: layout.sequenceY - 25, width: state.currentSequence.length * layout.sequenceCellWidth, height: 60 });
          if (state.longestSequence.length > 0) boxes.push({ x: layout.longestSequenceStartX, y: layout.longestSequenceY - 25, width: state.longestSequence.length * layout.sequenceCellWidth, height: 60 });
          expect(hasCanvasCollisions(boxes)).toBe(false);
        }
      }
    }
  });

  it('reports colliding rectangles', () => {
    expect(hasCanvasCollisions([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 9, y: 9, width: 10, height: 10 },
    ])).toBe(true);
  });
});
