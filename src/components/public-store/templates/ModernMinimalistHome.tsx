import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePublicStoreProducts } from "@/hooks/usePublicStore";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ModernMinimalistHomeProps {
  storeData: any;
}

export const ModernMinimalistHome = ({ storeData }: ModernMinimalistHomeProps) => {
  const { data: products, isLoading } = usePublicStoreProducts(storeData.id);
  const featuredProducts = products?.filter((p: any) => p.is_featured).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero - Minimalist with Large Typography */}
      <section className="relative overflow-hidden py-32 md:py-40">
        <div className="container max-w-6xl">
          <div className="max-w-4xl space-y-8">
            <div className="inline-block">
              <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Modern Design, Simplified
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
              Discover our curated collection
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
              Contemporary furniture and decor, meticulously selected for quality and timeless appeal.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                asChild 
                size="lg" 
                className="text-base h-14 px-8"
                style={{ backgroundColor: 'var(--store-primary)' }}
              >
                <Link to={`/store/${storeData.store_slug}/products`}>
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
                <Link to={`/store/${storeData.store_slug}/book`}>
                  Book Consultation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Clean Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Quality Craftsmanship</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Every piece is carefully selected for quality and durability
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                <Zap className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Fast Delivery</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Get your items delivered within 5-7 business days
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                <Shield className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Easy Returns</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                30-day hassle-free return policy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Minimalist Cards */}
      {featuredProducts.length > 0 && (
        <section className="py-24">
          <div className="container max-w-6xl">
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Collection</h2>
              <p className="text-xl text-muted-foreground">
                Handpicked for modern living
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[500px] w-full rounded-3xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProducts.map((product: any) => (
                  <Link
                    key={product.id}
                    to={`/store/${storeData.store_slug}/products/${product.inventory_item_id}`}
                    className="group"
                  >
                    <div className="rounded-3xl overflow-hidden bg-muted/50 hover:bg-muted transition-colors">
                      <div className="aspect-square bg-background/50 overflow-hidden">
                        {product.inventory_item?.image_url ? (
                          <img
                            src={product.inventory_item.image_url}
                            alt={product.inventory_item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-8xl">
                            🪟
                          </div>
                        )}
                      </div>
                      <div className="p-8">
                        <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                          {product.inventory_item?.name || 'Product'}
                        </h3>
                        <p className="text-muted-foreground mb-6 line-clamp-2">
                          {product.custom_description || 'Custom made to your specifications'}
                        </p>
                        <div className="flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                          Explore <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA - Bold and Simple */}
      <section className="py-32 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Transform your space today
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90">
            Book a consultation or start browsing our collection
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-base">
              <Link to={`/store/${storeData.store_slug}/book`}>
                Book Consultation
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              <Link to={`/store/${storeData.store_slug}/contact`}>
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
