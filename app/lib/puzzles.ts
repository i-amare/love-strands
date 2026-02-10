export type PuzzleData = {
  theme: string;
  grid: string[][];
  themeWords: string[];
};

// 6 columns x 8 rows
const grid = [
  ['H', 'E', 'A', 'R', 'T', 'S'],
  ['C', 'H', 'O', 'C', 'O', 'L'],
  ['A', 'T', 'E', 'R', 'O', 'S'],
  ['L', 'O', 'V', 'E', 'M', 'U'],
  ['C', 'U', 'P', 'I', 'D', 'G'],
  ['F', 'L', 'O', 'W', 'E', 'R'],
  ['D', 'A', 'T', 'E', 'N', 'I'],
  ['K', 'I', 'S', 'S', 'G', 'H']
];

export const puzzle: PuzzleData = {
  theme: "Valentine's Vibes",
  grid,
  themeWords: [
    "HEARTS",
    "CHOCOLATE",
    "ROSE",
    "LOVE",
    "CUPID",
    "FLOWER",
    "DATE",
    "KISS",
    "HUG"
  ]
};
