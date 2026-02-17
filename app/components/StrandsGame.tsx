"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  GRID_COLUMNS,
  GRID_ROWS,
  STATIC_PUZZLE,
  toWordFromPath,
  type GridCell,
} from "../lib/puzzle";
import {
  cellKey,
  isAdjacent,
  isSameCell,
  keyFromCell,
} from "../lib/selectionRules";
import LetterGrid from "./LetterGrid";
import TrailOverlay from "./TrailOverlay";

type ValidationResponse = {
  valid: boolean;
};

type ToastState = {
  kind: "error" | "info";
  message: string;
} | null;

type Point = {
  x: number;
  y: number;
};

const HINT_COST = 3;
const INVALID_WORD_MESSAGE = "Word not found";
const TOO_SHORT_WORD_MESSAGE = "Too short";
const ALREADY_FOUND_WORD_MESSAGE = "Already found";
const SPANGRAM_FOUND_MESSAGE = "SPANGRAM!!";

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
  const remeasureRafRef = useRef<number | null>(null);

  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [cellCenters, setCellCenters] = useState<Record<string, Point>>({});
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedPath, setSelectedPath] = useState<GridCell[]>([]);
  const [foundEntryIndexes, setFoundEntryIndexes] = useState<number[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [hintedEntryIndex, setHintedEntryIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [completionPopupDismissed, setCompletionPopupDismissed] =
    useState(false);

  useEffect(() => {
    validateEnglishWord("");
  }, []);

  const foundEntrySet = useMemo(
    () => new Set(foundEntryIndexes),
    [foundEntryIndexes],
  );
  const foundWordSet = useMemo(() => new Set(foundWords), [foundWords]);
  const [spangramEntryIndex] = useState(themeEntries.length - 1);

  const computePositions = useCallback(() => {
    const board = boardRef.current;
    if (!board) {
      return;
    }

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
  }, []);

  const scheduleComputePositions = useCallback(() => {
    if (remeasureRafRef.current !== null) {
      window.cancelAnimationFrame(remeasureRafRef.current);
    }

    remeasureRafRef.current = window.requestAnimationFrame(() => {
      remeasureRafRef.current = null;
      computePositions();
    });
  }, [computePositions]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) {
      return;
    }

    const resizeObserver = new ResizeObserver(scheduleComputePositions);
    resizeObserver.observe(board);
    window.addEventListener("resize", scheduleComputePositions);
    window.addEventListener("orientationchange", scheduleComputePositions);
    window.visualViewport?.addEventListener("resize", scheduleComputePositions);
    window.visualViewport?.addEventListener("scroll", scheduleComputePositions);
    scheduleComputePositions();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleComputePositions);
      window.removeEventListener("orientationchange", scheduleComputePositions);
      window.visualViewport?.removeEventListener(
        "resize",
        scheduleComputePositions,
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        scheduleComputePositions,
      );
      if (remeasureRafRef.current !== null) {
        window.cancelAnimationFrame(remeasureRafRef.current);
      }
    };
  }, [scheduleComputePositions]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 1300);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedWord = useMemo(
    () => toWordFromPath(selectedPath, grid),
    [selectedPath, grid],
  );

  const selectedKeys = useMemo(
    () => new Set(selectedPath.map((cell) => keyFromCell(cell))),
    [selectedPath],
  );

  const foundKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const entryIndex of foundEntryIndexes) {
      const entry = normalizedThemeEntries[entryIndex];
      if (!entry || entryIndex == spangramEntryIndex) {
        continue;
      }

      for (const cell of entry.solution) {
        keys.add(keyFromCell(cell));
      }
    }
    return keys;
  }, [foundEntryIndexes, normalizedThemeEntries, spangramEntryIndex]);

  const spangramKeys = useMemo(() => {
    const keys = new Set<string>();
    if (spangramEntryIndex < 0 || !foundEntrySet.has(spangramEntryIndex)) {
      return keys;
    }

    const spangramEntry = normalizedThemeEntries[spangramEntryIndex];
    if (!spangramEntry) {
      return keys;
    }

    for (const cell of spangramEntry.solution) {
      keys.add(keyFromCell(cell));
    }

    return keys;
  }, [foundEntrySet, normalizedThemeEntries, spangramEntryIndex]);

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

  function registerCellRef(
    row: number,
    col: number,
    node: HTMLButtonElement | null,
  ) {
    cellRefs.current[cellKey(row, col)] = node;
  }

  function beginSelection(row: number, col: number) {
    setToast(null);
    setIsSelecting(true);
    setSelectedPath([{ row, col }]);
  }

  function handleCellPointerDown(
    row: number,
    col: number,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
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
    if (word.length < 4) {
      setToast({ kind: "error", message: TOO_SHORT_WORD_MESSAGE });
      return;
    }

    const matchedThemeEntryIndex = normalizedThemeEntries.findIndex((entry) =>
      arePathsEqual(path, entry.solution),
    );

    if (matchedThemeEntryIndex >= 0) {
      if (foundEntrySet.has(matchedThemeEntryIndex)) {
        setToast({ kind: "error", message: ALREADY_FOUND_WORD_MESSAGE });
        return;
      }

      setFoundEntryIndexes((current) => [...current, matchedThemeEntryIndex]);
      setFoundWords((current) =>
        current.includes(word) ? current : [...current, word],
      );
      setHintedEntryIndex((current) =>
        current === matchedThemeEntryIndex ? null : current,
      );
      if (matchedThemeEntryIndex === spangramEntryIndex) {
        setToast({ kind: "info", message: SPANGRAM_FOUND_MESSAGE });
      }
      return;
    }

    if (foundWordSet.has(word)) {
      setToast({ kind: "error", message: ALREADY_FOUND_WORD_MESSAGE });
      return;
    }

    const isValid = await validateEnglishWord(word);
    if (isValid) {
      setPoints((current) => current + 1);
      setFoundWords((current) =>
        current.includes(word) ? current : [...current, word],
      );
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
    const cell = cellFromElement(
      document.elementFromPoint(event.clientX, event.clientY),
    );
    if (!cell) {
      return;
    }

    extendSelection(cell.row, cell.col);
  }

  function handleBoardPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      activePointerIdRef.current !== null &&
      activePointerIdRef.current !== event.pointerId
    ) {
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

    const nextHintEntryIndex = normalizedThemeEntries.findIndex(
      (_, entryIndex) => !foundEntrySet.has(entryIndex),
    );
    if (nextHintEntryIndex < 0) {
      return;
    }

    setHintedEntryIndex(nextHintEntryIndex);
    setPoints((current) => Math.max(0, current - HINT_COST));
  }

  const hintChargeLevel = Math.min(points, HINT_COST);
  const hintChargePercent = (hintChargeLevel / HINT_COST) * 100;
  const canUseHint = points >= HINT_COST;
  const isPuzzleComplete =
    normalizedThemeEntries.length > 0 &&
    foundEntryIndexes.length === normalizedThemeEntries.length;
  const showCompletionPopup = isPuzzleComplete && !completionPopupDismissed;

  return (
    <main className="app-shell gradient-background flex justify-center px-4">
      <div className="flex w-full max-w-xl flex-col gap-2 sm:gap-3">
        <h1 className="font-love text-pink-accent-bright m-0 pb-4 text-center text-4xl leading-tight tracking-wide [text-shadow:0_0_14px_rgba(255,98,170,0.6)]">
          Love Strands
        </h1>

        <section
          className="mx-6 overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-lg"
          aria-label="Today's Theme"
        >
          <p className="bg-theme-teal m-0 text-center font-extrabold tracking-[0.04em] text-white uppercase">
            Today&apos;s Theme
          </p>
          <h2 className="m-0 px-2 py-4 text-center text-xl font-bold tracking-wide">
            {theme}
          </h2>
        </section>

        <p
          className="mt-1 min-h-9 text-center text-[clamp(1.05rem,4.8vw,1.5rem)] font-bold tracking-[0.18em] text-[#f8f9ff] uppercase sm:min-h-10"
          style={{
            color: toast?.kind === "error" ? "#ff6467" : "var(--foreground)",
          }}
          aria-live="polite"
        >
          {selectedWord || toast?.message || "\u00A0"}
        </p>

        <div
          ref={boardRef}
          className="relative mx-auto mt-1 w-full max-w-lg px-8"
          onPointerMove={handleBoardPointerMove}
          onPointerUp={handleBoardPointerUp}
          onPointerCancel={handleBoardPointerCancel}
        >
          <TrailOverlay
            width={boardSize.width}
            height={boardSize.height}
            cellCenters={cellCenters}
            activePath={selectedPath}
            foundPaths={foundEntryIndexes
              .filter((entryIndex) => entryIndex !== spangramEntryIndex)
              .map(
                (entryIndex) =>
                  normalizedThemeEntries[entryIndex]?.solution ?? [],
              )}
            spangramPaths={
              foundEntryIndexes.includes(spangramEntryIndex)
                ? [normalizedThemeEntries[spangramEntryIndex]?.solution ?? []]
                : []
            }
          />
          <LetterGrid
            grid={grid}
            selectedKeys={selectedKeys}
            foundKeys={foundKeys}
            spangramKeys={spangramKeys}
            hintedKeys={hintedKeys}
            onCellPointerDown={handleCellPointerDown}
            registerCellRef={registerCellRef}
          />
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            className={`relative inline-flex h-10 min-w-22 items-center justify-center overflow-hidden rounded-full border-2 text-[#d8d9e2] disabled:opacity-100 ${
              canUseHint
                ? "cursor-pointer border-[#f5f6fb]"
                : "cursor-not-allowed border-[#272a35]"
            }`}
            onClick={useHint}
            disabled={!canUseHint}
          >
            <span
              className="absolute inset-y-0 left-0 bg-white transition-all duration-200 ease-in-out"
              style={{ width: `${hintChargePercent}%` }}
              aria-hidden="true"
            />
            <span className="relative z-10 text-xl tracking-tight mix-blend-difference">
              Hint
            </span>
          </button>

          <p className="m-0 text-right text-lg leading-normal">
            <strong>{foundEntryIndexes.length}</strong> of{" "}
            <strong>{normalizedThemeEntries.length}</strong> theme words found.
          </p>
        </div>
      </div>

      {showCompletionPopup ? (
        <div
          className="valentine-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Valentine's Day celebration"
        >
          <div className="valentine-card">
            <p className="font-love text-pink-accent-bright m-0 text-[clamp(2rem,7vw,3.2rem)] leading-snug tracking-wide">
              Happy Valentine&apos;s Day
            </p>
            <p className="m-0 text-xl font-semibold tracking-wide text-white">
              {"I love you baby <3"}
            </p>
            <button
              type="button"
              className="mt-1.5 min-w-28 cursor-pointer rounded-full border border-[rgba(255,176,217,0.66)] bg-[rgba(255,176,217,0.14)] px-5 py-1.5 font-bold tracking-tight text-[#fff3fa] transition-all duration-150 ease-in-out hover:-translate-y-px hover:bg-[rgba(255,176,217,0.24)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(255,176,217,0.95)]"
              onClick={() => setCompletionPopupDismissed(true)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
