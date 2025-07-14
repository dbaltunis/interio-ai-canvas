
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from '../calculationUtils';
import { usePricingGrid } from '@/hooks/usePricingGrids';
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PricingGridPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  gridId: string;
  gridName?: string;
  currentWidth?: number;
  currentDrop?: number;
}

interface GridData {
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

  if (!gridId) return null;

  const findMatchingCell = (width: number, drop: number) => {
    if (!gridData?.grid_data) return null;
    
    const typedGridData = gridData.grid_data as GridData;
    if (!typedGridData.rows || !typedGridData.columns) return null;

    const { rows, columns } = typedGridData;
    
    // Find matching row
    const matchingRow = rows.find(row => 
      row.drop_min <= drop && drop <= row.drop_max
    );
    
    // Find matching column
    const matchingColumn = columns.find(col => 
      col.width_min <= width && width <= col.width_max
    );
    
    if (matchingRow && matchingColumn) {
      return {
        rowIndex: rows.indexOf(matchingRow),
        colIndex: columns.indexOf(matchingColumn),
        value: matchingRow[matchingColumn.key]
      };
    }
    
    return null;
  };

  const matchingCell = currentWidth && currentDrop ? 
    findMatchingCell(currentWidth, currentDrop) : null;

  const renderGridTable = () => {
    if (!gridData?.grid_data) {
      return <div className="text-center py-4">No pricing data available</div>;
    }

    const typedGridData = gridData.grid_data as GridData;
    
    if (!typedGridData.rows || !typedGridData.columns) {
      return <div className="text-center py-4">Invalid pricing grid format</div>;
    }

    const { rows, columns } = typedGridData;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                Drop Range (cm)
              </th>
              {columns.map((col: any, index: number) => (
                <th 
                  key={index} 
                  className={`border border-gray-300 px-3 py-2 text-center font-semibold ${
                    matchingCell?.colIndex === index ? 'bg-blue-100' : ''
                  }`}
                >
                  {col.width_min}-{col.width_max}cm
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, rowIndex: number) => (
              <tr 
                key={rowIndex} 
                className={`${rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
                  matchingCell?.rowIndex === rowIndex ? 'bg-blue-50' : ''
                }`}
              >
                <td className={`border border-gray-300 px-3 py-2 font-medium ${
                  matchingCell?.rowIndex === rowIndex ? 'bg-blue-100' : ''
                }`}>
                  {row.drop_min}-{row.drop_max}cm
                </td>
                {columns.map((col: any, colIndex: number) => {
                  const isMatchingCell = matchingCell?.rowIndex === rowIndex && 
                                       matchingCell?.colIndex === colIndex;
                  return (
                    <td 
                      key={colIndex} 
                      className={`border border-gray-300 px-3 py-2 text-center ${
                        isMatchingCell ? 'bg-blue-200 font-bold' : ''
                      }`}
                    >
                      {formatCurrency(parseFloat(row[col.key]) || 0)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Pricing Grid Preview: {gridName || gridData?.name || 'Unknown Grid'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading pricing grid...</span>
            </div>
          ) : (
            <>
              {currentWidth && currentDrop && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Current calculation: Width {currentWidth}cm × Drop {currentDrop}cm
                    {matchingCell && (
                      <span className="font-semibold">
                        {' '}→ Manufacturing cost: {formatCurrency(parseFloat(matchingCell.value) || 0)}
                      </span>
                    )}
                    {!matchingCell && (
                      <span className="text-orange-600">
                        {' '}→ No matching price found in grid
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-sm text-gray-600">
                This pricing grid shows manufacturing costs based on width and drop measurements. 
                {matchingCell && <span className="font-medium">The highlighted cell shows the current calculation.</span>}
              </div>
              
              {renderGridTable()}
              
              {gridData?.grid_data && (
                <div className="text-xs text-gray-500 mt-4">
                  Grid contains {(gridData.grid_data as GridData).rows?.length || 0} drop ranges 
                  and {(gridData.grid_data as GridData).columns?.length || 0} width ranges
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
