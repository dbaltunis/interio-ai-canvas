import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePublicStoreProducts } from "@/hooks/usePublicStore";
import { ArrowRight, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StoreHomePageProps {
  storeData: any;
}

export const StoreHomePage = ({ storeData }: StoreHomePageProps) => {
  const { data: products, isLoading } = usePublicStoreProducts(storeData.id);
  const featuredProducts = products?.filter((p: any) => p.is_featured).slice(0, 3) || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-muted to-background py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Premium Bespoke Window Treatments
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Custom curtains, blinds, and shutters tailored to your exact specifications.
              Get instant quotes with our interactive calculator.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" style={{ backgroundColor: 'var(--store-primary)' }}>
                <Link to={`/store/${storeData.store_slug}/products`}>
                  Browse Products <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={`/book/${storeData.store_slug}`}>
                  Book Consultation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Quotes</h3>
              <p className="text-muted-foreground">
                Get accurate pricing instantly with our built-in calculator for all bespoke products.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Custom Made</h3>
              <p className="text-muted-foreground">
                Every product is made to your exact measurements and specifications.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Service</h3>
              <p className="text-muted-foreground">
                Professional consultation, measurement, and installation services available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
              <p className="text-muted-foreground">
                Explore our most popular window treatment solutions
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-96 w-full" />
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
                    <div className="bg-background rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        {product.inventory_item?.image_url ? (
                          <img
                            src={product.inventory_item.image_url}
                            alt={product.inventory_item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl">🪟</span>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">Featured</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {product.template?.name 
                            ? `${product.template.name} - ${product.inventory_item?.name}`
                            : product.inventory_item?.name || 'Product'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {product.custom_description || 
                           (typeof product.inventory_item?.description === 'string' 
                             ? product.inventory_item.description 
                             : 'Custom made to your specifications')}
                        </p>
                        <Button variant="outline" className="w-full">
                          Configure & Get Quote <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link to={`/store/${storeData.store_slug}/products`}>
                  View All Products
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Space?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Book a free consultation with our design experts or browse our products to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" style={{ backgroundColor: 'var(--store-primary)' }}>
                <Link to={`/book/${storeData.store_slug}`}>
                  Book Free Consultation
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={`/store/${storeData.store_slug}/contact`}>
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
