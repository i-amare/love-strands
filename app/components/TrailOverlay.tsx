"use client";

import { Coordinate } from "../lib/selectionRules";

interface TrailOverlayProps {
  selectedPath: Coordinate[];
  foundPaths: { word: string; path: Coordinate[] }[];
  cellCenters: Map<string, { x: number; y: number }>;
}

export default function TrailOverlay({
  selectedPath,
  foundPaths,
  cellCenters,
}: TrailOverlayProps) {
  const getPoints = (path: Coordinate[]) => {
    return path
      .map((p) => {
        const key = `${p.r}-${p.c}`;
        const center = cellCenters.get(key);
        return center ? `${center.x},${center.y}` : "";
      })
      .filter(Boolean)
      .join(" ");
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none -z-0">
      {/* Found paths */}
      {foundPaths.map((fp, i) => (
        <polyline
          key={`found-${i}`}
          points={getPoints(fp.path)}
          fill="none"
          stroke="#60A5FA" // Blue-400
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
      ))}

      {/* Current selection */}
      {selectedPath.length > 0 && (
        <polyline
          points={getPoints(selectedPath)}
          fill="none"
          stroke="#FACC15" // Yellow-400
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
      )}
    </svg>
  );
}
