import { useParams, Routes, Route, Navigate } from "react-router-dom";
import { usePublicStore } from "@/hooks/usePublicStore";
import { StoreLayout } from "./StoreLayout";
import { StoreHomePage } from "./StoreHomePage";
import { StoreProductsPage } from "./StoreProductsPage";
import { StoreProductDetailPage } from "./StoreProductDetailPage";
import { StoreAboutPage } from "./StoreAboutPage";
import { StoreContactPage } from "./StoreContactPage";
import { StoreCheckout } from "./StoreCheckout";
import { StoreOrderConfirmation } from "./StoreOrderConfirmation";
import { Skeleton } from "@/components/ui/skeleton";

export const PublicStorePage = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const { data: storeData, isLoading, error } = usePublicStore(storeSlug || '');

  console.log('[PublicStorePage] Rendering:', { storeSlug, isLoading, error: error?.message, hasData: !!storeData });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Store Not Found</h1>
          <p className="text-muted-foreground">The store you're looking for doesn't exist or is not published.</p>
        </div>
      </div>
    );
  }

  return (
    <StoreLayout storeData={storeData}>
      <Routes>
        <Route index element={<StoreHomePage storeData={storeData} />} />
        <Route path="products" element={<StoreProductsPage storeData={storeData} />} />
        <Route path="products/:productId" element={<StoreProductDetailPage storeData={storeData} />} />
        <Route path="checkout" element={<StoreCheckout storeData={storeData} />} />
        <Route path="order-confirmation" element={<StoreOrderConfirmation storeData={storeData} />} />
        <Route path="about" element={<StoreAboutPage storeData={storeData} />} />
        <Route path="contact" element={<StoreContactPage storeData={storeData} />} />
        <Route path="*" element={<Navigate to={`/store/${storeSlug}`} replace />} />
      </Routes>
    </StoreLayout>
  );
};
