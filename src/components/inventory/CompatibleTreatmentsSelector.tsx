import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, Package, Info } from 'lucide-react';
import { 
  UNIFIED_CATEGORIES, 
  getTreatmentsByProductType,
  suggestCompatibleTreatments,
  ProductType 
} from '@/types/treatmentCategories';

interface CompatibleTreatmentsSelectorProps {
  selectedTreatments: string[];
  onChange: (treatments: string[]) => void;
  productType?: ProductType;
  subcategory?: string;
  category?: string; // Added for hardware detection
  showSuggestions?: boolean;
}

export const CompatibleTreatmentsSelector = ({
  selectedTreatments,
  onChange,
  productType,
  subcategory,
  category,
  showSuggestions = true
}: CompatibleTreatmentsSelectorProps) => {
  const [suggestedTreatments, setSuggestedTreatments] = useState<string[]>([]);

  // Check if this is a hardware item (treatment-agnostic)
  const isHardware = category === 'hardware' || 
    ['track', 'rod', 'motor', 'bracket', 'accessory', 'slat'].includes(subcategory || '');

  // Auto-suggest treatments based on product type or subcategory
  useEffect(() => {
    if (!showSuggestions || isHardware) return;
    
    let suggestions: string[] = [];
    
    // Suggest based on product type
    if (productType) {
      suggestions = suggestCompatibleTreatments(productType);
    }
    
    // Refine suggestions based on subcategory
    if (subcategory) {
      const subcategoryTreatments = Object.entries(UNIFIED_CATEGORIES)
        .filter(([_, config]) => config.inventory_subcategories.includes(subcategory))
        .map(([key]) => key);
      
      if (subcategoryTreatments.length > 0) {
        suggestions = subcategoryTreatments;
      }
    }
    
    setSuggestedTreatments(suggestions);
  }, [productType, subcategory, showSuggestions, isHardware]);

  const handleToggle = (treatmentKey: string) => {
    if (selectedTreatments.includes(treatmentKey)) {
      onChange(selectedTreatments.filter(t => t !== treatmentKey));
    } else {
      onChange([...selectedTreatments, treatmentKey]);
    }
  };

  const handleApplySuggestions = () => {
    onChange(suggestedTreatments);
  };

  // Group treatments by product type for better organization
  const fabricTreatments = getTreatmentsByProductType('fabric');
  const hardMaterialTreatments = getTreatmentsByProductType('hard_material');

  // Hardware items show informational message instead of treatment checkboxes
  if (isHardware) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Compatible Treatments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              Hardware items (tracks, motors, brackets, accessories) work with all treatment types automatically.
              No specific treatment selection is needed.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4" />
          Compatible Treatments
        </CardTitle>
        <CardDescription>
          Select which treatment types can use this product
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show suggestions if available */}
        {showSuggestions && suggestedTreatments.length > 0 && selectedTreatments.length === 0 && (
          <Alert className="border-primary/20 bg-primary/5">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                Suggested: {suggestedTreatments.map(t => UNIFIED_CATEGORIES[t]?.display_name).join(', ')}
              </span>
              <button
                type="button"
                onClick={handleApplySuggestions}
                className="text-xs text-primary hover:underline font-medium ml-2"
              >
                Apply suggestions
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Selected treatments summary */}
        {selectedTreatments.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedTreatments.map(treatment => (
              <Badge 
                key={treatment} 
                variant="default" 
                className="cursor-pointer"
                onClick={() => handleToggle(treatment)}
              >
                {UNIFIED_CATEGORIES[treatment]?.display_name || treatment}
                <span className="ml-1 opacity-60">×</span>
              </Badge>
            ))}
          </div>
        )}

        {/* Soft Furnishings (Fabrics) */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Soft Furnishings (Fabrics)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {fabricTreatments.map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${
                  selectedTreatments.includes(value)
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50 border-border'
                }`}
              >
                <Checkbox
                  checked={selectedTreatments.includes(value)}
                  onCheckedChange={() => handleToggle(value)}
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Hard Coverings (Materials) */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Hard Coverings (Materials)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {hardMaterialTreatments.map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${
                  selectedTreatments.includes(value)
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50 border-border'
                }`}
              >
                <Checkbox
                  checked={selectedTreatments.includes(value)}
                  onCheckedChange={() => handleToggle(value)}
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Help text */}
        <p className="text-xs text-muted-foreground">
          Products with compatible treatments will appear in the fabric/material selector when creating quotes for those treatment types.
        </p>
      </CardContent>
    </Card>
  );
};