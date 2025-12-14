/**
 * Category to Product Type Mapping Guide
 * 
 * Visual guide showing how inventory categories/subcategories map to pricing grid product types.
 * Helps users understand which grids they need to upload for their materials.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Info, ArrowRight, Package, Grid3X3 } from 'lucide-react';

// Mapping data showing inventory structure → grid product type
const CATEGORY_MAPPINGS = [
  {
    category: 'Material',
    categoryDescription: 'Hard coverings and manufactured products',
    subcategories: [
      { 
        name: 'Roller Blind Fabric', 
        subcategoryKey: 'roller_fabric',
        productType: 'roller_blinds', 
        productTypeLabel: 'Roller Blinds',
        description: 'Roller blind materials use width × drop grids'
      },
      { 
        name: 'Venetian Slats', 
        subcategoryKey: 'venetian_slats',
        productType: 'venetian_blinds', 
        productTypeLabel: 'Venetian Blinds',
        description: 'Wood or aluminum slats for venetian blinds'
      },
      { 
        name: 'Vertical Slats/Fabric', 
        subcategoryKey: 'vertical_fabric',
        productType: 'vertical_blinds', 
        productTypeLabel: 'Vertical Blinds',
        description: 'Vertical blind fabric or PVC vanes'
      },
      { 
        name: 'Cellular/Honeycomb', 
        subcategoryKey: 'cellular',
        productType: 'cellular_blinds', 
        productTypeLabel: 'Cellular/Honeycomb',
        description: 'Honeycomb/cellular blind materials'
      },
      { 
        name: 'Shutter Panels', 
        subcategoryKey: 'shutter_material',
        productType: 'shutters', 
        productTypeLabel: 'Shutters',
        description: 'Plantation shutter panel materials'
      },
      { 
        name: 'Panel Glide Fabric', 
        subcategoryKey: 'panel_glide_fabric',
        productType: 'panel_glide', 
        productTypeLabel: 'Panel Glide',
        description: 'Panel glide/track materials'
      },
    ]
  },
  {
    category: 'Fabric',
    categoryDescription: 'Soft furnishings and sewn products',
    subcategories: [
      { 
        name: 'Curtain Fabric', 
        subcategoryKey: 'curtain_fabric',
        productType: 'curtains', 
        productTypeLabel: 'Curtains',
        description: 'Uses per-meter pricing, not grids'
      },
      { 
        name: 'Roman Blind Fabric', 
        subcategoryKey: 'roman_fabric',
        productType: 'roman_blinds', 
        productTypeLabel: 'Roman Blinds',
        description: 'Can use per-meter or grid pricing'
      },
      { 
        name: 'Awning Fabric', 
        subcategoryKey: 'awning_fabric',
        productType: 'awning', 
        productTypeLabel: 'Awnings',
        description: 'Outdoor fabric for awnings'
      },
    ]
  }
];

interface CategoryProductTypeGuideProps {
  onSelectProductType?: (productType: string) => void;
}

export const CategoryProductTypeGuide = ({ onSelectProductType }: CategoryProductTypeGuideProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-dashed border-primary/30">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">
                  How Inventory Links to Pricing Grids
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            <p className="text-sm text-muted-foreground">
              When you upload a pricing grid, select the <strong>Product Type</strong> it applies to. 
              The system automatically matches grids to inventory items based on their subcategory.
            </p>
            
            {CATEGORY_MAPPINGS.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm">{cat.category}</h4>
                  <span className="text-xs text-muted-foreground">— {cat.categoryDescription}</span>
                </div>
                
                <div className="ml-6 space-y-1.5">
                  {cat.subcategories.map((sub) => (
                    <div 
                      key={sub.subcategoryKey}
                      className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-muted/50 transition-colors group"
                    >
                      <Badge variant="outline" className="font-normal text-xs">
                        {sub.name}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Badge 
                        variant="secondary" 
                        className="font-normal text-xs cursor-pointer hover:bg-primary/20"
                        onClick={() => onSelectProductType?.(sub.productType)}
                      >
                        <Grid3X3 className="h-3 w-3 mr-1" />
                        {sub.productTypeLabel}
                      </Badge>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        — {sub.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-muted/50 p-3 rounded-md text-xs space-y-1">
              <p className="font-medium">How it works:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>You import materials with a <code className="bg-background px-1 rounded">price_group</code> column (e.g., "1", "A")</li>
                <li>You upload a pricing grid with matching <strong>Product Type</strong> and <strong>Price Group</strong></li>
                <li>System automatically uses that grid when quoting items with matching subcategory + price group</li>
              </ol>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
