"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { puzzle } from "../lib/puzzles";
import { Coordinate, isValidNextStep, getWordFromPath } from "../lib/selectionRules";
import { solveWordPath } from "../lib/solveWordPath";
import LetterGrid from "./LetterGrid";
import TrailOverlay from "./TrailOverlay";

export default function StrandsGame() {
  const [selectedPath, setSelectedPath] = useState<Coordinate[]>([]);
  const [foundPaths, setFoundPaths] = useState<{ word: string; path: Coordinate[] }[]>([]);
  const [points, setPoints] = useState(0);
  const [hintedWord, setHintedWord] = useState<string | null>(null);
  const [hintedPath, setHintedPath] = useState<Coordinate[] | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cellCenters, setCellCenters] = useState<Map<string, { x: number; y: number }>>(new Map());

  // Derived state
  const selectedWord = getWordFromPath(puzzle.grid, selectedPath);
  const foundThemeWordsCount = foundPaths.filter(fp => puzzle.themeWords.includes(fp.word)).length;
  const isHintAvailable = points >= 3;

  // Clear error after timeout
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Selection handlers
  const handleSelectionStart = (pos: Coordinate) => {
    setSelectedPath([pos]);
    setErrorMsg(null);
  };

  const handleSelectionMove = (pos: Coordinate) => {
    if (isValidNextStep(selectedPath, pos)) {
      setSelectedPath((prev) => [...prev, pos]);
    } else {
      // Check if we are backtracking (removing last item)
      if (selectedPath.length > 1) {
        const secondLast = selectedPath[selectedPath.length - 2];
        if (secondLast.r === pos.r && secondLast.c === pos.c) {
          setSelectedPath((prev) => prev.slice(0, -1));
        }
      }
    }
  };

  const handleSelectionEnd = async () => {
    if (selectedPath.length === 0) return;

    const word = getWordFromPath(puzzle.grid, selectedPath);
    
    // Check if it's a theme word
    if (puzzle.themeWords.includes(word)) {
      if (foundPaths.some(fp => fp.word === word)) {
        setErrorMsg("Already found!");
      } else {
        setFoundPaths(prev => [...prev, { word, path: selectedPath }]);
        // If this word was hinted, clear the hint
        if (hintedWord === word) {
          setHintedWord(null);
          setHintedPath(undefined);
        }
      }
    } else {
      // Check if it's a valid English word
      try {
        const response = await fetch("/api/validate-word", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word }),
        });
        const data = await response.json();
        
        if (data.valid) {
          setPoints(prev => prev + 1);
          // Show "Nice!" or similar feedback?
          setErrorMsg("Nice! +1");
        } else {
          setErrorMsg("Not a valid word");
        }
      } catch (e) {
        console.error("Validation failed", e);
        setErrorMsg("Error validating word");
      }
    }

    setSelectedPath([]);
  };

  const handleHint = () => {
    if (points < 3) return;

    // Find unfound theme words
    const foundWords = new Set(foundPaths.map(fp => fp.word));
    const unfound = puzzle.themeWords.filter(w => !foundWords.has(w));
    
    if (unfound.length === 0) return;

    // Pick one
    const target = unfound[0];
    const path = solveWordPath(puzzle.grid, target);

    if (path) {
      setPoints(prev => prev - 3);
      setHintedWord(target);
      setHintedPath(path);
    } else {
      setErrorMsg("Could not find path for hint!");
    }
  };

  const updateCellCenters = () => {
    // This function will be called by LetterGrid to trigger measurement
    // But since LetterGrid has the DOM, we need to query the DOM here or inside LetterGrid
    // We'll rely on querying DOM elements with data-cell attribute
    const newCenters = new Map<string, { x: number; y: number }>();
    const cells = document.querySelectorAll('[data-cell="true"]');
    const container = document.getElementById("grid-container");
    
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    cells.forEach((cell) => {
      const r = cell.getAttribute("data-row");
      const c = cell.getAttribute("data-col");
      if (r && c) {
        const rect = cell.getBoundingClientRect();
        newCenters.set(`${r}-${c}`, {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top
        });
      }
    });
    setCellCenters(newCenters);
  };

  // Hint button fill calculation
  // 0 -> 0%, 1 -> 33%, 2 -> 66%, 3 -> 100%
  // But strictly: 0 -> gray, 1 -> 1/3, 2 -> 2/3, 3 -> full
  const hintFillPercent = Math.min(points, 3) * 33.33 + (points >= 3 ? 0.01 : 0); 
  // actually 100/3 is 33.33. 3*33.33 = 99.99. Close enough.

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 gap-6 relative">
      {/* Title */}
      <h1 className="text-5xl text-pink-400 font-dancing drop-shadow-md z-20" style={{ fontFamily: 'var(--font-dancing-script)' }}>
        Love Strands
      </h1>

      {/* Theme Card */}
      <div className="w-full bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 shadow-lg relative z-20">
        <div className="bg-teal-700 h-6 w-full flex items-center justify-center">
          <span className="text-xs font-bold tracking-widest text-teal-100 uppercase">Today's Theme</span>
        </div>
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold text-white">{puzzle.theme}</h2>
        </div>
      </div>

      {/* Selected Word & Error */}
      <div className="h-8 flex items-center justify-center relative z-20">
        {selectedWord ? (
          <span className="text-2xl font-bold text-white tracking-widest">{selectedWord}</span>
        ) : errorMsg ? (
          <span className="text-xl font-bold text-red-400 animate-pulse">{errorMsg}</span>
        ) : (
          <span className="text-zinc-600">Drag to connect letters</span>
        )}
      </div>

      {/* Grid Container */}
      <div id="grid-container" className="relative w-full z-10">
        <TrailOverlay 
          selectedPath={selectedPath} 
          foundPaths={foundPaths} 
          cellCenters={cellCenters} 
        />
        <LetterGrid
          grid={puzzle.grid}
          selectedPath={selectedPath}
          foundPaths={foundPaths}
          hintedPath={hintedPath}
          onSelectionStart={handleSelectionStart}
          onSelectionMove={handleSelectionMove}
          onSelectionEnd={handleSelectionEnd}
          updateCellCenters={updateCellCenters}
        />
      </div>

      {/* Bottom Controls */}
      <div className="w-full flex items-center justify-between mt-4 z-20">
        {/* Hint Button */}
        <button
          onClick={handleHint}
          disabled={!isHintAvailable}
          className={`
            relative px-6 py-2 rounded-full overflow-hidden border border-zinc-700 transition-all
            ${isHintAvailable ? "cursor-pointer hover:border-white" : "cursor-not-allowed opacity-80"}
          `}
        >
          {/* Fill background */}
          <div 
            className="absolute inset-0 bg-white transition-all duration-300 ease-out"
            style={{ width: `${Math.min(points, 3) * 33.34}%` }} // 33.34 * 3 > 100
          />
          
          <span className={`relative z-10 font-bold ${points >= 1 ? "text-black mix-blend-difference" : "text-zinc-500"}`}>
            Hint
          </span>
        </button>

        {/* Tally */}
        <div className="text-sm font-medium text-zinc-400">
          <span className="text-white">{foundThemeWordsCount}</span> of <span className="text-white">{puzzle.themeWords.length}</span> theme words found.
        </div>
      </div>
    </div>
  );
}
