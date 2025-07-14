
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

  const grid = gridData.grid_data;
  const rows = grid.rows || [];
  const columns = grid.columns || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-100">Drop Range</th>
                {columns.map((col, index) => (
                  <th key={index} className="border border-gray-300 p-2 bg-gray-100">
                    {col.width_min}m - {col.width_max}m
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="border border-gray-300 p-2 font-medium">
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
                        className={`border border-gray-300 p-2 text-center ${
                          isHighlighted ? 'bg-blue-100 font-bold' : ''
                        }`}
                      >
                        ${cellValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {currentWidth && currentDrop && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Current Selection:</h4>
            <p>Width: {currentWidth}m, Drop: {currentDrop}m</p>
            <p className="text-sm text-gray-600">
              Highlighted cell shows the price for your current dimensions.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
