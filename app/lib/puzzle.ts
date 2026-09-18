export type GridCell = {
  row: number;
  col: number;
};

export type Puzzle = {
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
  theme: "The Road to Love",
  grid: [
    ["I", "D", "D", "L", "I", "R"],
    ["M", "I", "O", "E", "B", "D"],
    ["S", "D", "N", "F", "O", "R"],
    ["T", "R", "E", "E", "T", "E"],
    ["R", "I", "S", "S", "N", "S"],
    ["R", "O", "N", "E", "A", "T"],
    ["M", "J", "I", "M", "M", "E"],
    ["E", "R", "R", "A", "N", "S"],
  ],
  themeEntries: [
    {
      word: "JORRISSEN",
      solution: [
        { row: 6, col: 1 },
        { row: 5, col: 1 },
        { row: 5, col: 0 },
        { row: 4, col: 0 },
        { row: 4, col: 1 },
        { row: 4, col: 2 },
        { row: 4, col: 3 },
        { row: 5, col: 3 },
        { row: 5, col: 2 },
      ],
    },
    {
      word: "FOREST",
      solution: [
        { row: 2, col: 3 },
        { row: 2, col: 4 },
        { row: 2, col: 5 },
        { row: 3, col: 5 },
        { row: 4, col: 5 },
        { row: 5, col: 5 },
      ],
    },
    {
      word: "DION",
      solution: [
        { row: 2, col: 1 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 2 },
      ],
    },
    {
      word: "BIRD",
      solution: [
        { row: 1, col: 4 },
        { row: 0, col: 4 },
        { row: 0, col: 5 },
        { row: 1, col: 5 },
      ],
    },
    {
      word: "MIDDLE",
      solution: [
        { row: 1, col: 0 },
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
        { row: 1, col: 3 },
      ],
    },
    {
      word: "MERRIMAN",
      solution: [
        { row: 6, col: 0 },
        { row: 7, col: 0 },
        { row: 7, col: 1 },
        { row: 7, col: 2 },
        { row: 6, col: 2 },
        { row: 6, col: 3 },
        { row: 7, col: 3 },
        { row: 7, col: 4 },
      ],
    },
    {
      word: "STREETNAMES",
      solution: [
        { row: 2, col: 0 },
        { row: 3, col: 0 },
        { row: 3, col: 1 },
        { row: 3, col: 2 },
        { row: 3, col: 3 },
        { row: 3, col: 4 },
        { row: 4, col: 4 },
        { row: 5, col: 4 },
        { row: 6, col: 4 },
        { row: 6, col: 5 },
        { row: 7, col: 5 },
      ],
    },
  ],
};

export function toWordFromPath(path: GridCell[], grid: string[][]): string {
  return path.map(({ row, col }) => grid[row]?.[col] ?? "").join("");
}
