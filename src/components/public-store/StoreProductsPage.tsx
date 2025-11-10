import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePublicStoreProducts } from "@/hooks/usePublicStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Package } from "lucide-react";
import { ProductFilters, FilterState } from "@/components/online-store/ProductFilters";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { toast } from "sonner";
import { EnhancedProductCard } from "./enhanced/EnhancedProductCard";

interface StoreProductsPageProps {
  storeData: any;
}

export const StoreProductsPage = ({ storeData }: StoreProductsPageProps) => {
  const { data: products, isLoading } = usePublicStoreProducts(storeData.id);
  const [filters, setFilters] = useState<FilterState | null>(null);
  const { addItem, openCart } = useShoppingCart();

  // Extract unique categories and colors from products
  const { categories, colors, priceRange } = useMemo(() => {
    if (!products) return { categories: [], colors: [], priceRange: [0, 1000] as [number, number] };

    const cats = new Set<string>();
    const cols = new Set<string>();
    
    products.forEach((p: any) => {
      if (p.inventory_item?.category) cats.add(p.inventory_item.category);
      if (p.inventory_item?.color) cols.add(p.inventory_item.color);
    });

    return {
      categories: Array.from(cats),
      colors: Array.from(cols),
      priceRange: [0, 1000] as [number, number],
    };
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products || !filters) return products || [];

    let filtered = products.filter((product: any) => {
      // Category filter
      if (filters.selectedCategories.length > 0) {
        if (!filters.selectedCategories.includes(product.inventory_item?.category)) {
          return false;
        }
      }

      // Color filter
      if (filters.selectedColors.length > 0) {
        if (!filters.selectedColors.includes(product.inventory_item?.color)) {
          return false;
        }
      }

      return true;
    });

    // Sort products
    switch (filters.sortBy) {
      case 'name':
        filtered.sort((a: any, b: any) => 
          (a.inventory_item?.name || '').localeCompare(b.inventory_item?.name || '')
        );
        break;
      case 'newest':
        filtered.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return filtered;
  }, [products, filters]);

  const displayProducts = filters ? filteredProducts : products;

  const handleQuickAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productName = product.template?.name 
      ? `${product.template.name} - ${product.inventory_item?.name}`
      : product.inventory_item?.name || 'Product';
    
    const cartItem = {
      id: `${product.inventory_item_id}-${Date.now()}`,
      productId: product.inventory_item_id,
      name: productName,
      imageUrl: product.inventory_item?.image_url,
      category: product.inventory_item?.category || 'Window Treatment',
      quantity: 1,
      configuration: { quick_add: true, template_id: product.template_id },
      estimatedPrice: product.inventory_item?.unit_price || 0,
      storeId: storeData.id,
    };
    
    addItem(cartItem);
    toast.success("Added to cart!", {
      action: {
        label: "View Cart",
        onClick: () => openCart(),
      },
    });
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {!isLoading && products && products.length > 0 && (
            <div className="lg:col-span-1">
              <ProductFilters
                categories={categories}
                colors={colors}
                priceRange={priceRange}
                onFilterChange={setFilters}
              />
            </div>
          )}

          {/* Products Grid */}
          <div className={!isLoading && products && products.length > 0 ? "lg:col-span-3" : "lg:col-span-4"}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-96" />
                ))}
              </div>
            ) : displayProducts && displayProducts.length > 0 ? (
              <>
                <div className="mb-6 text-sm text-muted-foreground">
                  Showing {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {displayProducts.map((product: any) => (
                    <EnhancedProductCard
                      key={product.id}
                      product={product}
                      storeSlug={storeData.store_slug}
                      onQuickAdd={handleQuickAddToCart}
                    />
                  ))}
                </div>
              </>
            ) : filters ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Products Match Your Filters</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters to see more products.
                </p>
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
      </div>
    </div>
  );
};
