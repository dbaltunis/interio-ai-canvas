import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, Eye, Star, Calculator, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface EnhancedProductCardProps {
  product: any;
  storeSlug: string;
  onQuickAdd?: (product: any, e: React.MouseEvent) => void;
}

const getCategoryDisplay = (category: string) => {
  const map: Record<string, string> = {
    'fabric': 'Curtain Fabric',
    'roller_fabric': 'Roller Blind',
    'wallcovering': 'Wallpaper',
    'heading': 'Curtain Heading',
    'lining': 'Lining Fabric'
  };
  return map[category?.toLowerCase()] || 'Window Treatment';
};

export const EnhancedProductCard = ({ product, storeSlug, onQuickAdd }: EnhancedProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const productName = product.template?.name 
    ? `${product.template.name} - ${product.inventory_item?.name}`
    : product.inventory_item?.name || 'Product';

  const price = product.inventory_item?.unit_price;
  const category = product.inventory_item?.category || 'Window Treatment';
  const imageUrl = product.inventory_item?.image_url;
  
  const productLink = `/store/${storeSlug}/products/${product.inventory_item_id}`;
  console.log('[EnhancedProductCard] Linking to:', productLink, 'for product:', product.inventory_item?.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <Link to={productLink}>
        <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl">
          {/* Image Container with Hover Effects */}
          <div className="relative aspect-[4/5] bg-muted overflow-hidden">
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt={productName}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isHovered ? 'scale-110' : 'scale-100'
                  } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground animate-pulse" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-20 w-20 text-muted-foreground" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
              {product.is_featured && (
                <Badge className="bg-accent text-accent-foreground shadow-lg">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Featured
                </Badge>
              )}
            </div>
            
            {/* Calculator Availability Badge */}
            {product.template?.id ? (
              <Badge className="absolute top-3 right-3 bg-green-500/90 text-white shadow-lg z-10">
                <Calculator className="h-3 w-3 mr-1" />
                Online Calculator
              </Badge>
            ) : (
              <Badge className="absolute top-3 right-3 bg-blue-500/90 text-white shadow-lg z-10">
                <MessageSquare className="h-3 w-3 mr-1" />
                Quote Required
              </Badge>
            )}

            {/* Hover Overlay with Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent flex flex-col items-center justify-end p-6 gap-2"
            >
              <Button
                size="lg"
                className="w-full shadow-lg"
                style={{ backgroundColor: 'var(--store-primary)' }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
              {onQuickAdd && (
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickAdd(product, e);
                  }}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Quick Add
                </Button>
              )}
            </motion.div>

            {/* Price Tag */}
            {price && (
              <div className="absolute bottom-3 right-3 bg-background/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                <p className="text-xs text-muted-foreground">From</p>
                <p className="text-lg font-bold" style={{ color: 'var(--store-primary)' }}>
                  ${price.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-5 space-y-3">
            <div>
              <Badge variant="secondary" className="text-xs mb-2">
                {getCategoryDisplay(category)}
              </Badge>
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {productName}
              </h3>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.custom_description || 
                (typeof product.inventory_item?.description === 'string' 
                  ? product.inventory_item.description 
                  : 'Custom made to your exact specifications')}
            </p>

            {/* Features/Trust Indicators */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">4.9</span>
                </div>
                <span>•</span>
                <span>Free Measuring</span>
                <span>•</span>
                <span>Expert Install</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs py-0.5 px-2">
                  5-Year Warranty
                </Badge>
                <Badge variant="secondary" className="text-xs py-0.5 px-2">
                  Free Consultation
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
