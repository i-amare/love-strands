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

          return (
            <button
              key={key}
              type="button"
              className={[
                "relative z-3 grid w-full aspect-square place-items-center rounded-full border-0 bg-transparent text-[#f3f4f8] text-[clamp(1.95rem,7.8vw,2.65rem)] leading-none tracking-[0.02em] uppercase transition-[background-color,color,box-shadow] duration-120 ease-[ease]",
                selectedKeys.has(key)
                  ? "bg-[rgba(245,204,54,0.22)] shadow-[inset_0_0_0_2px_rgba(245,204,54,0.85)]"
                  : "",
                foundKeys.has(key)
                  ? "bg-[rgba(76,144,255,0.38)] text-[#ecf4ff] shadow-[inset_0_0_0_2px_rgba(76,144,255,0.9)]"
                  : "",
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
