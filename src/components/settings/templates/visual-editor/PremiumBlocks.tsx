import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag,
  Star,
  Camera,
  Heart,
  Award,
  Zap,
  Clock,
  MapPin,
  Phone,
  Mail
} from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    category?: string;
    rating?: number;
    badges?: string[];
  };
  layout?: 'card' | 'showcase' | 'minimal';
  onSelect?: (productId: string) => void;
}

export const ProductCard = ({ product, layout = 'card', onSelect }: ProductCardProps) => {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  if (layout === 'showcase') {
    return (
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => onSelect?.(product.id)}>
        <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-indigo-100">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Overlay badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.badges?.map((badge, index) => (
              <Badge key={index} variant="secondary" className="bg-white/90 text-gray-900">
                {badge}
              </Badge>
            ))}
          </div>
          
          {/* Rating */}
          {product.rating && (
            <div className="absolute top-4 right-4 bg-white/90 rounded-lg px-2 py-1 flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(product.price)}
            </div>
          </div>
          
          {product.category && (
            <Badge variant="outline" className="mb-3">
              {product.category}
            </Badge>
          )}
          
          <p className="text-gray-600 line-clamp-2 mb-4">
            {product.description}
          </p>
          
          <div className="flex items-center gap-2">
            <Button size="sm" className="flex-1">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Add to Quote
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (layout === 'minimal') {
    return (
      <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onSelect?.(product.id)}>
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Camera className="h-6 w-6 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
          <p className="text-sm text-gray-600 truncate">{product.description}</p>
          {product.category && (
            <Badge variant="outline" className="mt-1 text-xs">
              {product.category}
            </Badge>
          )}
        </div>
        
        <div className="text-right">
          <div className="font-semibold text-gray-900">{formatCurrency(product.price)}</div>
          {product.rating && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {product.rating}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default card layout
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect?.(product.id)}>
      <div className="aspect-square bg-gray-100 relative">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {product.badges?.length && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/90">
              {product.badges[0]}
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-900 line-clamp-1">{product.name}</h4>
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">{product.rating}</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="font-semibold text-gray-900">
            {formatCurrency(product.price)}
          </div>
          
          {product.category && (
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

interface ProductGridProps {
  products: ProductCardProps['product'][];
  layout?: 'card' | 'showcase' | 'minimal';
  columns?: 2 | 3 | 4;
  onProductSelect?: (productId: string) => void;
}

export const ProductGrid = ({ 
  products, 
  layout = 'card', 
  columns = 3, 
  onProductSelect 
}: ProductGridProps) => {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  if (layout === 'minimal') {
    return (
      <div className="space-y-2">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            layout="minimal"
            onSelect={onProductSelect}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-6`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          layout={layout}
          onSelect={onProductSelect}
        />
      ))}
    </div>
  );
};

interface TestimonialCardProps {
  testimonial: {
    id: string;
    content: string;
    author: string;
    role?: string;
    company?: string;
    avatar?: string;
    rating?: number;
  };
  layout?: 'card' | 'minimal' | 'featured';
}

export const TestimonialCard = ({ testimonial, layout = 'card' }: TestimonialCardProps) => {
  if (layout === 'featured') {
    return (
      <Card className="p-8 text-center">
        <div className="mb-6">
          {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 inline-block" />
          ))}
        </div>
        
        <blockquote className="text-lg italic text-gray-700 mb-6">
          "{testimonial.content}"
        </blockquote>
        
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            {testimonial.avatar ? (
              <img src={testimonial.avatar} alt={testimonial.author} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="font-medium text-gray-600">{testimonial.author.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{testimonial.author}</div>
            {testimonial.role && (
              <div className="text-sm text-gray-600">
                {testimonial.role} {testimonial.company && `at ${testimonial.company}`}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          {testimonial.avatar ? (
            <img src={testimonial.avatar} alt={testimonial.author} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="font-medium text-gray-600 text-sm">{testimonial.author.charAt(0)}</span>
          )}
        </div>
        
        <div className="flex-1">
          <p className="text-gray-700 mb-3">"{testimonial.content}"</p>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 text-sm">{testimonial.author}</div>
              {testimonial.role && (
                <div className="text-xs text-gray-600">
                  {testimonial.role} {testimonial.company && `at ${testimonial.company}`}
                </div>
              )}
            </div>
            
            {testimonial.rating && (
              <div className="flex items-center gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};