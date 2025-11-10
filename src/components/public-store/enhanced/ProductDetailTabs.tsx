import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Info, ImageIcon, Ruler } from "lucide-react";
import { StoreProductCalculator } from "../calculator/StoreProductCalculator";

interface ProductDetailTabsProps {
  product: any;
  storeData: any;
  onSubmitQuote: (quoteData: any) => void;
  onAddToCart?: (configuration: Record<string, any>, estimatedPrice: number) => void;
}

export const ProductDetailTabs = ({ 
  product, 
  storeData, 
  onSubmitQuote, 
  onAddToCart 
}: ProductDetailTabsProps) => {
  return (
    <Tabs defaultValue="calculator" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="calculator" className="gap-2">
          <Calculator className="h-4 w-4" />
          <span className="hidden sm:inline">Calculator</span>
        </TabsTrigger>
        <TabsTrigger value="details" className="gap-2">
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">Details</span>
        </TabsTrigger>
        <TabsTrigger value="gallery" className="gap-2">
          <ImageIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Gallery</span>
        </TabsTrigger>
        <TabsTrigger value="guide" className="gap-2">
          <Ruler className="h-4 w-4" />
          <span className="hidden sm:inline">Guide</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="calculator" className="space-y-6">
        <StoreProductCalculator
          product={product}
          storeData={storeData}
          onSubmitQuote={onSubmitQuote}
          onAddToCart={onAddToCart}
        />
      </TabsContent>

      <TabsContent value="details">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Product Description</h3>
              <p className="text-sm text-muted-foreground">
                {product.custom_description || 
                  (typeof product.inventory_item?.description === 'string'
                    ? product.inventory_item.description
                    : 'Premium bespoke window treatment, custom-made to your exact specifications.')}
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-semibold mb-3">Product Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Custom-made to your exact measurements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Premium quality materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Professional installation available</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Comprehensive warranty included</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Free in-home consultation</span>
                </li>
              </ul>
            </div>

            {product.inventory_item?.category && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Specifications</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{product.inventory_item.category}</p>
                  </div>
                  {product.inventory_item.color && (
                    <div>
                      <p className="text-muted-foreground">Color</p>
                      <p className="font-medium">{product.inventory_item.color}</p>
                    </div>
                  )}
                  {product.inventory_item.selling_price && (
                    <div>
                      <p className="text-muted-foreground">Starting Price</p>
                      <p className="font-medium">${product.inventory_item.selling_price.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="gallery">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {product.inventory_item?.image_url ? (
                <>
                  <img
                    src={product.inventory_item.image_url}
                    alt={product.inventory_item.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">More images coming soon</p>
                  </div>
                </>
              ) : (
                <div className="col-span-2 aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No images available</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="guide">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Measurement Guide</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Step 1: Prepare</h4>
                <p className="text-sm text-muted-foreground">
                  Gather a metal tape measure, pen, and paper. Decide whether you want an inside or outside mount.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Step 2: Measure Width</h4>
                <p className="text-sm text-muted-foreground">
                  Measure the width at the top, middle, and bottom of your window. Use the narrowest measurement.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Step 3: Measure Height</h4>
                <p className="text-sm text-muted-foreground">
                  Measure the height on the left, center, and right side. Use the longest measurement.
                </p>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg mt-4">
                <h4 className="font-medium mb-2">💡 Pro Tip</h4>
                <p className="text-sm text-muted-foreground">
                  Not confident about measuring? Book a free in-home consultation and our experts will measure for you!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
