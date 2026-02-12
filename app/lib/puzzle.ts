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
  theme: "Crack and snack",
  grid: [
    ["C", "A", "N", "D", "Y", "S"],
    ["C", "O", "O", "K", "I", "E"],
    ["P", "A", "S", "T", "R", "Y"],
    ["D", "O", "N", "U", "T", "S"],
    ["M", "U", "F", "F", "I", "N"],
    ["B", "A", "G", "E", "L", "S"],
    ["C", "O", "C", "O", "A", "X"],
    ["H", "E", "A", "R", "T", "S"],
  ],
  themeEntries: [
    {
      word: "CANDY",
      solution: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
        { row: 0, col: 4 },
      ],
    },
    {
      word: "COOKIE",
      solution: [
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 1, col: 3 },
        { row: 1, col: 4 },
        { row: 1, col: 5 },
      ],
    },
    {
      word: "PASTRY",
      solution: [
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
        { row: 2, col: 3 },
        { row: 2, col: 4 },
        { row: 2, col: 5 },
      ],
    },
    {
      word: "DONUTS",
      solution: [
        { row: 3, col: 0 },
        { row: 3, col: 1 },
        { row: 3, col: 2 },
        { row: 3, col: 3 },
        { row: 3, col: 4 },
        { row: 3, col: 5 },
      ],
    },
    {
      word: "MUFFIN",
      solution: [
        { row: 4, col: 0 },
        { row: 4, col: 1 },
        { row: 4, col: 2 },
        { row: 4, col: 3 },
        { row: 4, col: 4 },
        { row: 4, col: 5 },
      ],
    },
    {
      word: "BAGELS",
      solution: [
        { row: 5, col: 0 },
        { row: 5, col: 1 },
        { row: 5, col: 2 },
        { row: 5, col: 3 },
        { row: 5, col: 4 },
        { row: 5, col: 5 },
      ],
    },
    {
      word: "COCOA",
      solution: [
        { row: 6, col: 0 },
        { row: 6, col: 1 },
        { row: 6, col: 2 },
        { row: 6, col: 3 },
        { row: 6, col: 4 },
      ],
    },
  ],
};

export function toWordFromPath(path: GridCell[], grid: string[][]): string {
  return path.map(({ row, col }) => grid[row]?.[col] ?? "").join("");
}
