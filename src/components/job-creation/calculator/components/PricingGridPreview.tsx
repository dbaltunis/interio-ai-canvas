
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from '../calculationUtils';
import { usePricingGrid } from '@/hooks/usePricingGrids';
import { Loader2 } from "lucide-react";

interface PricingGridPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  gridId: string;
  gridName?: string;
}

export const PricingGridPreview = ({ 
  isOpen, 
  onClose, 
  gridId, 
  gridName 
}: PricingGridPreviewProps) => {
  const { data: gridData, isLoading } = usePricingGrid(gridId);

  if (!gridId) return null;

  const renderGridTable = () => {
    if (!gridData?.grid_data?.rows || !gridData?.grid_data?.columns) {
      return <div className="text-center py-4">No pricing data available</div>;
    }

    const { rows, columns } = gridData.grid_data;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-3 py-2 text-left">Drop Range (cm)</th>
              {columns.map((col: any, index: number) => (
                <th key={index} className="border border-gray-300 px-3 py-2 text-center">
                  {col.width_min}-{col.width_max}cm
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, rowIndex: number) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border border-gray-300 px-3 py-2 font-medium">
                  {row.drop_min}-{row.drop_max}cm
                </td>
                {columns.map((col: any, colIndex: number) => (
                  <td key={colIndex} className="border border-gray-300 px-3 py-2 text-center">
                    {formatCurrency(parseFloat(row[col.key]) || 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
              <div className="text-sm text-gray-600">
                This pricing grid shows manufacturing costs based on width and drop measurements.
              </div>
              {renderGridTable()}
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
