import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePublicStoreProducts } from "@/hooks/usePublicStore";
import { ArrowRight, Award, Crown, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ClassicEleganceHomeProps {
  storeData: any;
}

export const ClassicEleganceHome = ({ storeData }: ClassicEleganceHomeProps) => {
  const { data: products, isLoading } = usePublicStoreProducts(storeData.id);
  const featuredProducts = products?.filter((p: any) => p.is_featured).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero - Elegant and Traditional */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-muted/50 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="container max-w-7xl relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="flex justify-center">
              <Crown className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Timeless Elegance
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Luxury furniture and decor for discerning homeowners who appreciate craftsmanship and heritage
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Button 
                asChild 
                size="lg" 
                className="text-base h-14 px-10 rounded-full"
                style={{ backgroundColor: 'var(--store-primary)' }}
              >
                <Link to={`/store/${storeData.store_slug}/products`}>
                  Explore Collection
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-10 rounded-full text-base">
                <Link to={`/store/${storeData.store_slug}/book`}>
                  Schedule Consultation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Values - Elegant Cards */}
      <section className="py-20 bg-background">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Our Values
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl border-2 border-muted hover:border-primary/50 transition-colors">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Heritage Craftsmanship
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Traditional techniques meet modern quality standards
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl border-2 border-muted hover:border-primary/50 transition-colors">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Exclusive Designs
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Unique pieces you won't find anywhere else
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl border-2 border-muted hover:border-primary/50 transition-colors">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                White Glove Service
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Premium delivery and installation included
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Elegant Presentation */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Featured Collection
              </h2>
              <p className="text-xl text-muted-foreground">
                Curated pieces of distinction
              </p>
              <div className="w-32 h-1 bg-primary mx-auto mt-6" />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[550px] w-full" />
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
                    <div className="bg-background rounded-xl overflow-hidden border-2 border-muted hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                      <div className="aspect-[4/5] bg-muted overflow-hidden">
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
                      <div className="p-8 text-center">
                        <h3 className="text-2xl font-serif font-bold mb-3 group-hover:text-primary transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {product.inventory_item?.name || 'Product'}
                        </h3>
                        <p className="text-muted-foreground mb-6 line-clamp-2">
                          {product.custom_description || 'Exquisite craftsmanship'}
                        </p>
                        <Button variant="outline" className="w-full rounded-full">
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

      {/* CTA - Elegant */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container max-w-4xl text-center">
          <div className="inline-block mb-6">
            <Crown className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Experience Luxury Living
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Schedule a private consultation with our design specialists
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="h-14 px-10 rounded-full text-base" style={{ backgroundColor: 'var(--store-primary)' }}>
              <Link to={`/store/${storeData.store_slug}/book`}>
                Book Consultation
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-10 rounded-full text-base">
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
