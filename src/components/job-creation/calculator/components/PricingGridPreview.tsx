
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from '../calculationUtils';
import { usePricingGrid } from '@/hooks/usePricingGrids';
import { Loader2, Info, FileSpreadsheet } from "lucide-react";
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
  const { data: gridData, isLoading, refetch } = usePricingGrid(gridId);

  // Force refetch when dialog opens
  React.useEffect(() => {
    if (isOpen && gridId) {
      refetch();
    }
  }, [isOpen, gridId, refetch]);

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

  const renderCSVTable = () => {
    if (!gridData?.grid_data) {
      return (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No CSV pricing data available</p>
        </div>
      );
    }

    const typedGridData = gridData.grid_data as GridData;
    
    if (!typedGridData.rows || !typedGridData.columns) {
      return (
        <div className="text-center py-8 bg-red-50 rounded-lg border-2 border-dashed border-red-300">
          <FileSpreadsheet className="h-12 w-12 text-red-400 mx-auto mb-2" />
          <p className="text-red-500">Invalid CSV grid format</p>
        </div>
      );
    }

    const { rows, columns } = typedGridData;

    return (
      <div className="bg-white rounded-lg border shadow-sm">
        {/* CSV Header Info */}
        <div className="bg-gray-50 px-4 py-3 border-b">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="font-medium">CSV Pricing Matrix</span>
            <span className="text-gray-400">•</span>
            <span>{rows.length} drop ranges × {columns.length} width ranges</span>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-3 py-3 text-left font-semibold text-gray-700 border-r border-gray-300 bg-gray-100">
                  Drop Range (cm)
                </th>
                {columns.map((col: any, index: number) => (
                  <th 
                    key={index} 
                    className={`px-3 py-3 text-center font-semibold border-r border-gray-200 min-w-[100px] ${
                      matchingCell?.colIndex === index 
                        ? 'bg-blue-100 text-blue-800 border-blue-300' 
                        : 'text-gray-700 bg-gray-50'
                    }`}
                  >
                    <div className="text-xs text-gray-500 mb-1">Width</div>
                    <div className="font-medium">{col.width_min}-{col.width_max}cm</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, rowIndex: number) => (
                <tr 
                  key={rowIndex} 
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    matchingCell?.rowIndex === rowIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className={`px-3 py-3 font-medium border-r border-gray-300 ${
                    matchingCell?.rowIndex === rowIndex 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-700 bg-gray-50'
                  }`}>
                    <div className="text-xs text-gray-500 mb-1">Drop</div>
                    <div className="font-medium">{row.drop_min}-{row.drop_max}cm</div>
                  </td>
                  {columns.map((col: any, colIndex: number) => {
                    const value = parseFloat(row[col.key]) || 0;
                    const isMatchingCell = matchingCell?.rowIndex === rowIndex && 
                                         matchingCell?.colIndex === colIndex;
                    return (
                      <td 
                        key={colIndex} 
                        className={`px-3 py-3 text-center border-r border-gray-200 ${
                          isMatchingCell 
                            ? 'bg-blue-200 font-bold text-blue-900 ring-2 ring-blue-400 ring-inset' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-mono text-base">
                          {formatCurrency(value)}
                        </div>
                        {value > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            ${value.toFixed(2)}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer with stats */}
        <div className="bg-gray-50 px-4 py-3 border-t text-xs text-gray-600">
          <div className="flex justify-between items-center">
            <span>
              Price range: {formatCurrency(Math.min(...rows.flatMap(row => 
                columns.map(col => parseFloat(row[col.key]) || 0)
              )))} - {formatCurrency(Math.max(...rows.flatMap(row => 
                columns.map(col => parseFloat(row[col.key]) || 0)
              ))))}
            </span>
            <span>
              Total cells: {rows.length * columns.length}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            CSV Pricing Grid: {gridName || gridData?.name || 'Unknown Grid'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-3" />
                <span className="text-gray-600">Loading CSV pricing grid...</span>
              </div>
            </div>
          ) : (
            <>
              {currentWidth && currentDrop && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <div className="flex items-center justify-between">
                      <span>
                        <strong>Current Selection:</strong> Width {currentWidth}cm × Drop {currentDrop}cm
                      </span>
                      {matchingCell && (
                        <span className="font-bold bg-blue-200 px-2 py-1 rounded">
                          Price: {formatCurrency(parseFloat(matchingCell.value) || 0)}
                        </span>
                      )}
                    </div>
                    {!matchingCell && (
                      <div className="text-orange-600 font-medium mt-1">
                        ⚠️ No matching price found in CSV grid for these dimensions
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-2">About this CSV pricing grid:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Manufacturing costs are calculated based on width and drop measurements</li>
                  <li>• Each cell represents the cost for that specific size range combination</li>
                  <li>• The highlighted cell shows your current calculation match</li>
                  <li>• Hover over cells to see detailed pricing information</li>
                </ul>
              </div>
              
              {renderCSVTable()}
            </>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Close CSV Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
