
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

interface DropRow {
  drop: string;
  prices: number[];
}

interface ActualGridDataStructure {
  dropRows?: DropRow[];
  widthColumns?: string[];
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

  // Type cast the grid_data to the actual structure
  const grid = gridData.grid_data as ActualGridDataStructure;
  const dropRows = grid.dropRows || [];
  const widthColumns = grid.widthColumns || [];

  console.log("Grid preview data:", { grid, dropRows, widthColumns, gridData, currentWidth, currentDrop });

  // Generate width column headers from the first price array length if widthColumns is empty
  const columnHeaders = widthColumns.length > 0 
    ? widthColumns 
    : (dropRows.length > 0 ? Array.from({ length: dropRows[0].prices.length }, (_, i) => `Width ${i + 1}`) : []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {gridData.name || 'Pricing Grid'}
            {currentWidth && currentDrop && (
              <Badge variant="outline">
                Current: {currentWidth}cm × {currentDrop}cm
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-x-auto border rounded-md">
          {dropRows.length > 0 ? (
            <table className="w-full border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border border-gray-300 p-3 text-left font-semibold bg-slate-100">
                    Drop (cm)
                  </th>
                  {columnHeaders.map((header, index) => (
                    <th key={index} className="border border-gray-300 p-3 text-center font-semibold bg-slate-100">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dropRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50">
                    <td className="border border-gray-300 p-3 font-medium bg-slate-50">
                      {row.drop}cm
                    </td>
                    {row.prices.map((price, colIndex) => {
                      // Highlight the current selection - values are already in cm
                      const isHighlighted = currentDrop && 
                        parseInt(row.drop) === Math.round(currentDrop); // currentDrop is already in cm
                      
                      return (
                        <td 
                          key={colIndex} 
                          className={`border border-gray-300 p-3 text-center ${
                            isHighlighted ? 'bg-blue-100 font-bold text-blue-900' : 'bg-white'
                          }`}
                        >
                          £{parseFloat(price.toString()).toFixed(2)}
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
                  <pre className="mt-2 overflow-auto max-h-64">
                    {JSON.stringify(gridData.grid_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        {currentWidth && currentDrop && dropRows.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-2 text-blue-900">Current Selection:</h4>
            <p className="text-blue-800">
              Width: <span className="font-semibold">{currentWidth}cm</span>, 
              Drop: <span className="font-semibold">{currentDrop}cm</span>
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Highlighted cell shows the manufacturing price for your current drop dimension.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
