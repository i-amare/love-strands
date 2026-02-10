"use client";

import { useEffect, useRef, useState } from "react";
import { Coordinate } from "../lib/selectionRules";

interface LetterGridProps {
  grid: string[][];
  selectedPath: Coordinate[];
  foundPaths: { word: string; path: Coordinate[] }[];
  hintedPath?: Coordinate[]; // For the dotted circles
  onSelectionStart: (pos: Coordinate) => void;
  onSelectionMove: (pos: Coordinate) => void;
  onSelectionEnd: () => void;
  updateCellCenters: () => void; // Signal to parent/overlay to update measurements
}

export default function LetterGrid({
  grid,
  selectedPath,
  foundPaths,
  hintedPath,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  updateCellCenters,
}: LetterGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Helper to check if a cell is selected
  const isSelected = (r: number, c: number) => 
    selectedPath.some((p) => p.r === r && p.c === c);

  // Helper to check if a cell is found
  const isFound = (r: number, c: number) => 
    foundPaths.some((fp) => fp.path.some((p) => p.r === r && p.c === c));

  // Helper to check if a cell is hinted
  const isHinted = (r: number, c: number) =>
    hintedPath?.some((p) => p.r === r && p.c === c);

  // Handle pointer events for drag selection
  const handlePointerDown = (e: React.PointerEvent, r: number, c: number) => {
    e.preventDefault(); // Prevent scrolling
    setIsDragging(true);
    // Capture pointer on the container to track movement outside the initial cell?
    // Actually, for elementFromPoint to work well, we often just listen on window or container.
    // But to prevent scroll, we need touch-action: none on container.
    onSelectionStart({ r, c });
  };

  const handlePointerEnter = (r: number, c: number) => {
    if (isDragging) {
      onSelectionMove({ r, c });
    }
  };
  
  // We also need global pointer up to stop dragging if released outside
  useEffect(() => {
    const handleWindowPointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onSelectionEnd();
      }
    };
    window.addEventListener("pointerup", handleWindowPointerUp);
    return () => window.removeEventListener("pointerup", handleWindowPointerUp);
  }, [isDragging, onSelectionEnd]);

  // Handle pointer move for touch devices (where pointerEnter might not fire if we don't handle it manually)
  // or simply rely on `touch-action: none` and `pointermove` + `elementFromPoint`.
  // Using explicit pointerEnter on buttons works fine for Mouse. For Touch, the target often stays the element you touched first.
  // So we MUST use elementFromPoint for robust touch support.
  
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (target) {
        // Find the closest cell
        const cell = target.closest('[data-cell="true"]');
        if (cell) {
          const r = parseInt(cell.getAttribute("data-row") || "-1");
          const c = parseInt(cell.getAttribute("data-col") || "-1");
          if (r !== -1 && c !== -1) {
            onSelectionMove({ r, c });
          }
        }
      }
    };

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [isDragging, onSelectionMove]);

  // Update measurements on mount and resize
  useEffect(() => {
    updateCellCenters();
    window.addEventListener("resize", updateCellCenters);
    return () => window.removeEventListener("resize", updateCellCenters);
  }, [updateCellCenters]);

  return (
    <div 
      ref={containerRef}
      className="grid grid-cols-6 gap-y-4 gap-x-2 w-full max-w-sm mx-auto touch-none select-none relative z-10"
    >
      {grid.map((row, r) =>
        row.map((letter, c) => {
          const selected = isSelected(r, c);
          const found = isFound(r, c);
          const hinted = isHinted(r, c);
          
          return (
            <div
              key={`${r}-${c}`}
              data-cell="true"
              data-row={r}
              data-col={c}
              onPointerDown={(e) => handlePointerDown(e, r, c)}
              onPointerEnter={() => !isDragging && null /* handled by global move for drag */} 
              className={`
                aspect-[3/4] flex items-center justify-center 
                text-2xl font-bold rounded-full cursor-pointer transition-colors
                ${selected ? "text-black" : found ? "text-blue-400" : "text-white"}
                ${hinted ? "border-2 border-dashed border-blue-400" : ""}
              `}
            >
              {letter}
            </div>
          );
        })
      )}
    </div>
  );
}
