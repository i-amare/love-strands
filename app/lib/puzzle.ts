export type GridCell = {
  row: number;
  col: number;
};

export type Puzzle = {
  themeLabel: string;
  theme: string;
  grid: string[][];
  themeEntries: {
    word: string;
    solution: GridCell[];
  }[];
};

export const GRID_COLUMNS = 6;
export const GRID_ROWS = 8;

export const STATIC_PUZZLE: Puzzle = {
  themeLabel: "Today's Theme",
  theme: 'Things I Love About You',
  grid: [
    ['N', 'O', 'T', 'J', 'T', 'S'],
    ['S', 'C', 'A', 'U', 'E', 'N'],
    ['M', 'A', 'R', 'S', 'T', 'O'],
    ['R', 'I', 'N', 'T', 'H', 'H'],
    ['I', 'T', 'G', 'S', 'O', 'U'],
    ['N', 'E', 'N', 'E', 'L', 'G'],
    ['D', 'P', 'D', 'X', 'U', 'H'],
    ['E', 'E', 'N', 'T', 'F', 'T'],
  ],
  themeEntries: [
    {
      word: 'SMART',
      solution: [
        { row: 1, col: 0 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 3, col: 0 },
        { row: 4, col: 1 },
      ],
    },
    {
      word: 'CARING',
      solution: [
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 2 },
        { row: 3, col: 1 },
        { row: 3, col: 2 },
        { row: 4, col: 2 },
      ],
    },
    {
      word: 'HONEST',
      solution: [
        { row: 3, col: 5 },
        { row: 2, col: 5 },
        { row: 1, col: 5 },
        { row: 1, col: 4 },
        { row: 0, col: 5 },
        { row: 0, col: 4 },
      ],
    },
    {
      word: 'THOUGHTFUL',
      solution: [
        { row: 2, col: 4 },
        { row: 3, col: 4 },
        { row: 4, col: 4 },
        { row: 4, col: 5 },
        { row: 5, col: 5 },
        { row: 6, col: 5 },
        { row: 7, col: 5 },
        { row: 7, col: 4 },
        { row: 6, col: 4 },
        { row: 5, col: 4 },
      ],
    },
    {
      word: 'INDEPENDENT',
      solution: [
        { row: 4, col: 0 },
        { row: 5, col: 0 },
        { row: 6, col: 0 },
        { row: 7, col: 0 },
        { row: 6, col: 1 },
        { row: 5, col: 1 },
        { row: 5, col: 2 },
        { row: 6, col: 2 },
        { row: 7, col: 1 },
        { row: 7, col: 2 },
        { row: 7, col: 3 },
      ],
    },
    {
      word: 'NOTJUSTSEX',
      solution: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
        { row: 1, col: 3 },
        { row: 2, col: 3 },
        { row: 3, col: 3 },
        { row: 4, col: 3 },
        { row: 5, col: 3 },
        { row: 6, col: 3 },
      ],
    },
  ],
};

export function toWordFromPath(path: GridCell[], grid: string[][]): string {
  return path.map(({ row, col }) => grid[row]?.[col] ?? '').join('');
}
