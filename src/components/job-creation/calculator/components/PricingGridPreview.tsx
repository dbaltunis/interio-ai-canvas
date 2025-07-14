
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePricingGrid } from '@/hooks/usePricingGrids';
import { Badge } from "@/components/ui/badge";

interface PricingGridPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  gridId: string;
  gridName?: string;
  currentWidth?: number;
  currentDrop?: number;
}

interface GridDataStructure {
  rows?: Array<{
    drop_min: number;
    drop_max: number;
    [key: string]: any;
  }>;
  columns?: Array<{
    width_min: number;
    width_max: number;
    key: string;
  }>;
}

export const PricingGridPreview = ({
  isOpen,
  onClose,
  gridId,
  gridName,
  currentWidth,
  currentDrop
}: PricingGridPreviewProps) => {
  const { data: gridData, isLoading } = usePricingGrid(gridId);

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Pricing Grid...</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!gridData || !gridData.grid_data) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pricing Grid Not Found</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">No pricing grid data available.</div>
        </DialogContent>
      </Dialog>
    );
  }

  // Type cast the grid_data to our expected structure
  const grid = gridData.grid_data as GridDataStructure;
  const rows = grid.rows || [];
  const columns = grid.columns || [];

  console.log("Grid data:", { grid, rows, columns, gridData });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {gridName || gridData.name || 'Pricing Grid'}
            {currentWidth && currentDrop && (
              <Badge variant="outline">
                {currentWidth}m × {currentDrop}m
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-x-auto border rounded-md">
          {rows.length > 0 && columns.length > 0 ? (
            <table className="w-full border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border border-gray-300 p-3 text-left font-semibold bg-slate-100">
                    Drop Range
                  </th>
                  {columns.map((col, index) => (
                    <th key={index} className="border border-gray-300 p-3 text-center font-semibold bg-slate-100">
                      {col.width_min}m - {col.width_max}m
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50">
                    <td className="border border-gray-300 p-3 font-medium bg-slate-50">
                      {row.drop_min}m - {row.drop_max}m
                    </td>
                    {columns.map((col, colIndex) => {
                      const cellValue = row[col.key] || 0;
                      const isHighlighted = currentWidth && currentDrop &&
                        currentWidth >= col.width_min && currentWidth <= col.width_max &&
                        currentDrop >= row.drop_min && currentDrop <= row.drop_max;
                      
                      return (
                        <td 
                          key={colIndex} 
                          className={`border border-gray-300 p-3 text-center ${
                            isHighlighted ? 'bg-blue-100 font-bold text-blue-900' : 'bg-white'
                          }`}
                        >
                          ${parseFloat(cellValue).toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">No pricing grid data available</p>
              <p className="text-sm mt-2">
                This pricing grid appears to be empty or has an incompatible format.
              </p>
              {gridData.grid_data && (
                <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs">
                  <p className="font-semibold">Raw data structure:</p>
                  <pre className="mt-2 overflow-auto">
                    {JSON.stringify(gridData.grid_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        {currentWidth && currentDrop && rows.length > 0 && columns.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-2 text-blue-900">Current Selection:</h4>
            <p className="text-blue-800">
              Width: <span className="font-semibold">{currentWidth}m</span>, 
              Drop: <span className="font-semibold">{currentDrop}m</span>
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Highlighted cell shows the price for your current dimensions.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
