import { useEffect, useState } from "react";

interface CanvasGridProps {
  showGrid?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  children: React.ReactNode;
}

export const CanvasGrid = ({ 
  showGrid = true, 
  snapToGrid = true, 
  gridSize = 20, 
  children 
}: CanvasGridProps) => {
  const [gridPattern, setGridPattern] = useState<string>("");

  useEffect(() => {
    if (showGrid) {
      const pattern = `
        <defs>
          <pattern id="grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
            <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="#e2e8f0" stroke-width="0.5" opacity="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      `;
      setGridPattern(pattern);
    }
  }, [showGrid, gridSize]);

  return (
    <div className="relative w-full h-full">
      {/* Grid Overlay */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <pattern 
                id="canvas-grid" 
                width={gridSize} 
                height={gridSize} 
                patternUnits="userSpaceOnUse"
              >
                <path 
                  d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} 
                  fill="none" 
                  stroke="#e2e8f0" 
                  strokeWidth="0.5" 
                  opacity="0.3"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#canvas-grid)" />
          </svg>
        </div>
      )}

      {/* Rulers */}
      <div className="absolute top-0 left-6 right-0 h-6 bg-white border-b border-gray-200 pointer-events-none">
        <div className="flex text-xs text-gray-400">
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i} className="w-8 border-r border-gray-200 text-center">
              {i * 100}
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute top-6 left-0 bottom-0 w-6 bg-white border-r border-gray-200 pointer-events-none">
        <div className="flex flex-col text-xs text-gray-400">
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i} className="h-8 border-b border-gray-200 text-center leading-8">
              {i * 100}
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="ml-6 mt-6 relative">
        {children}
      </div>
    </div>
  );
};