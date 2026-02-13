"use client";

import { cellKey } from "../lib/selectionRules";

type LetterGridProps = {
  grid: string[][];
  selectedKeys: Set<string>;
  foundKeys: Set<string>;
  hintedKeys: Set<string>;
  onCellPointerDown: (row: number, col: number, event: React.PointerEvent<HTMLButtonElement>) => void;
  registerCellRef: (row: number, col: number, node: HTMLButtonElement | null) => void;
};

export default function LetterGrid({
  grid,
  selectedKeys,
  foundKeys,
  hintedKeys,
  onCellPointerDown,
  registerCellRef,
}: LetterGridProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  return (
    <div
      className="grid touch-none select-none grid-cols-[repeat(var(--grid-columns),minmax(0,1fr))] grid-rows-[repeat(var(--grid-rows),minmax(0,1fr))] gap-[clamp(0.2rem,2.2vw,0.5rem)]"
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
          const tileStyle: React.CSSProperties | undefined = isFound
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
                "relative z-3 grid w-full aspect-square place-items-center rounded-full border-0 bg-transparent text-gray-200 text-2xl leading-none tracking-[0.02em] uppercase transition-[background-color,color,box-shadow] duration-120 ease-[ease]",
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
