"use client";

import { cellKey } from "../lib/selectionRules";

type LetterGridProps = {
  grid: string[][];
  selectedKeys: Set<string>;
  foundKeys: Set<string>;
  spangramKeys: Set<string>;
  hintedKeys: Set<string>;
  onCellPointerDown: (row: number, col: number, event: React.PointerEvent<HTMLButtonElement>) => void;
  registerCellRef: (row: number, col: number, node: HTMLButtonElement | null) => void;
};

export default function LetterGrid({
  grid,
  selectedKeys,
  foundKeys,
  spangramKeys,
  hintedKeys,
  onCellPointerDown,
  registerCellRef,
}: LetterGridProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  return (
    <div
      className="grid touch-none select-none grid-cols-[repeat(var(--grid-columns),minmax(0,1fr))] grid-rows-[repeat(var(--grid-rows),minmax(0,1fr))] gap-1 sm:gap-2"
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
          const isSelected = selectedKeys.has(key);
          const isFound = foundKeys.has(key);
          const isSpangram = spangramKeys.has(key);
          const tileStyle: React.CSSProperties | undefined = isSpangram
            ? {
                backgroundColor: "var(--trail-yellow)",
                color: "var(--foreground)",
                boxShadow: "inset 0 0 0 2px var(--trail-yellow)",
              }
            : isFound
            ? {
                backgroundColor: "var(--trail-blue)",
                color: "var(--foreground)",
                boxShadow: "inset 0 0 0 2px var(--trail-blue)",
              }
            : isSelected
              ? {
                  backgroundColor: "var(--trail-grey)",
                  color: "var(--foreground)",
                  boxShadow: "inset 0 0 0 2px var(--trail-grey)",
                }
              : undefined;

          return (
            <button
              key={key}
              type="button"
              className={[
                "relative z-20 grid aspect-square w-full place-items-center rounded-full border-0 bg-transparent text-2xl leading-none tracking-wide text-gray-200 uppercase transition-colors duration-150 ease-in-out",
                hintedKeys.has(key) ? "is-hinted" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={tileStyle}
              data-row={rowIndex}
              data-col={colIndex}
              onPointerDown={(event) => onCellPointerDown(rowIndex, colIndex, event)}
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
