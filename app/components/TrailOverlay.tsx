"use client";

import type { GridCell } from "../lib/puzzle";
import { keyFromCell } from "../lib/selectionRules";

type Point = {
  x: number;
  y: number;
};

type TrailOverlayProps = {
  width: number;
  height: number;
  cellCenters: Record<string, Point>;
  activePath: GridCell[];
  foundPaths: GridCell[][];
};

function polylinePoints(path: GridCell[], centers: Record<string, Point>): string {
  return path
    .map((cell) => centers[keyFromCell(cell)])
    .filter(Boolean)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
}

export default function TrailOverlay({
  width,
  height,
  cellCenters,
  activePath,
  foundPaths,
}: TrailOverlayProps) {
  if (width === 0 || height === 0) {
    return null;
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-2"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      {foundPaths.map((path, index) => {
        const points = polylinePoints(path, cellCenters);
        if (!points) {
          return null;
        }

        return (
          <polyline
            key={`found-${index}`}
            className="fill-none [stroke-linecap:round] [stroke-linejoin:round] stroke-9 stroke-(--trail-blue)"
            points={points}
          />
        );
      })}
      {activePath.length > 1 ? (
        <polyline
          className="fill-none [stroke-linecap:round] [stroke-linejoin:round] stroke-9 stroke-(--trail-grey)"
          points={polylinePoints(activePath, cellCenters)}
        />
      ) : null}
    </svg>
  );
}
