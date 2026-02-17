import type { GridCell } from "./puzzle";

export function cellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

export function keyFromCell(cell: GridCell): string {
  return cellKey(cell.row, cell.col);
}

export function isSameCell(a: GridCell, b: GridCell): boolean {
  return a.row === b.row && a.col === b.col;
}

export function isAdjacent(a: GridCell, b: GridCell): boolean {
  const rowDelta = Math.abs(a.row - b.row);
  const colDelta = Math.abs(a.col - b.col);

  if (rowDelta === 0 && colDelta === 0) {
    return false;
  }

  return rowDelta <= 1 && colDelta <= 1;
}
