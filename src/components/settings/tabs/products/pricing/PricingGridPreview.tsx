import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";

interface PricingGridData {
  widthRanges: string[];
  dropRanges: string[];
  prices: number[][];
  unit?: 'cm' | 'mm';
}

interface PricingGridPreviewProps {
  gridData: PricingGridData;
  gridName?: string;
}

export const PricingGridPreview = ({ gridData, gridName }: PricingGridPreviewProps) => {
  if (!gridData?.widthRanges || !gridData?.dropRanges || !gridData?.prices) {
    return null;
  }

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
            <p><strong>Dimensions:</strong> {gridData.dropRanges.length} drop ranges × {gridData.widthRanges.length} width ranges</p>
            <p><strong>Unit:</strong> {gridData.unit || 'cm'}</p>
          </div>
          
          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-10 min-w-[100px]">
                    Drop / Width ({gridData.unit || 'cm'})
                  </TableHead>
                  {gridData.widthRanges.map((width, index) => (
                    <TableHead key={index} className="text-center min-w-[80px]">
                      {width}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {gridData.dropRanges.map((drop, dropIndex) => (
                  <TableRow key={dropIndex}>
                    <TableCell className="sticky left-0 bg-background font-medium">
                      {drop}
                    </TableCell>
                    {gridData.prices[dropIndex]?.map((price, priceIndex) => (
                      <TableCell key={priceIndex} className="text-center">
                        ${price.toFixed(2)}
                      </TableCell>
                    ))}
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
