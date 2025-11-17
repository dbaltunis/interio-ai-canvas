import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePublicStoreProducts } from "@/hooks/usePublicStore";
import { 
  ArrowRight, Calculator, Clock, Shield, Star, Users, 
  Phone, Calendar, Ruler, Sparkles, CheckCircle, Award,
  TrendingUp, Heart, Zap, ChevronRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EnhancedProductCard } from "../enhanced/EnhancedProductCard";
import { motion } from "framer-motion";

interface WindowTreatmentProProps {
  storeData: any;
}

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Homeowner",
    content: "Absolutely stunning work! The team helped us choose perfect window treatments for our living room. The online calculator made getting a quote so easy.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
  },
  {
    name: "Michael Chen",
    role: "Interior Designer",
    content: "We recommend this company to all our clients. Premium quality, amazing service, and the custom measurements are always perfect.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  },
  {
    name: "Jessica Rodriguez",
    role: "Business Owner",
    content: "Transformed our entire office with their commercial-grade blinds. Professional installation and the results exceeded expectations!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
  }
];

export const WindowTreatmentPro = ({ storeData }: WindowTreatmentProProps) => {
  const { data: products, isLoading } = usePublicStoreProducts(storeData.id);
  const featuredProducts = products?.filter((p: any) => p.is_featured).slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
        
        <div className="container max-w-7xl relative z-10 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <Badge className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold mb-6 animate-fade-in">
                <Sparkles className="h-4 w-4" />
                #1 Premium Window Treatments
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Transform Your Space with
                <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Custom Window Treatments
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Expert craftsmanship meets modern design. Get instant quotes with our advanced calculator and see your vision come to life.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="text-lg h-14 px-8 group shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link to={`/store/${storeData.store_slug}/products`}>
                    Browse Products
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg h-14 px-8"
                  asChild
                >
                  <Link to={`/store/${storeData.store_slug}/book`}>
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Free Consultation
                  </Link>
                </Button>
              </div>

              {/* Trust Badges */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-8 pt-8"
              >
                {[
                  { icon: Clock, value: "25+", label: "Years Experience" },
                  { icon: Users, value: "14k+", label: "Happy Clients" },
                  { icon: Star, value: "5.0", label: "Rating" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-2xl">{item.value}</div>
                      <div className="text-sm text-muted-foreground">{item.label}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column - Image Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl hover-scale">
                    <img 
                      src="https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=400&h=500&fit=crop" 
                      alt="Modern curtains"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-xl hover-scale">
                    <img 
                      src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&h=300&fit=crop" 
                      alt="Blinds detail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-12">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-xl hover-scale">
                    <img 
                      src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300&h=300&fit=crop" 
                      alt="Living room"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl hover-scale">
                    <img 
                      src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=500&fit=crop" 
                      alt="Bedroom curtains"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-card border-y">
        <div className="container max-w-7xl py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Quality Guaranteed", desc: "Premium materials" },
              { icon: Calculator, title: "Instant Quotes", desc: "Online calculator" },
              { icon: Ruler, title: "Perfect Fit", desc: "Custom measured" },
              { icon: Zap, title: "Fast Delivery", desc: "2-3 weeks" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-background to-primary/5">
          <div className="container max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="mb-4">
                <Heart className="h-3 w-3 mr-1" />
                Customer Favorites
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our Best Sellers
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover why thousands of customers love these premium window treatments
              </p>
            </motion.div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[500px] rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.map((product: any, index: number) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <EnhancedProductCard
                      product={product}
                      storeSlug={storeData.store_slug}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild className="group">
                <Link to={`/store/${storeData.store_slug}/products`}>
                  View All Products
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-20 bg-card">
        <div className="container max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied customers who transformed their spaces
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Award className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Transform Your Space?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Get a free consultation and instant quote. Our experts are ready to help you create the perfect window treatments for your home or office.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg h-14 px-8 shadow-xl"
                asChild
              >
                <Link to={`/store/${storeData.store_slug}/book`}>
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Free Consultation
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg h-14 px-8 bg-white/10 hover:bg-white/20 text-white border-white/30"
                asChild
              >
                <Link to={`/store/${storeData.store_slug}/contact`}>
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're committed to delivering excellence in every aspect
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: "25+ Years Experience",
                desc: "Industry-leading expertise in custom window treatments"
              },
              {
                icon: Shield,
                title: "Quality Guaranteed",
                desc: "Premium materials with comprehensive warranty coverage"
              },
              {
                icon: Calculator,
                title: "Instant Online Quotes",
                desc: "Get accurate pricing in minutes with our smart calculator"
              },
              {
                icon: Users,
                title: "Expert Installation",
                desc: "Professional fitting by certified technicians"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg">
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
