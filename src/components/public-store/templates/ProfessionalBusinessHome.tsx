import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePublicStoreProducts } from "@/hooks/usePublicStore";
import { ArrowRight, Building, TrendingUp, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfessionalBusinessHomeProps {
  storeData: any;
}

export const ProfessionalBusinessHome = ({ storeData }: ProfessionalBusinessHomeProps) => {
  const { data: products, isLoading } = usePublicStoreProducts(storeData.id);
  const featuredProducts = products?.filter((p: any) => p.is_featured).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero - Corporate and Professional */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-muted/80 to-background">
        <div className="container max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 text-primary text-sm font-semibold">
                <Building className="h-4 w-4" />
                TRUSTED BY BUSINESSES WORLDWIDE
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Professional Solutions for Modern Workspaces
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Office furniture and commercial interiors designed to enhance productivity and reflect your brand excellence
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="h-12 px-8"
                  style={{ backgroundColor: 'var(--store-primary)' }}
                >
                  <Link to={`/store/${storeData.store_slug}/products`}>
                    View Catalog
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-8">
                  <Link to={`/store/${storeData.store_slug}/book`}>
                    Request Consultation
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="bg-primary/10 rounded-2xl p-8 aspect-square flex flex-col justify-between">
                  <Building className="h-12 w-12 text-primary" />
                  <div>
                    <div className="text-4xl font-bold mb-2">500+</div>
                    <div className="text-sm text-muted-foreground">Corporate Clients</div>
                  </div>
                </div>
                <div className="bg-primary/10 rounded-2xl p-8 aspect-square flex flex-col justify-between mt-8">
                  <Users className="h-12 w-12 text-primary" />
                  <div>
                    <div className="text-4xl font-bold mb-2">98%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Professional Grid */}
      <section className="py-20 bg-background">
        <div className="container max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Business Benefits</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Solutions designed for enterprise success
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-muted/50 border border-border hover:border-primary/50 transition-colors">
              <div className="w-14 h-14 mb-6 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Volume Discounts</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Special pricing for bulk orders and corporate accounts
              </p>
            </div>
            <div className="p-8 rounded-xl bg-muted/50 border border-border hover:border-primary/50 transition-colors">
              <div className="w-14 h-14 mb-6 rounded-lg bg-primary flex items-center justify-center">
                <Building className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">B2B Portal</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Streamlined ordering and invoicing for businesses
              </p>
            </div>
            <div className="p-8 rounded-xl bg-muted/50 border border-border hover:border-primary/50 transition-colors">
              <div className="w-14 h-14 mb-6 rounded-lg bg-primary flex items-center justify-center">
                <Users className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Project Management</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Dedicated support for large installations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Professional Showcase */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container max-w-7xl">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
              <p className="text-xl text-muted-foreground">
                Professional-grade solutions for modern offices
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[500px] w-full" />
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
                    <div className="bg-background rounded-xl overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all duration-300">
                      <div className="aspect-[4/3] bg-muted overflow-hidden">
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
                          {product.custom_description || 'Professional-grade quality'}
                        </p>
                        <Button variant="outline" className="w-full">
                          Request Quote <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA - Professional */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container max-w-5xl">
          <div className="bg-background border border-border rounded-2xl p-12 md:p-16 text-center shadow-xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Partner With Us for Your Next Project
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Get dedicated account management and volume pricing for your business
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="h-12 px-10" style={{ backgroundColor: 'var(--store-primary)' }}>
                <Link to={`/store/${storeData.store_slug}/book`}>
                  Schedule Meeting
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-10">
                <Link to={`/store/${storeData.store_slug}/contact`}>
                  Get in Touch
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
