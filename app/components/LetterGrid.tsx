"use client";

import { cellKey } from "../lib/selectionRules";

type LetterGridProps = {
  grid: string[][];
  selectedKeys: Set<string>;
  foundKeys: Set<string>;
  hintedKeys: Set<string>;
  onCellPointerDown: (row: number, col: number) => void;
  onCellPointerEnter: (row: number, col: number) => void;
  onCellPointerUp: () => void;
  registerCellRef: (row: number, col: number, node: HTMLButtonElement | null) => void;
};

export default function LetterGrid({
  grid,
  selectedKeys,
  foundKeys,
  hintedKeys,
  onCellPointerDown,
  onCellPointerEnter,
  onCellPointerUp,
  registerCellRef,
}: LetterGridProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  return (
    <div
      className="letter-grid"
      style={
        {
          "--grid-rows": rows,
          "--grid-columns": cols,
        } as React.CSSProperties
      }
    >
      {grid.map((row, rowIndex) =>
        row.map((letter, colIndex) => {
          const key = cellKey(rowIndex, colIndex);

          return (
            <button
              key={key}
              type="button"
              className={[
                "letter-cell",
                selectedKeys.has(key) ? "is-selected" : "",
                foundKeys.has(key) ? "is-found" : "",
                hintedKeys.has(key) ? "is-hinted" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onPointerDown={() => onCellPointerDown(rowIndex, colIndex)}
              onPointerEnter={() => onCellPointerEnter(rowIndex, colIndex)}
              onPointerUp={onCellPointerUp}
              ref={(node) => registerCellRef(rowIndex, colIndex, node)}
            >
              {letter.toUpperCase()}
            </button>
          );
        }),
      )}
    </div>
  );
}
