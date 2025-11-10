import { StoreWallpaperCalculator } from "./calculators/StoreWallpaperCalculator";
import { StoreTreatmentCalculator } from "./calculators/StoreTreatmentCalculator";
import { SimpleFabricCalculator } from "./calculators/SimpleFabricCalculator";
import { RequestQuoteOnly } from "./calculators/RequestQuoteOnly";
import { TREATMENT_CATEGORIES } from "@/types/treatmentCategories";

interface StoreProductCalculatorProps {
  product: any;
  storeData: any;
  onSubmitQuote: (quoteData: any) => void;
  onAddToCart?: (configuration: Record<string, any>, estimatedPrice: number) => void;
}

export const StoreProductCalculator = ({ product, storeData, onSubmitQuote, onAddToCart }: StoreProductCalculatorProps) => {
  const category = product.inventory_item?.category?.toLowerCase() || '';
  
  console.log('🔍 Routing product:', {
    name: product.inventory_item?.name,
    category,
    hasTemplate: !!product.template?.id
  });
  
  // WALLPAPER PRODUCTS
  if (category === TREATMENT_CATEGORIES.WALLPAPER.db_value || category === 'wallpaper') {
    console.log('✅ Using wallpaper calculator');
    return (
      <StoreWallpaperCalculator
        product={product}
        storeData={storeData}
        onSubmitQuote={onSubmitQuote}
        onAddToCart={onAddToCart}
      />
    );
  }
  
  // WINDOW TREATMENT PRODUCTS (fabric, roller_fabric, heading, lining)
  const WINDOW_TREATMENT_CATEGORIES = ['fabric', 'roller_fabric', 'heading', 'lining'];
  
  if (WINDOW_TREATMENT_CATEGORIES.includes(category)) {
    // Check if product has an assigned template
    if (product.template && product.template.id) {
      console.log('✅ Using advanced calculator (has template)');
      return (
        <StoreTreatmentCalculator
          product={product}
          storeData={storeData}
          onSubmitQuote={onSubmitQuote}
          onAddToCart={onAddToCart}
        />
      );
    } else {
      console.log('⚡ Using simple calculator (no template)');
      return (
        <SimpleFabricCalculator
          product={product}
          storeData={storeData}
          onSubmitQuote={onSubmitQuote}
          onAddToCart={onAddToCart}
        />
      );
    }
  }
  
  // UNKNOWN/COMPLEX PRODUCTS - Request quote only
  console.log('❓ Using quote-only (unknown category)');
  return (
    <RequestQuoteOnly
      product={product}
      storeData={storeData}
      onSubmitQuote={onSubmitQuote}
    />
  );
};
