import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { useState } from "react";

interface EnhancedProductCardProps {
  product: any;
  storeSlug: string;
  onQuickAdd?: (product: any, e: React.MouseEvent) => void;
}

const getCategoryDisplay = (category: string) => {
  const categoryMap: Record<string, string> = {
    'roller-blinds': 'Roller Blinds',
    'roman-blinds': 'Roman Blinds',
    'venetian-blinds': 'Venetian Blinds',
    'vertical-blinds': 'Vertical Blinds',
    'curtains': 'Curtains & Drapes',
    'shutters': 'Plantation Shutters',
  };
  return categoryMap[category] || category;
};

export const EnhancedProductCard = ({ product, storeSlug, onQuickAdd }: EnhancedProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const inventory = product.inventory_item;
  if (!inventory) return null;

  const productName = product.custom_description || inventory.name;
  const productPrice = inventory.sell_price;
  const productCategory = inventory.category;
  const imageUrl = product.custom_images?.[0] || inventory.image_url || "/placeholder.svg";
  const productLink = `/store/${storeSlug}/product/${inventory.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
    >
      {/* Image Container with Overlay */}
      <Link to={productLink} className="relative block aspect-[4/5] overflow-hidden bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <motion.img
          src={imageUrl}
          alt={productName}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.is_featured && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-3 py-1 shadow-lg backdrop-blur-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </motion.div>
          )}
          {inventory.requires_calculator && (
            <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 text-slate-900 shadow-md">
              Custom Quote
            </Badge>
          )}
        </div>

        {/* Hover Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-4 left-4 right-4 flex gap-2"
        >
          <Button
            asChild
            className="flex-1 bg-white text-slate-900 hover:bg-gray-100 rounded-full shadow-xl group/btn"
          >
            <Link to={productLink}>
              View Details
              <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
          {onQuickAdd && !inventory.requires_calculator && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                onQuickAdd(product, e);
              }}
              size="icon"
              className="bg-white text-slate-900 hover:bg-gray-100 rounded-full shadow-xl"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </motion.div>
      </Link>

      {/* Product Info */}
      <div className="p-6 space-y-3">
        {/* Category */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{getCategoryDisplay(productCategory)}</span>
          <span className="flex items-center gap-1 ml-auto">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-slate-900">4.9</span>
          </span>
        </div>

        {/* Product Name */}
        <Link to={productLink}>
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
            {productName}
          </h3>
        </Link>

        {/* Short Description */}
        {inventory.description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {inventory.description}
          </p>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            {productPrice && !inventory.requires_calculator ? (
              <div className="space-y-0.5">
                <div className="text-sm text-gray-500">Starting at</div>
                <div className="text-2xl font-bold text-slate-900">
                  ${productPrice.toFixed(2)}
                </div>
              </div>
            ) : (
              <div className="text-lg font-semibold text-slate-900">
                Get Quote
              </div>
            )}
          </div>
          
          <Button
            asChild
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group/icon"
          >
            <Link to={productLink}>
              <ArrowRight className="w-5 h-5 group-hover/icon:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Trust Signals */}
        <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
          <span className="flex items-center gap-1">
            ✓ Free Consultation
          </span>
          <span className="flex items-center gap-1">
            ✓ Expert Install
          </span>
        </div>
      </div>
    </motion.div>
  );
};
