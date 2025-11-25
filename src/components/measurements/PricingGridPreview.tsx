import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Grid } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface PricingGridPreviewProps {
  gridData: any;
  gridName?: string;
  gridCode?: string;
}

export const PricingGridPreview = ({ gridData, gridName, gridCode }: PricingGridPreviewProps) => {
  const { units } = useMeasurementUnits();
  
  console.log('🔍 PRICING GRID DEBUG:', {
    gridData,
    isArray: Array.isArray(gridData),
    hasWidthColumns: gridData?.widthColumns,
    hasDropRows: gridData?.dropRows,
    keys: gridData ? Object.keys(gridData) : []
  });
  
  if (!gridData) return null;

  const formatPrice = (price: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    const symbol = currencySymbols[units.currency] || units.currency;
    return `${symbol}${price.toFixed(2)}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-3.5 w-3.5" />
          Preview Grid
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5" />
            Pricing Grid Preview
            {gridName && <span className="text-sm text-muted-foreground">- {gridName}</span>}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {/* Check if it's a simple width-only grid */}
          {Array.isArray(gridData) && gridData.length > 0 && 'width' in gridData[0] ? (
            // Width-only grid (e.g., for fascia types)
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground mb-3">Width-based pricing</div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-left">Width (cm)</th>
                    <th className="border border-border p-2 text-left">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {gridData.map((entry: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-border p-2">{entry.width}cm</td>
                      <td className="border border-border p-2 font-medium">{formatPrice(parseFloat(entry.price))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : gridData.widthColumns && gridData.dropRows ? (
            // Full 2D grid (width × drop) - using widthColumns and dropRows format
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="border border-border bg-muted p-2 sticky left-0 z-10">Width / Drop (cm)</th>
                    {gridData.widthColumns.map((width: number) => (
                      <th key={width} className="border border-border bg-muted p-2 min-w-[80px]">
                        {width}cm
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gridData.dropRows.map((dropRow: any) => (
                    <tr key={dropRow.drop}>
                      <td className="border border-border bg-muted p-2 font-medium sticky left-0 z-10">
                        {dropRow.drop}cm
                      </td>
                      {dropRow.prices.map((price: number, widthIndex: number) => (
                        <td key={widthIndex} className="border border-border p-2 text-center">
                          {price ? formatPrice(price) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Unable to display grid - invalid format
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
