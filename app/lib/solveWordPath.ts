import { Coordinate, isAdjacent } from "./selectionRules";

export function solveWordPath(
  grid: string[][],
  word: string
): Coordinate[] | null {
  const rows = grid.length;
  const cols = grid[0].length;
  const target = word.toUpperCase();

  function dfs(
    r: number,
    c: number,
    index: number,
    visited: Set<string>
  ): Coordinate[] | null {
    if (index === target.length) {
      return [];
    }

    if (grid[r][c] !== target[index]) {
      return null;
    }

    const currentPath = [{ r, c }];
    
    if (index === target.length - 1) {
      return currentPath;
    }

    const key = `${r}-${c}`;
    visited.add(key);

    // Check neighbors
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        
        const nr = r + dr;
        const nc = c + dc;
        
        if (
          nr >= 0 && nr < rows &&
          nc >= 0 && nc < cols &&
          !visited.has(`${nr}-${nc}`)
        ) {
          const res = dfs(nr, nc, index + 1, visited);
          if (res) {
            return [...currentPath, ...res];
          }
        }
      }
    }

    visited.delete(key);
    return null;
  }

  // Start search from every cell matching first letter
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === target[0]) {
        const visited = new Set<string>();
        const path = dfs(r, c, 0, visited);
        if (path) return path;
      }
    }
  }

  return null;
}
