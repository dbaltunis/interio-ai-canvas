import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Star, Truck, HeadphonesIcon, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { TrustIndicators } from "../shared/TrustIndicators";
import { EnhancedProductCard } from "../enhanced/EnhancedProductCard";
import { useStoreProductCatalog } from "@/hooks/useStoreProductCatalog";

interface WindowTreatmentProProps {
  storeData: any;
}

export const WindowTreatmentPro = ({ storeData }: WindowTreatmentProProps) => {
  const { data: products = [] } = useStoreProductCatalog(storeData.id);
  const featuredProducts = products?.filter(p => p.is_featured && p.is_visible).slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient bg-[length:200%_200%]" />
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm font-medium">Premium Window Treatments</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
            >
              Transform Your
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                Living Spaces
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Luxury window treatments crafted with precision. Expert installation. 
              <span className="text-white font-semibold"> Lifetime satisfaction guaranteed.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                asChild
                size="lg"
                className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300 group"
              >
                <Link to={`/store/${storeData.store_slug}/products`}>
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg rounded-full hover:-translate-y-1 transition-all duration-300"
              >
                <Link to={`/store/${storeData.store_slug}/appointments`}>
                  Free Consultation
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto"
            >
              {[
                { number: "25+", label: "Years Experience" },
                { number: "14M+", label: "Windows Covered" },
                { number: "5.0", label: "Customer Rating" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
            <div className="w-1.5 h-3 bg-white rounded-full animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              Why We're Different
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Premium quality meets exceptional service
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Lifetime Warranty",
                description: "100% satisfaction guaranteed on all installations",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Star,
                title: "Expert Craftsmen",
                description: "25+ years of window treatment expertise",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: Truck,
                title: "Free Installation",
                description: "Professional installation included with purchase",
                color: "from-pink-500 to-pink-600",
              },
              {
                icon: HeadphonesIcon,
                title: "24/7 Support",
                description: "Always here when you need us most",
                color: "from-indigo-500 to-indigo-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-white p-8 rounded-3xl border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                Featured Collection
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Handpicked premium solutions for discerning tastes
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <EnhancedProductCard
                    product={product}
                    storeSlug={storeData.store_slug}
                  />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button
                asChild
                size="lg"
                className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <Link to={`/store/${storeData.store_slug}/products`}>
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      <TrustIndicators />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Transform Your Space?
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-white/90">
              Get your free consultation today. No pressure, just expert advice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-slate-900 hover:bg-gray-100 px-10 py-7 text-lg rounded-full shadow-2xl hover:shadow-white/50 hover:-translate-y-1 transition-all duration-300 group"
              >
                <Link to={`/store/${storeData.store_slug}/appointments`}>
                  Book Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
