import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePublicStoreProducts } from "@/hooks/usePublicStore";
import { 
  ArrowRight, Calculator, Clock, Shield, Star, Users, 
  Phone, Calendar, Ruler, Sparkles, CheckCircle, Award
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EnhancedProductCard } from "../enhanced/EnhancedProductCard";
import { motion } from "framer-motion";

interface WindowTreatmentProProps {
  storeData: any;
}

export const WindowTreatmentPro = ({ storeData }: WindowTreatmentProProps) => {
  const { data: products, isLoading } = usePublicStoreProducts(storeData.id);
  const featuredProducts = products?.filter((p: any) => p.is_featured).slice(0, 6) || [];
  const allProducts = products || [];

  // Group products by category
  const curtainProducts = allProducts.filter((p: any) => 
    p.inventory_item?.category?.toLowerCase() === 'fabric' || 
    p.inventory_item?.category?.toLowerCase() === 'heading'
  );
  const blindProducts = allProducts.filter((p: any) => 
    p.inventory_item?.category?.toLowerCase().includes('roller') ||
    p.inventory_item?.category?.toLowerCase().includes('blind')
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Professional & Engaging */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background py-20 md:py-32">
        <div className="container max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <Badge className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
                <Award className="h-4 w-4" />
                Premium Window Treatments
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Transform Your Space with
                <span className="block text-primary mt-2">Custom Window Treatments</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Expert craftsmanship meets modern design. Get instant quotes with our advanced calculator and see your windows come to life.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">25+</div>
                    <div className="text-sm text-muted-foreground">Years Experience</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">14M+</div>
                    <div className="text-sm text-muted-foreground">Windows Covered</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary fill-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">5.0</div>
                    <div className="text-sm text-muted-foreground">Customer Rating</div>
                  </div>
                </div>
              </div>
              
              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="h-14 px-8 text-base"
                  style={{ backgroundColor: 'var(--store-primary)' }}
                >
                  <Link to={`/store/${storeData.store_slug}/products`}>
                    <Calculator className="mr-2 h-5 w-5" />
                    Calculate & Buy Now
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
                  <Link to={`/store/${storeData.store_slug}/book`}>
                    <Calendar className="mr-2 h-5 w-5" />
                    Free Consultation
                  </Link>
                </Button>
              </div>
            </motion.div>
            
            {/* Right Column - Visual Grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <Calculator className="h-16 w-16 text-primary mx-auto" />
                      <div className="font-bold text-lg">Instant Calculator</div>
                      <div className="text-sm text-muted-foreground">Get quotes in seconds</div>
                    </div>
                  </div>
                  <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 p-6 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Shield className="h-12 w-12 text-primary mx-auto" />
                      <div className="font-semibold">5-Year Warranty</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-6 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Ruler className="h-12 w-12 text-primary mx-auto" />
                      <div className="font-semibold">Free Measuring</div>
                    </div>
                  </div>
                  <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 p-8 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <Sparkles className="h-16 w-16 text-primary mx-auto" />
                      <div className="font-bold text-lg">Expert Installation</div>
                      <div className="text-sm text-muted-foreground">Professional service</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-y bg-muted/30">
        <div className="container max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-primary">
                <CheckCircle className="h-5 w-5" />
                <span className="font-bold text-lg">100%</span>
              </div>
              <div className="text-sm text-muted-foreground">Satisfaction Guaranteed</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Shield className="h-5 w-5" />
                <span className="font-bold text-lg">5-Year</span>
              </div>
              <div className="text-sm text-muted-foreground">Warranty Coverage</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Ruler className="h-5 w-5" />
                <span className="font-bold text-lg">Free</span>
              </div>
              <div className="text-sm text-muted-foreground">Measuring Service</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Award className="h-5 w-5" />
                <span className="font-bold text-lg">ISO</span>
              </div>
              <div className="text-sm text-muted-foreground">Certified Quality</div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="py-20 md:py-24">
        <div className="container max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Shop by Category</h2>
            <p className="text-xl text-muted-foreground">
              Find the perfect solution for your windows
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Curtains Card */}
            <Link 
              to={`/store/${storeData.store_slug}/products?category=fabric`}
              className="group"
            >
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 hover:shadow-2xl transition-all duration-300 aspect-[16/10]">
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                <div className="relative h-full flex flex-col justify-end p-8">
                  <Badge className="mb-4 w-fit">
                    {curtainProducts.length} Products
                  </Badge>
                  <h3 className="text-3xl md:text-4xl font-bold mb-2 group-hover:text-primary transition-colors">
                    Curtains & Drapes
                  </h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Luxury fabrics with instant calculator
                  </p>
                  <Button 
                    variant="secondary" 
                    className="w-fit"
                    size="lg"
                  >
                    Shop Curtains <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Link>

            {/* Blinds Card */}
            <Link 
              to={`/store/${storeData.store_slug}/products?category=roller`}
              className="group"
            >
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-accent/10 to-primary/10 hover:shadow-2xl transition-all duration-300 aspect-[16/10]">
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                <div className="relative h-full flex flex-col justify-end p-8">
                  <Badge className="mb-4 w-fit">
                    {blindProducts.length} Products
                  </Badge>
                  <h3 className="text-3xl md:text-4xl font-bold mb-2 group-hover:text-primary transition-colors">
                    Blinds & Shades
                  </h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Modern solutions for any window
                  </p>
                  <Button 
                    variant="secondary" 
                    className="w-fit"
                    size="lg"
                  >
                    Shop Blinds <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 md:py-24 bg-muted/30">
          <div className="container max-w-7xl">
            <div className="text-center mb-16">
              <Badge className="mb-4">Featured Collection</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Most Popular Treatments</h2>
              <p className="text-xl text-muted-foreground">
                Customer favorites with instant online calculators
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[500px] rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.map((product: any) => (
                  <EnhancedProductCard
                    key={product.id}
                    product={product}
                    storeSlug={storeData.store_slug}
                  />
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Button asChild size="lg" variant="outline">
                <Link to={`/store/${storeData.store_slug}/products`}>
                  View All Products <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 md:py-24">
        <div className="container max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              From measure to installation in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="relative">
              <div className="text-center space-y-4">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold">Measure & Calculate</h3>
                <p className="text-muted-foreground text-lg">
                  Use our instant calculator to get accurate quotes based on your window measurements
                </p>
              </div>
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
            </div>

            <div className="relative">
              <div className="text-center space-y-4">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold">Choose Your Style</h3>
                <p className="text-muted-foreground text-lg">
                  Select from our range of premium fabrics, blinds, and window treatments
                </p>
              </div>
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
            </div>

            <div className="relative">
              <div className="text-center space-y-4">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold">
                  3
                </div>
                <h3 className="text-2xl font-bold">Expert Installation</h3>
                <p className="text-muted-foreground text-lg">
                  Professional installation by our certified technicians
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Ready to Transform Your Windows?
            </h2>
            <p className="text-xl md:text-2xl mb-12 opacity-90">
              Get an instant quote or book a free consultation with our experts
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-base">
                <Link to={`/store/${storeData.store_slug}/products`}>
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate Now
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <Link to={`/store/${storeData.store_slug}/book`}>
                  <Phone className="mr-2 h-5 w-5" />
                  Call Us Now
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
