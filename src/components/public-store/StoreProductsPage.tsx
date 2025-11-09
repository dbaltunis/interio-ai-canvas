import { Link } from "react-router-dom";
import { usePublicStoreProducts } from "@/hooks/usePublicStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Package } from "lucide-react";

interface StoreProductsPageProps {
  storeData: any;
}

export const StoreProductsPage = ({ storeData }: StoreProductsPageProps) => {
  const { data: products, isLoading } = usePublicStoreProducts(storeData.id);

  return (
    <div className="py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Products</h1>
          <p className="text-lg text-muted-foreground">
            Browse our collection of premium bespoke window treatments. Each product is custom-made to your exact specifications.
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Link
                key={product.id}
                to={`/store/${storeData.store_slug}/products/${product.inventory_item_id}`}
                className="group"
              >
                <div className="bg-background rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {product.inventory_item?.image_url ? (
                      <img
                        src={product.inventory_item.image_url}
                        alt={product.inventory_item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {product.inventory_item?.name || 'Product'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.custom_description || product.inventory_item?.description || 'Custom made to order'}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {product.inventory_item?.category || 'Window Treatment'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
            <p className="text-muted-foreground mb-6">
              Check back soon for our product offerings.
            </p>
            <Button asChild variant="outline">
              <Link to={`/store/${storeData.store_slug}/contact`}>
                Contact Us <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
