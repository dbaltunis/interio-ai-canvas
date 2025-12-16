import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getUnitLabel } from "@/utils/measurementFormatters";

interface PricingGridData {
  // Format B
  widthRanges?: string[];
  dropRanges?: string[];
  prices?: number[][] | Record<string, number>;
  // Format A & C
  widthColumns?: number[];
  dropRows?: number[] | Array<{ drop: number; prices: number[] }>;
  unit?: 'cm' | 'mm';
}

interface PricingGridPreviewProps {
  gridData: PricingGridData;
  gridName?: string;
}

export const PricingGridPreview = ({ gridData, gridName }: PricingGridPreviewProps) => {
  const { units } = useMeasurementUnits();
  
  // Detect grid format
  const isFormatB = gridData?.widthRanges && gridData?.dropRanges && Array.isArray(gridData?.prices);
  const isFormatC = gridData?.widthColumns && gridData?.dropRows && typeof gridData?.prices === 'object' && !Array.isArray(gridData?.prices);
  const isFormatA = gridData?.widthColumns && gridData?.dropRows && Array.isArray(gridData?.dropRows) && 
    gridData?.dropRows.length > 0 && typeof gridData.dropRows[0] === 'object' && 'prices' in (gridData.dropRows[0] as any);
  
  if (!gridData || (!isFormatA && !isFormatB && !isFormatC)) {
    return null;
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Get dimensions based on format
  const getWidths = () => {
    if (isFormatB) return gridData.widthRanges;
    return gridData.widthColumns;
  };
  
  const getDrops = () => {
    if (isFormatB) return gridData.dropRanges;
    if (isFormatA) return (gridData.dropRows as Array<{ drop: number; prices: number[] }>).map((r) => r.drop);
    return gridData.dropRows as number[]; // Format C - simple number array
  };

  const getPrice = (dropIndex: number, widthIndex: number) => {
    if (isFormatB) {
      return (gridData.prices as number[][])?.[dropIndex]?.[widthIndex];
    }
    if (isFormatA) {
      return (gridData.dropRows as Array<{ drop: number; prices: number[] }>)[dropIndex]?.prices?.[widthIndex];
    }
    // Format C - flat object lookup
    const width = gridData.widthColumns![widthIndex];
    const drop = (gridData.dropRows as number[])[dropIndex];
    const prices = gridData.prices as Record<string, number>;
    return prices[`${width}_${drop}`] ?? prices[`${width}-${drop}`];
  };

  const widths = getWidths();
  const drops = getDrops();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Preview Grid
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {gridName ? `Pricing Grid: ${gridName}` : 'Pricing Grid Preview'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Dimensions:</strong> {drops.length} drop ranges × {widths.length} width ranges</p>
            <p><strong>Dimensions stored in:</strong> {getUnitLabel(gridData.unit || 'cm')}</p>
          </div>
          
          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-10 min-w-[100px]">
                    Drop / Width ({getUnitLabel(gridData.unit || 'cm')})
                  </TableHead>
                  {widths.map((width: string | number, index: number) => (
                    <TableHead key={index} className="text-center min-w-[80px]">
                      {width}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {drops.map((drop: string | number, dropIndex: number) => (
                  <TableRow key={dropIndex}>
                    <TableCell className="sticky left-0 bg-background font-medium">
                      {drop}
                    </TableCell>
                    {widths.map((_: any, widthIndex: number) => {
                      const price = getPrice(dropIndex, widthIndex);
                      return (
                        <TableCell key={widthIndex} className="text-center">
                          {price != null ? formatPrice(price) : '-'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>How to read this grid:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Find your drop measurement in the left column</li>
              <li>Find your width measurement in the top row</li>
              <li>The intersection shows the price for that size</li>
              <li>Values shown are maximums - system finds closest match</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
