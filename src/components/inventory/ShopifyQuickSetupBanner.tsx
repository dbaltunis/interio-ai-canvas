import { EcommerceSolutionsCard } from "@/components/library/EcommerceSolutionsCard";

interface ShopifyQuickSetupBannerProps {
  onOpenIntegration: () => void;
  hasIntegration: boolean;
}

export const ShopifyQuickSetupBanner = ({ 
  onOpenIntegration, 
  hasIntegration 
}: ShopifyQuickSetupBannerProps) => {
  return (
    <EcommerceSolutionsCard
      onOpenShopifyIntegration={onOpenIntegration}
      hasShopifyIntegration={hasIntegration}
    />
  );
};
