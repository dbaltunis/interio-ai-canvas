import { StoreWallpaperCalculator } from "./calculators/StoreWallpaperCalculator";
import { StoreTreatmentCalculator } from "./calculators/StoreTreatmentCalculator";
import { TREATMENT_CATEGORIES } from "@/types/treatmentCategories";

interface StoreProductCalculatorProps {
  product: any;
  storeData: any;
  onSubmitQuote: (quoteData: any) => void;
  onAddToCart?: (configuration: Record<string, any>, estimatedPrice: number) => void;
}

export const StoreProductCalculator = ({ product, storeData, onSubmitQuote, onAddToCart }: StoreProductCalculatorProps) => {
  const category = product.inventory_item?.category?.toLowerCase() || '';
  
  // Route to appropriate calculator based on category
  if (category === TREATMENT_CATEGORIES.WALLPAPER.db_value) {
    return (
      <StoreWallpaperCalculator
        product={product}
        storeData={storeData}
        onSubmitQuote={onSubmitQuote}
        onAddToCart={onAddToCart}
      />
    );
  }
  
  // All other categories use treatment calculator (curtains, blinds, etc.)
  return (
    <StoreTreatmentCalculator
      product={product}
      storeData={storeData}
      onSubmitQuote={onSubmitQuote}
      onAddToCart={onAddToCart}
    />
  );
};
