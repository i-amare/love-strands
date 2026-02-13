"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const { theme, themeLabel, themeEntries, grid } = STATIC_PUZZLE;
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
    <main className="love-strands-shell">
      <div className="love-strands-board">
        <h1 className="game-title">Love Strands</h1>

        <section className="theme-card" aria-label={themeLabel}>
          <p className="theme-card-label">{themeLabel}</p>
          <h2 className="theme-card-title">{theme}</h2>
        </section>

        <p className="selected-word-display" aria-live="polite">
          {selectedWord || "\u00A0"}
        </p>

        {toast ? <p className="word-toast">{toast.message}</p> : <p className="word-toast-spacer" />}

        <div
          ref={boardRef}
          className="grid-stage"
          onPointerUp={() => {
            void finishSelection();
          }}
          onPointerCancel={clearSelection}
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
            onCellPointerDown={beginSelection}
            onCellPointerEnter={extendSelection}
            onCellPointerUp={() => {
              void finishSelection();
            }}
            registerCellRef={registerCellRef}
          />
        </div>

        <div className="bottom-bar">
          <button
            type="button"
            className={`hint-button ${canUseHint ? "is-ready" : ""}`}
            onClick={useHint}
            disabled={!canUseHint}
          >
            <span className="hint-charge" style={{ width: `${hintChargePercent}%` }} aria-hidden="true" />
            <span className="hint-label">Hint</span>
          </button>

          <p className="progress-tally">
            <strong>{foundEntryIndexes.length}</strong> of <strong>{normalizedThemeEntries.length}</strong> theme
            words found.
          </p>
        </div>
      </div>
    </main>
  );
}
