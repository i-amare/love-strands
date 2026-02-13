"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { GRID_COLUMNS, GRID_ROWS, STATIC_PUZZLE, toWordFromPath, type GridCell } from "../lib/puzzle";
import { cellKey, isAdjacent, isSameCell, keyFromCell } from "../lib/selectionRules";
import LetterGrid from "./LetterGrid";
import TrailOverlay from "./TrailOverlay";

type ValidationResponse = {
  valid: boolean;
};

type ToastState = {
  kind: "error";
  message: string;
} | null;

type Point = {
  x: number;
  y: number;
};

const HINT_COST = 3;
const INVALID_WORD_MESSAGE = "That word is not valid.";

function cellFromElement(node: Element | null): GridCell | null {
  const cellNode = node?.closest<HTMLButtonElement>("[data-row][data-col]");
  if (!cellNode) {
    return null;
  }

  const rowValue = Number.parseInt(cellNode.dataset.row ?? "", 10);
  const colValue = Number.parseInt(cellNode.dataset.col ?? "", 10);
  if (Number.isNaN(rowValue) || Number.isNaN(colValue)) {
    return null;
  }

  return { row: rowValue, col: colValue };
}

function arePathsEqual(pathA: GridCell[], pathB: GridCell[]): boolean {
  if (pathA.length !== pathB.length) {
    return false;
  }

  return pathA.every((cell, index) => isSameCell(cell, pathB[index]));
}

async function validateEnglishWord(word: string): Promise<boolean> {
  try {
    const response = await fetch("/api/validate-word", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as ValidationResponse;
    return Boolean(data.valid);
  } catch {
    return false;
  }
}

export default function StrandsGame() {
  const { theme, themeEntries, grid } = STATIC_PUZZLE;
  const normalizedThemeEntries = useMemo(
    () =>
      themeEntries.map((entry) => ({
        ...entry,
        word: entry.word.toUpperCase(),
      })),
    [themeEntries],
  );
 
  const boardRef = useRef<HTMLDivElement | null>(null);
  const cellRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activePointerIdRef = useRef<number | null>(null);

  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [cellCenters, setCellCenters] = useState<Record<string, Point>>({});
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedPath, setSelectedPath] = useState<GridCell[]>([]);
  const [foundEntryIndexes, setFoundEntryIndexes] = useState<number[]>([]);
  const [points, setPoints] = useState(0);
  const [hintedEntryIndex, setHintedEntryIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const foundEntrySet = useMemo(() => new Set(foundEntryIndexes), [foundEntryIndexes]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) {
      return;
    }

    const computePositions = () => {
      const nextCenters: Record<string, Point> = {};
      const boardRect = board.getBoundingClientRect();

      setBoardSize({ width: boardRect.width, height: boardRect.height });

      for (let row = 0; row < GRID_ROWS; row += 1) {
        for (let col = 0; col < GRID_COLUMNS; col += 1) {
          const key = cellKey(row, col);
          const cell = cellRefs.current[key];
          if (!cell) {
            continue;
          }

          const cellRect = cell.getBoundingClientRect();
          nextCenters[key] = {
            x: cellRect.left - boardRect.left + cellRect.width / 2,
            y: cellRect.top - boardRect.top + cellRect.height / 2,
          };
        }
      }

      setCellCenters(nextCenters);
    };

    const resizeObserver = new ResizeObserver(computePositions);
    resizeObserver.observe(board);
    window.addEventListener("resize", computePositions);
    computePositions();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", computePositions);
    };
  }, []);


  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 1300);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedWord = useMemo(() => toWordFromPath(selectedPath, grid), [selectedPath, grid]);

  const selectedKeys = useMemo(
    () => new Set(selectedPath.map((cell) => keyFromCell(cell))),
    [selectedPath],
  );

  const foundKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const entryIndex of foundEntryIndexes) {
      const entry = normalizedThemeEntries[entryIndex];
      if (!entry) {
        continue;
      }

      for (const cell of entry.solution) {
        keys.add(keyFromCell(cell));
      }
    }
    return keys;
  }, [foundEntryIndexes, normalizedThemeEntries]);

  const hintedKeys = useMemo(() => {
    const keys = new Set<string>();
    if (hintedEntryIndex === null || foundEntrySet.has(hintedEntryIndex)) {
      return keys;
    }

    const hintedEntry = normalizedThemeEntries[hintedEntryIndex];
    if (!hintedEntry) {
      return keys;
    }

    for (const cell of hintedEntry.solution) {
      keys.add(keyFromCell(cell));
    }

    return keys;
  }, [hintedEntryIndex, normalizedThemeEntries, foundEntrySet]);

  function registerCellRef(row: number, col: number, node: HTMLButtonElement | null) {
    cellRefs.current[cellKey(row, col)] = node;
  }

  function beginSelection(row: number, col: number) {
    setToast(null);
    setIsSelecting(true);
    setSelectedPath([{ row, col }]);
  }

  function handleCellPointerDown(row: number, col: number, event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.preventDefault();
    activePointerIdRef.current = event.pointerId;
    boardRef.current?.setPointerCapture(event.pointerId);
    beginSelection(row, col);
  }

  function extendSelection(row: number, col: number) {
    if (!isSelecting) {
      return;
    }

    setSelectedPath((current) => {
      if (current.length === 0) {
        return [{ row, col }];
      }

      const nextCell = { row, col };
      const lastCell = current[current.length - 1];

      if (current.some((cell) => isSameCell(cell, nextCell))) {
        return current;
      }

      if (!isAdjacent(lastCell, nextCell)) {
        return current;
      }

      return [...current, nextCell];
    });
  }

  async function resolveSelection(path: GridCell[]) {
    if (path.length === 0) {
      return;
    }

    const word = toWordFromPath(path, grid).toUpperCase();
    if (word.length < 3) {
      setToast({ kind: "error", message: INVALID_WORD_MESSAGE });
      return;
    }

    const matchedThemeEntryIndex = normalizedThemeEntries.findIndex(
      (entry, entryIndex) => !foundEntrySet.has(entryIndex) && arePathsEqual(path, entry.solution),
    );

    if (matchedThemeEntryIndex >= 0) {
      setFoundEntryIndexes((current) => [...current, matchedThemeEntryIndex]);
      setHintedEntryIndex((current) => (current === matchedThemeEntryIndex ? null : current));
      return;
    }

    const isValid = await validateEnglishWord(word);
    if (isValid) {
      setPoints((current) => current + 1);
      return;
    }

    setToast({ kind: "error", message: INVALID_WORD_MESSAGE });
  }

  function clearSelection() {
    setSelectedPath([]);
    setIsSelecting(false);
  }

  async function finishSelection() {
    if (!isSelecting) {
      return;
    }

    const snapshot = selectedPath;
    clearSelection();
    await resolveSelection(snapshot);
  }

  function handleBoardPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isSelecting || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const cell = cellFromElement(document.elementFromPoint(event.clientX, event.clientY));
    if (!cell) {
      return;
    }

    extendSelection(cell.row, cell.col);
  }

  function handleBoardPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (activePointerIdRef.current !== null && activePointerIdRef.current !== event.pointerId) {
      return;
    }

    if (boardRef.current?.hasPointerCapture(event.pointerId)) {
      boardRef.current.releasePointerCapture(event.pointerId);
    }
    activePointerIdRef.current = null;
    void finishSelection();
  }

  function handleBoardPointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    if (boardRef.current?.hasPointerCapture(event.pointerId)) {
      boardRef.current.releasePointerCapture(event.pointerId);
    }
    activePointerIdRef.current = null;
    clearSelection();
  }

  function useHint() {
    if (points < HINT_COST) {
      return;
    }

    const nextHintEntryIndex = normalizedThemeEntries.findIndex((_, entryIndex) => !foundEntrySet.has(entryIndex));
    if (nextHintEntryIndex < 0) {
      return;
    }

    setHintedEntryIndex(nextHintEntryIndex);
    setPoints((current) => Math.max(0, current - HINT_COST));
  }

  const hintChargeLevel = Math.min(points, HINT_COST);
  const hintChargePercent = (hintChargeLevel / HINT_COST) * 100;
  const canUseHint = points >= HINT_COST;

  return (
    <main
      className="min-h-svh flex justify-center px-4"
    >
      <div className="flex w-full max-w-136 flex-col gap-[0.55rem] sm:gap-3">
        <h1 className="m-0 text-center font-love text-4xl pb-4 leading-[1.05] tracking-[0.02em] text-(--pink-accent-bright) [text-shadow:0_0_14px_rgba(255,98,170,0.6)]">
          Love Strands
        </h1>

        <section
          className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-lg"
          aria-label="Today's Theme"
        >
          <p className="m-0 text-center text-lg font-extrabold uppercase bg-teal-600 text-white tracking-[0.04em]">
          Today's Theme
          </p>
          <h2 className="m-0 px-2 py-4 text-center text-2xl font-bold">
            {theme}
          </h2>
        </section>

        <p
          className="m-[0.3rem_0_0] min-h-[2.2rem] text-center text-[clamp(1.05rem,4.8vw,1.5rem)] font-bold uppercase tracking-[0.18em] text-[#f8f9ff] sm:min-h-[2.4rem]"
          aria-live="polite"
        >
          {selectedWord || "\u00A0"}
        </p>

        {toast ? (
          <p className="m-0 min-h-[1.2rem] text-center text-[0.9rem] text-[#ff8992]">{toast.message}</p>
        ) : (
          <p className="m-0 min-h-[1.2rem] text-center text-[0.9rem]">&nbsp;</p>
        )}

        <div
          ref={boardRef}
          className="relative mx-auto mt-[0.2rem] w-full max-w-120 px-8"
          onPointerMove={handleBoardPointerMove}
          onPointerUp={handleBoardPointerUp}
          onPointerCancel={handleBoardPointerCancel}
        >
          <TrailOverlay
            width={boardSize.width}
            height={boardSize.height}
            cellCenters={cellCenters}
            activePath={selectedPath}
            foundPaths={foundEntryIndexes.map((entryIndex) => normalizedThemeEntries[entryIndex]?.solution ?? [])}
          />
          <LetterGrid
            grid={grid}
            selectedKeys={selectedKeys}
            foundKeys={foundKeys}
            hintedKeys={hintedKeys}
            onCellPointerDown={handleCellPointerDown}
            registerCellRef={registerCellRef}
          />
        </div>

        <div className="mt-[0.45rem] flex items-center justify-between gap-[0.8rem]">
          <button
            type="button"
            className={`relative inline-flex h-10 min-w-22 items-center justify-center overflow-hidden rounded-full border-2 bg-gray-400 text-[#d8d9e2] disabled:opacity-100 ${
              canUseHint ? "cursor-pointer border-[#f5f6fb]" : "cursor-not-allowed border-[#272a35]"
            }`}
            onClick={useHint}
            disabled={!canUseHint}
          >
            <span
              className="absolute inset-y-0 left-0 bg-white transition-[width] duration-180 ease-[ease]"
              style={{ width: `${hintChargePercent}%` }}
              aria-hidden="true"
            />
            <span className="relative z-1 text-xl tracking-[0.01em] text-[#1b1d26] mix-blend-difference">
              Hint
            </span>
          </button>

          <p className="m-0 text-right text-[clamp(1.1rem,5vw,2.2rem)] leading-[1.1]">
            <strong>{foundEntryIndexes.length}</strong> of <strong>{normalizedThemeEntries.length}</strong> theme
            words found.
          </p>
        </div>
      </div>
    </main>
  );
}
