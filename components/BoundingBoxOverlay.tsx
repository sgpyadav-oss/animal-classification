
import React, { useMemo } from 'react';
import { Detection } from '../types';

interface BoundingBoxOverlayProps {
  detections: Detection[];
  containerWidth: number;
  containerHeight: number;
}

const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({ detections, containerWidth, containerHeight }) => {
  const colors = [
    '#38bdf8', // Blue
    '#4ade80', // Green
    '#fb923c', // Orange
    '#f472b6', // Pink
    '#a78bfa', // Purple
    '#facc15', // Yellow
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {detections.map((det, index) => {
        const [ymin, xmin, ymax, xmax] = det.box_2d;
        
        // Convert normalized 0-1000 coordinates to pixels
        const top = (ymin / 1000) * containerHeight;
        const left = (xmin / 1000) * containerWidth;
        const width = ((xmax - xmin) / 1000) * containerWidth;
        const height = ((ymax - ymin) / 1000) * containerHeight;

        const color = colors[index % colors.length];

        return (
          <div
            key={`${det.label}-${index}`}
            className="absolute border-2 transition-all duration-300 ease-out"
            style={{
              top: `${top}px`,
              left: `${left}px`,
              width: `${width}px`,
              height: `${height}px`,
              borderColor: color,
              boxShadow: `0 0 10px ${color}44`,
            }}
          >
            <div 
              className="absolute -top-6 left-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {det.label} ({Math.round(det.confidence * 100)}%)
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BoundingBoxOverlay;
