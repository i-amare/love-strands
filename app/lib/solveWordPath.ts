import type { GridCell } from "./puzzle";
import { isAdjacent } from "./selectionRules";

export function solveWordPath(grid: string[][], word: string): GridCell[] | null {
  if (!word) {
    return null;
  }

  const target = word.toUpperCase();
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const visited = new Set<string>();

  function search(row: number, col: number, index: number, path: GridCell[]): GridCell[] | null {
    if (grid[row]?.[col] !== target[index]) {
      return null;
    }

    const key = `${row}-${col}`;
    if (visited.has(key)) {
      return null;
    }

    const nextPath = [...path, { row, col }];
    if (index === target.length - 1) {
      return nextPath;
    }

    visited.add(key);

    for (let nextRow = Math.max(0, row - 1); nextRow <= Math.min(rows - 1, row + 1); nextRow += 1) {
      for (let nextCol = Math.max(0, col - 1); nextCol <= Math.min(cols - 1, col + 1); nextCol += 1) {
        if (!isAdjacent({ row, col }, { row: nextRow, col: nextCol })) {
          continue;
        }

        const found = search(nextRow, nextCol, index + 1, nextPath);
        if (found) {
          visited.delete(key);
          return found;
        }
      }
    }

    visited.delete(key);
    return null;
  }

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const foundPath = search(row, col, 0, []);
      if (foundPath) {
        return foundPath;
      }
    }
  }

  return null;
}
