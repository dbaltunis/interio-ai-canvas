import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingBag,
  Star,
  Camera,
  Grid3X3,
  List,
  Eye,
  Filter,
  Search,
  Package,
  Tag,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { ProductCard, ProductGrid } from './PremiumBlocks';
import { useEnhancedInventory } from '@/hooks/useEnhancedInventory';
import { formatCurrency } from '@/utils/templateRenderer';

interface EnhancedProductDisplayProps {
  content: any;
  onUpdate: (content: any) => void;
  projectData?: any;
  isEditable?: boolean;
}

export const EnhancedProductDisplay = ({ 
  content, 
  onUpdate, 
  projectData,
  isEditable = false 
}: EnhancedProductDisplayProps) => {
  const [viewMode, setViewMode] = useState(content.viewMode || 'grid');
  const [columns, setColumns] = useState(content.columns || 3);
  const [showImages, setShowImages] = useState(content.showImages !== false);
  const [showPricing, setShowPricing] = useState(content.showPricing !== false);
  const [showDescriptions, setShowDescriptions] = useState(content.showDescriptions !== false);
  const [filterCategory, setFilterCategory] = useState(content.filterCategory || 'all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: inventory } = useEnhancedInventory();

  // Get real product data from project or inventory
  const getProductData = () => {
    if (projectData?.treatments?.length) {
      return projectData.treatments.map((treatment: any) => ({
        id: treatment.id,
        name: treatment.product_name || treatment.treatment_type || 'Treatment',
        description: treatment.description || `${treatment.treatment_type} for ${treatment.room_name || 'room'}`,
        price: treatment.client_cost || treatment.total_cost || 0,
        category: treatment.treatment_type,
        image: treatment.product_image,
        quantity: treatment.quantity || 1,
        room: treatment.room_name,
        badges: treatment.is_featured ? ['Featured'] : []
      }));
    }

    // Fallback to inventory data
    if (inventory?.length) {
      return inventory.slice(0, 12).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.selling_price || item.cost_price || 0,
        category: item.category,
        image: item.image_url,
        badges: item.is_featured ? ['Featured'] : []
      }));
    }

    // Mock data for preview
    return [
      {
        id: '1',
        name: 'Premium Curtains',
        description: 'Elegant floor-to-ceiling curtains with blackout lining',
        price: 450,
        category: 'Curtains',
        image: '/placeholder.svg',
        badges: ['Popular', 'Premium']
      },
      {
        id: '2',
        name: 'Smart Blinds',
        description: 'Motorized blinds with app control and scheduling',
        price: 680,
        category: 'Blinds',
        image: '/placeholder.svg',
        badges: ['Smart Home']
      },
      {
        id: '3',
        name: 'Wooden Shutters',
        description: 'Handcrafted plantation shutters in premium timber',
        price: 890,
        category: 'Shutters',
        image: '/placeholder.svg',
        badges: ['Handcrafted']
      }
    ];
  };

  const products = getProductData();
  const categories = ['all', ...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const updateContent = (updates: any) => {
    const newContent = { ...content, ...updates };
    onUpdate(newContent);
  };

  const renderControls = () => {
    if (!isEditable) return null;

    return (
      <Card className="p-4 mb-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>View Mode</Label>
            <Select value={viewMode} onValueChange={(value) => {
              setViewMode(value);
              updateContent({ viewMode: value });
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    Grid View
                  </div>
                </SelectItem>
                <SelectItem value="list">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    List View
                  </div>
                </SelectItem>
                <SelectItem value="showcase">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Showcase
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode === 'grid' && (
            <div className="space-y-2">
              <Label>Columns</Label>
              <Select value={columns.toString()} onValueChange={(value) => {
                const cols = parseInt(value);
                setColumns(cols);
                updateContent({ columns: cols });
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Category Filter</Label>
            <Select value={filterCategory} onValueChange={(value) => {
              setFilterCategory(value);
              updateContent({ filterCategory: value });
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Search Products</Label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Switch
              checked={showImages}
              onCheckedChange={(checked) => {
                setShowImages(checked);
                updateContent({ showImages: checked });
              }}
            />
            <Label>Show Images</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={showPricing}
              onCheckedChange={(checked) => {
                setShowPricing(checked);
                updateContent({ showPricing: checked });
              }}
            />
            <Label>Show Pricing</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={showDescriptions}
              onCheckedChange={(checked) => {
                setShowDescriptions(checked);
                updateContent({ showDescriptions: checked });
              }}
            />
            <Label>Show Descriptions</Label>
          </div>
        </div>
      </Card>
    );
  };

  const renderProductStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4 hover-scale">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <div className="text-2xl font-bold">{filteredProducts.length}</div>
            <div className="text-sm text-gray-600">Products</div>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover-scale">
        <div className="flex items-center gap-3">
          <Tag className="h-8 w-8 text-green-600" />
          <div>
            <div className="text-2xl font-bold">{categories.length - 1}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover-scale">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-yellow-600" />
          <div>
            <div className="text-2xl font-bold">
              {formatCurrency(filteredProducts.reduce((sum, p) => sum + p.price, 0))}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover-scale">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-purple-600" />
          <div>
            <div className="text-2xl font-bold">
              {formatCurrency(filteredProducts.reduce((sum, p) => sum + p.price, 0) / filteredProducts.length || 0)}
            </div>
            <div className="text-sm text-gray-600">Avg. Price</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const enhancedProducts = filteredProducts.map(product => ({
    ...product,
    image: showImages ? product.image : undefined,
    price: showPricing ? product.price : 0,
    description: showDescriptions ? product.description : ''
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">
          {content.title || 'Product Showcase'}
        </h3>
        {filteredProducts.length > 0 && (
          <Badge variant="outline" className="text-sm">
            {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {renderControls()}
      
      {content.showStats && renderProductStats()}

      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {searchTerm || filterCategory !== 'all' 
              ? 'Try adjusting your filters or search terms'
              : 'Add products to your inventory to display them here'
            }
          </p>
        </Card>
      ) : (
        <div className="animate-fade-in">
          <ProductGrid
            products={enhancedProducts}
            layout={viewMode === 'showcase' ? 'showcase' : viewMode === 'list' ? 'minimal' : 'card'}
            columns={viewMode === 'grid' ? columns as 2 | 3 | 4 : 3}
          />
        </div>
      )}
    </div>
  );
};