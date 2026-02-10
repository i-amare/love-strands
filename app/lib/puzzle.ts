export type GridCell = {
  row: number;
  col: number;
};

export type Puzzle = {
  themeLabel: string;
  theme: string;
  grid: string[][];
  themeWords: string[];
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
  themeWords: ["CANDY", "COOKIE", "PASTRY", "DONUTS", "MUFFIN", "BAGELS", "COCOA"],
};

export function toWordFromPath(path: GridCell[], grid: string[][]): string {
  return path.map(({ row, col }) => grid[row]?.[col] ?? "").join("");
}
