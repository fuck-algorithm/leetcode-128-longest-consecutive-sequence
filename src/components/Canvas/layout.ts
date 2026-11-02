import { LabelBounds } from '../../types';

export interface CanvasLayout {
  viewWidth: number;
  viewHeight: number;
  arrayY: number;
  arrayStartX: number;
  cellWidth: number;
  hashSetY: number;
  hashSetStartX: number;
  hashSetCellSize: number;
  hashSetColumns: number;
  sequenceY: number;
  sequenceStartX: number;
  sequenceCellWidth: number;
  longestSequenceY: number;
  longestSequenceStartX: number;
  legendY: number;
}

export function getCanvasLayout(
  viewportWidth: number,
  viewportHeight: number,
  arrayLength: number,
  setLength: number,
  cellSize: number,
  sequenceLength: number,
  longestLength: number,
): CanvasLayout {
  const cellWidth = cellSize;
  const hashSetCellSize = cellSize - 5;
  const sequenceCellWidth = Math.max(50, cellSize + 12);
  const hashSetColumns = Math.max(1, Math.min(setLength || 1, 10, Math.floor((viewportWidth - 96) / hashSetCellSize)));
  const hashSetRows = Math.max(1, Math.ceil(setLength / hashSetColumns));
  const hashHeight = hashSetRows * hashSetCellSize;
  const arrayWidth = arrayLength * cellWidth;
  const hashWidth = hashSetColumns * hashSetCellSize;
  const sequenceWidth = Math.max(sequenceLength, longestLength, 1) * sequenceCellWidth;
  const viewWidth = Math.max(viewportWidth, arrayWidth + 96, hashWidth + 96, sequenceWidth + 120, 720);
  const arrayHeight = cellSize + 44;
  const sequenceHeight = sequenceLength > 1 ? 76 : 0;
  const longestHeight = longestLength > 0 ? 76 : 0;
  const legendHeight = 24;
  const gaps = [24, 28, 24, 20];
  const blocks = [arrayHeight, 38 + hashHeight, sequenceHeight, longestHeight, legendHeight].filter((height) => height > 0);
  const usedGaps = gaps.slice(0, blocks.length - 1).reduce((sum, gap) => sum + gap, 0);
  const contentHeight = blocks.reduce((sum, height) => sum + height, 0) + usedGaps;
  const viewHeight = Math.max(viewportHeight, contentHeight + 180, 520);
  let cursor = -contentHeight / 2 - 30;
  const arrayY = cursor;
  cursor += arrayHeight + gaps[0];
  const hashSetY = cursor + 30;
  cursor += 38 + hashHeight + gaps[1];
  const sequenceY = cursor + 24;
  cursor += sequenceHeight + gaps[2];
  const longestSequenceY = cursor + 24;
  cursor += longestHeight + gaps[3];
  const legendY = cursor - 12;

  return {
    viewWidth,
    viewHeight,
    arrayY,
    arrayStartX: -arrayLength * cellWidth / 2,
    cellWidth,
    hashSetY,
    hashSetStartX: -hashSetColumns * hashSetCellSize / 2,
    hashSetCellSize,
    hashSetColumns,
    sequenceY,
    sequenceStartX: -sequenceLength * sequenceCellWidth / 2,
    sequenceCellWidth,
    longestSequenceY,
    longestSequenceStartX: -longestLength * sequenceCellWidth / 2,
    legendY,
  };
}

export function hasCanvasCollisions(bounds: LabelBounds[]): boolean {
  return bounds.some((current, index) => bounds.slice(index + 1).some((other) =>
    current.x < other.x + other.width && current.x + current.width > other.x &&
    current.y < other.y + other.height && current.y + current.height > other.y,
  ));
}
