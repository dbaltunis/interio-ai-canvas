import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateWallpaperCost } from "@/utils/wallpaperCalculations";
import { Badge } from "@/components/ui/badge";

interface ProductCalculatorPreviewProps {
  item: any;
}

export const ProductCalculatorPreview = ({ item }: ProductCalculatorPreviewProps) => {
  const category = item.category?.toLowerCase();

  // Example dimensions for preview
  const exampleWallWidth = 400; // cm
  const exampleWallHeight = 240; // cm

  if (category === 'wallpaper') {
    const calculation = calculateWallpaperCost(exampleWallWidth, exampleWallHeight, item);

    if (!calculation) {
      return (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">No calculation available for this wallpaper.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Wallpaper Calculator Preview</CardTitle>
          <p className="text-xs text-muted-foreground">
            Example wall: {exampleWallWidth}cm × {exampleWallHeight}cm
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Roll Width</p>
              <p className="font-semibold">{item.wallpaper_roll_width || 53}cm</p>
            </div>
            <div>
              <p className="text-muted-foreground">Roll Length</p>
              <p className="font-semibold">{item.wallpaper_roll_length || 10}m</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pattern Repeat</p>
              <p className="font-semibold">{item.pattern_repeat_vertical || 0}cm</p>
            </div>
            <div>
              <p className="text-muted-foreground">Match Type</p>
              <p className="font-semibold capitalize">{item.wallpaper_match_type || 'straight'}</p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Strips Needed</span>
              <Badge variant="secondary">{calculation.stripsNeeded}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Rolls Needed</span>
              <Badge variant="secondary">{calculation.rollsNeeded}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Quantity</span>
              <Badge>{calculation.quantity.toFixed(2)} {calculation.unitLabel}</Badge>
            </div>
            <div className="flex justify-between items-center font-semibold text-base pt-2 border-t">
              <span>Example Cost</span>
              <span className="text-primary">£{calculation.totalCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-background p-3 rounded text-xs space-y-1">
            <p className="font-semibold">Calculation Details:</p>
            <p>• Strip length: {calculation.lengthPerStripM.toFixed(2)}m ({calculation.lengthPerStripCm}cm)</p>
            <p>• Strips per roll: {calculation.stripsPerRoll}</p>
            <p>• Leftover: {calculation.leftoverStrips} strips ({calculation.leftoverLengthM.toFixed(2)}m)</p>
            <p>• Sold by: {calculation.soldBy.replace('_', ' ')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For curtains, blinds, etc. - show template-based calculation preview
  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-sm">Product Calculator Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category</span>
            <span className="font-semibold capitalize">{category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Price</span>
            <span className="font-semibold">£{(item.selling_price || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pricing Method</span>
            <span className="font-semibold capitalize">{item.pricing_method || 'per_unit'}</span>
          </div>
          {item.unit && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unit</span>
              <span className="font-semibold">{item.unit}</span>
            </div>
          )}
        </div>
        <div className="mt-4 p-3 bg-background rounded text-xs text-muted-foreground">
          This product uses template-based calculations. The final price will be calculated based on window dimensions and selected options during quote creation.
        </div>
      </CardContent>
    </Card>
  );
};
