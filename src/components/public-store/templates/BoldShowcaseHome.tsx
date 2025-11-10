import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePublicStoreProducts } from "@/hooks/usePublicStore";
import { ArrowRight, Palette, Sparkles, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BoldShowcaseHomeProps {
  storeData: any;
}

export const BoldShowcaseHome = ({ storeData }: BoldShowcaseHomeProps) => {
  const { data: products, isLoading } = usePublicStoreProducts(storeData.id);
  const featuredProducts = products?.filter((p: any) => p.is_featured).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero - Bold and Energetic */}
      <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-br from-primary/20 via-accent/10 to-background">
        <div className="absolute inset-0 bg-grid-white/10" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        <div className="container max-w-7xl relative">
          <div className="max-w-4xl space-y-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              <Sparkles className="h-4 w-4" />
              STAND OUT FROM THE CROWD
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]">
              Make a<br />
              <span className="text-primary">Statement</span>
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-muted-foreground">
              Bold designs that transform your space
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                asChild 
                size="lg" 
                className="text-lg h-16 px-10 font-bold shadow-xl hover:shadow-2xl transition-shadow"
                style={{ backgroundColor: 'var(--store-primary)' }}
              >
                <Link to={`/store/${storeData.store_slug}/products`}>
                  See Products <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-16 px-10 text-lg font-bold border-2">
                <Link to={`/store/${storeData.store_slug}/book`}>
                  Book Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Bold Cards */}
      <section className="py-20 bg-background">
        <div className="container max-w-7xl">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            What Sets Us <span className="text-primary">Apart</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl transform group-hover:scale-105 transition-transform" />
              <div className="relative p-8 bg-background/50 backdrop-blur rounded-3xl border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 mb-6 rounded-2xl bg-primary flex items-center justify-center">
                  <Palette className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-black mb-4">Unique Styles</h3>
                <p className="text-muted-foreground text-lg">
                  Stand out with furniture that makes an impression
                </p>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl transform group-hover:scale-105 transition-transform" />
              <div className="relative p-8 bg-background/50 backdrop-blur rounded-3xl border-2 border-accent/20 group-hover:border-accent/50 transition-colors">
                <div className="w-16 h-16 mb-6 rounded-2xl bg-accent flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-black mb-4">Custom Options</h3>
                <p className="text-muted-foreground text-lg">
                  Personalize colors and finishes to match your vision
                </p>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl transform group-hover:scale-105 transition-transform" />
              <div className="relative p-8 bg-background/50 backdrop-blur rounded-3xl border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 mb-6 rounded-2xl bg-primary flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-black mb-4">Expert Design Help</h3>
                <p className="text-muted-foreground text-lg">
                  Free consultation with our interior design team
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Bold Grid */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
          <div className="container max-w-7xl">
            <div className="mb-16">
              <h2 className="text-4xl md:text-6xl font-black mb-4">
                Featured <span className="text-primary">Products</span>
              </h2>
              <p className="text-2xl font-bold text-muted-foreground">
                Make your space unforgettable
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[550px] w-full rounded-3xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProducts.map((product: any, index: number) => (
                  <Link
                    key={product.id}
                    to={`/store/${storeData.store_slug}/products/${product.inventory_item_id}`}
                    className="group"
                  >
                    <div className="relative rounded-3xl overflow-hidden border-4 border-transparent hover:border-primary transition-all duration-300 shadow-xl hover:shadow-2xl">
                      <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                        {product.inventory_item?.image_url ? (
                          <img
                            src={product.inventory_item.image_url}
                            alt={product.inventory_item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-9xl">
                            🪟
                          </div>
                        )}
                      </div>
                      <div className="absolute top-6 left-6">
                        <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-black text-sm">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="p-8 bg-background">
                        <h3 className="text-2xl font-black mb-3 group-hover:text-primary transition-colors">
                          {product.inventory_item?.name || 'Product'}
                        </h3>
                        <p className="text-muted-foreground mb-6 line-clamp-2 font-medium">
                          {product.custom_description || 'Bold design, bolder impact'}
                        </p>
                        <Button className="w-full font-bold" style={{ backgroundColor: 'var(--store-primary)' }}>
                          Get Started <ArrowRight className="ml-2 h-5 w-5" />
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

      {/* CTA - Bold and Eye-Catching */}
      <section className="py-32 bg-gradient-to-br from-primary via-accent to-primary overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-white/10" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)',
          backgroundSize: '60px 60px'
        }} />
        <div className="container max-w-5xl text-center relative">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 text-primary-foreground">
            Ready to Transform<br />Your Space?
          </h2>
          <p className="text-2xl md:text-3xl font-bold text-primary-foreground/90 mb-12">
            Let's create something amazing together
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Button asChild size="lg" variant="secondary" className="h-16 px-12 text-lg font-bold shadow-2xl hover:scale-105 transition-transform">
              <Link to={`/store/${storeData.store_slug}/book`}>
                Book Free Consultation
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-16 px-12 text-lg font-bold border-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/20">
              <Link to={`/store/${storeData.store_slug}/contact`}>
                Contact Us Now
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
