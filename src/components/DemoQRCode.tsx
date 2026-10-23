import { useMemo } from 'react';

function hashString(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const SIZE = 25;

function buildMatrix(value: string): boolean[][] {
  const random = mulberry32(hashString(value));
  const matrix: boolean[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => random() > 0.52),
  );

  const clearZone = (originX: number, originY: number) => {
    for (let y = -1; y <= 7; y += 1) {
      for (let x = -1; x <= 7; x += 1) {
        const targetX = originX + x;
        const targetY = originY + y;
        if (targetX < 0 || targetY < 0 || targetX >= SIZE || targetY >= SIZE) continue;
        matrix[targetY][targetX] = false;
      }
    }
  };

  const stampFinder = (originX: number, originY: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        matrix[originY + y][originX + x] = edge || core;
      }
    }
  };

  clearZone(0, 0);
  clearZone(SIZE - 7, 0);
  clearZone(0, SIZE - 7);
  stampFinder(0, 0);
  stampFinder(SIZE - 7, 0);
  stampFinder(0, SIZE - 7);

  // Timing patterns make the mark read as a code at a glance.
  for (let index = 8; index < SIZE - 8; index += 1) {
    matrix[6][index] = index % 2 === 0;
    matrix[index][6] = index % 2 === 0;
  }

  return matrix;
}

/**
 * Decorative demonstration QR.
 *
 * This is NOT a live operational QR system and does not encode guest identity.
 * It is a visual aid that points at the local prototype route shown beneath it.
 */
export function DemoQRCode({
  value,
  size = 168,
  foreground = '#0B1622',
  background = '#FCFAF6',
  className,
}: {
  value: string;
  size?: number;
  foreground?: string;
  background?: string;
  className?: string;
}) {
  const matrix = useMemo(() => buildMatrix(value), [value]);
  const cells = useMemo(() => {
    const output: Array<{ x: number; y: number }> = [];
    matrix.forEach((row, y) =>
      row.forEach((filled, x) => {
        if (filled) output.push({ x, y });
      }),
    );
    return output;
  }, [matrix]);

  return (
    <svg
      viewBox={`-2 -2 ${SIZE + 4} ${SIZE + 4}`}
      width={size}
      height={size}
      role="img"
      aria-label={`Demonstration QR code pointing at ${value}`}
      className={className}
      shapeRendering="crispEdges"
    >
      <rect x={-2} y={-2} width={SIZE + 4} height={SIZE + 4} rx={1.5} fill={background} />
      {cells.map((cell) => (
        <rect key={`${cell.x}-${cell.y}`} x={cell.x} y={cell.y} width={1} height={1} fill={foreground} />
      ))}
    </svg>
  );
}
