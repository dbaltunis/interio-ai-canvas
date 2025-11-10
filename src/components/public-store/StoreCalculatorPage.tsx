import { VisualTreatmentCalculator } from "./calculator/VisualTreatmentCalculator";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { toast as sonnerToast } from "sonner";

interface StoreCalculatorPageProps {
  storeData: any;
}

export const StoreCalculatorPage = ({ storeData }: StoreCalculatorPageProps) => {
  const { addItem, openCart } = useShoppingCart();

  const createInquiry = useMutation({
    mutationFn: async (inquiryData: any) => {
      const { data, error } = await supabase
        .from('store_inquiries')
        .insert({
          store_id: storeData.id,
          inquiry_type: 'quote_request',
          ...inquiryData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Quote Request Sent!",
        description: "We'll get back to you within 24 hours with a detailed quote.",
      });
    },
  });

  const handleAddToCart = (configuration: Record<string, any>, estimatedPrice: number) => {
    const cartItem = {
      id: `calculator-${Date.now()}`,
      productId: configuration.template_id || 'custom',
      name: configuration.template_name || 'Custom Treatment',
      category: configuration.category || 'Window Treatment',
      quantity: 1,
      configuration,
      estimatedPrice,
      storeId: storeData.id,
    };
    
    addItem(cartItem);
    sonnerToast.success("Added to cart!", {
      action: {
        label: "View Cart",
        onClick: () => openCart(),
      },
    });
  };

  return (
    <div className="py-12">
      <div className="container max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Treatment Calculator</h1>
          <p className="text-lg text-muted-foreground">
            Design and price your custom window treatments in real-time
          </p>
        </div>

        <VisualTreatmentCalculator
          storeData={storeData}
          onSubmitQuote={(quoteData) => {
            createInquiry.mutate(quoteData);
          }}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  );
};
