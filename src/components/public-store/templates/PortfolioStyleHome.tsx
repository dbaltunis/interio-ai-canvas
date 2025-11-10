import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePublicStoreProducts } from "@/hooks/usePublicStore";
import { ArrowRight, Camera, Heart, Layout, Calculator, Palette } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryShowcase } from "../shared/CategoryShowcase";
import { HowItWorks } from "../shared/HowItWorks";
import { TrustIndicators } from "../shared/TrustIndicators";
import { TestimonialsCarousel } from "../shared/TestimonialsCarousel";
import { RoomGallery } from "../shared/RoomGallery";
import { QuickQuoteButton } from "../shared/QuickQuoteButton";

interface PortfolioStyleHomeProps {
  storeData: any;
}

export const PortfolioStyleHome = ({ storeData }: PortfolioStyleHomeProps) => {
  const { data: products, isLoading } = usePublicStoreProducts(storeData.id);
  const featuredProducts = products?.filter((p: any) => p.is_featured).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero - Creative and Visual */}
      <section className="relative py-28 md:py-36 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary text-primary font-semibold text-sm">
                <Camera className="h-4 w-4" />
                CURATED PORTFOLIO
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1]">
                Your Style,<br />
                Your Story
              </h1>
              <p className="text-2xl text-muted-foreground leading-relaxed">
                Curated pieces that reflect your unique aesthetic
              </p>
              <Button 
                asChild 
                size="lg" 
                className="h-14 px-10 text-base"
                style={{ backgroundColor: 'var(--store-primary)' }}
              >
                <Link to={`/store/${storeData.store_slug}/products`}>
                  Browse Portfolio <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl bg-primary/10 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-6xl">🎨</div>
                  </div>
                  <div className="aspect-[4/3] rounded-2xl bg-primary/5 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-5xl">✨</div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="aspect-[4/3] rounded-2xl bg-primary/5 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-5xl">🖼️</div>
                  </div>
                  <div className="aspect-square rounded-2xl bg-primary/10 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-6xl">💫</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Approach - Creative Cards */}
      <section className="py-24 bg-background">
        <div className="container max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Approach</h2>
            <p className="text-xl text-muted-foreground">
              Every piece tells a story
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl transform group-hover:scale-105 transition-transform" />
              <div className="relative p-10 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Layout className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Curated Selection</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Hand-picked items that tell a story
                </p>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-3xl transform group-hover:scale-105 transition-transform" />
              <div className="relative p-10 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Style Guides</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Expert advice on creating cohesive looks
                </p>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl transform group-hover:scale-105 transition-transform" />
              <div className="relative p-10 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Inspiration Gallery</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Real homes featuring our products
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Portfolio Grid */}
      {featuredProducts.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="container max-w-6xl">
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Work</h2>
              <p className="text-xl text-muted-foreground">
                Pieces that inspire
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[550px] w-full rounded-3xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product: any, index: number) => (
                  <Link
                    key={product.id}
                    to={`/store/${storeData.store_slug}/products/${product.inventory_item_id}`}
                    className="group"
                    style={{
                      gridRow: index === 0 ? 'span 2' : 'span 1'
                    }}
                  >
                    <div className="relative rounded-3xl overflow-hidden h-full bg-muted hover:shadow-2xl transition-shadow duration-300">
                      <div className={`${index === 0 ? 'aspect-[3/4]' : 'aspect-square'} bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden`}>
                        {product.inventory_item?.image_url ? (
                          <img
                            src={product.inventory_item.image_url}
                            alt={product.inventory_item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-8xl">
                            🪟
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                        <h3 className="text-2xl font-bold mb-2 text-foreground">
                          {product.inventory_item?.name || 'Product'}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {product.custom_description || 'Discover this piece'}
                        </p>
                        <Button variant="secondary" className="w-full">
                          View Details <ArrowRight className="ml-2 h-4 w-4" />
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

      {/* CTA - Creative */}
      <section className="py-32 bg-gradient-to-b from-background to-muted/50">
        <div className="container max-w-4xl text-center">
          <div className="space-y-8">
            <div className="inline-block p-4 rounded-full bg-primary/10">
              <Heart className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold">
              Let's Create Something<br />Beautiful Together
            </h2>
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
              Explore our portfolio and find pieces that speak to your style
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-8">
              <Button asChild size="lg" className="h-14 px-10 text-base" style={{ backgroundColor: 'var(--store-primary)' }}>
                <Link to={`/store/${storeData.store_slug}/products`}>
                  Explore Portfolio
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-10 text-base">
                <Link to={`/store/${storeData.store_slug}/book`}>
                  Book Consultation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Room Gallery */}
      <RoomGallery storeSlug={storeData.store_slug} />

      {/* Testimonials */}
      <TestimonialsCarousel />

      {/* Quick Quote Button */}
      <QuickQuoteButton storeSlug={storeData.store_slug} />
    </div>
  );
};
