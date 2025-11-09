import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package, ShoppingCart } from "lucide-react";
import { StoreProductCalculator } from "./calculator/StoreProductCalculator";
import { toast } from "@/hooks/use-toast";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { toast as sonnerToast } from "sonner";

interface StoreProductDetailPageProps {
  storeData: any;
}

export const StoreProductDetailPage = ({ storeData }: StoreProductDetailPageProps) => {
  const { productId } = useParams<{ productId: string }>();
  const { addItem, openCart } = useShoppingCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ['public-product', productId, storeData.id],
    queryFn: async () => {
  const { data, error } = await supabase
        .from('store_product_visibility')
        .select(`
          *,
          inventory_item:enhanced_inventory_items(*),
          template:curtain_templates(*)
        `)
        .eq('store_id', storeData.id)
        .eq('inventory_item_id', productId)
        .eq('is_visible', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!productId && !!storeData.id,
  });

  const createInquiry = useMutation({
    mutationFn: async (inquiryData: any) => {
      const { data, error } = await supabase
        .from('store_inquiries')
        .insert({
          store_id: storeData.id,
          product_id: productId,
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

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or is not available.
          </p>
          <Button asChild variant="outline">
            <Link to={`/store/${storeData.store_slug}/products`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link to={`/store/${storeData.store_slug}/products`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {product.inventory_item?.image_url ? (
                <img
                  src={product.inventory_item.image_url}
                  alt={product.inventory_item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-32 w-32 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Product Info & Calculator */}
          <div>
            <div className="mb-8">
              <span className="text-sm text-muted-foreground">
                {product.inventory_item?.category || 'Window Treatment'}
              </span>
              <h1 className="text-4xl font-bold mt-2 mb-4">
                {product.template?.name 
                  ? `${product.template.name} - ${product.inventory_item?.name}`
                  : product.inventory_item?.name || 'Product'}
              </h1>
              <p className="text-lg text-muted-foreground">
                {product.custom_description || 
                 (typeof product.inventory_item?.description === 'string'
                   ? product.inventory_item.description
                   : 'Premium bespoke window treatment, custom-made to your exact specifications.')}
              </p>
            </div>

            {/* Interactive Calculator */}
            <StoreProductCalculator
              product={product}
              storeData={storeData}
              onSubmitQuote={(quoteData) => {
                createInquiry.mutate(quoteData);
              }}
              onAddToCart={(configuration, estimatedPrice) => {
                const cartItem = {
                  id: `${productId}-${Date.now()}`,
                  productId: productId!,
                  name: product.inventory_item?.name || 'Product',
                  imageUrl: product.inventory_item?.image_url,
                  category: product.inventory_item?.category || 'Window Treatment',
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
              }}
            />
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-2">Custom Made</h3>
            <p className="text-sm text-muted-foreground">
              Each piece is crafted to your exact measurements and specifications.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Expert Installation</h3>
            <p className="text-sm text-muted-foreground">
              Professional installation services available for all products.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Quality Guarantee</h3>
            <p className="text-sm text-muted-foreground">
              We stand behind our work with comprehensive warranties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
