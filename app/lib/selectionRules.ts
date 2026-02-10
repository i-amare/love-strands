export type Coordinate = {
  r: number;
  c: number;
};

export function isAdjacent(p1: Coordinate, p2: Coordinate): boolean {
  const dr = Math.abs(p1.r - p2.r);
  const dc = Math.abs(p1.c - p2.c);
  // Adjacent if distance is 1 in either or both directions (diagonals included), but not 0 (same cell)
  return Math.max(dr, dc) === 1;
}

export function isValidNextStep(
  currentPath: Coordinate[],
  next: Coordinate
): boolean {
  if (currentPath.length === 0) return true;
  
  const last = currentPath[currentPath.length - 1];
  
  // Must be adjacent
  if (!isAdjacent(last, next)) {
    return false;
  }
  
  // Must not reuse cell
  const isUsed = currentPath.some(p => p.r === next.r && p.c === next.c);
  if (isUsed) {
    return false;
  }
  
  return true;
}

export function getWordFromPath(grid: string[][], path: Coordinate[]): string {
  return path.map(p => grid[p.r][p.c]).join('');
}
