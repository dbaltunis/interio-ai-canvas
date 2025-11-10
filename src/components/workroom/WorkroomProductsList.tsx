import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Users, Share2, Filter } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CurtainVisualizer } from "@/components/treatment-visualizers/CurtainVisualizer";

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
  const icons = {
    curtains: '🪟',
    blinds: '🎯',
    wallpaper: '🎨',
    other: '📦'
  };
  return icons[category as keyof typeof icons] || '📦';
};

interface WorkroomProduct {
  id: string;
  name: string;
  category: 'curtains' | 'blinds' | 'wallpaper' | 'other';
  room_name?: string;
  specifications?: any;
  measurements?: any;
  materials?: any;
  instructions?: string;
  notes?: string;
  includeInWorkroom?: boolean;
  quantity?: number;
}

interface WorkroomProductsListProps {
  projectId: string;
  workshopItems?: any[];
}

export const WorkroomProductsList: React.FC<WorkroomProductsListProps> = ({
  projectId,
  workshopItems = []
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['curtains', 'blinds', 'wallpaper']));
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [groupByRoom, setGroupByRoom] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Transform workshop items to workroom products
  const products: WorkroomProduct[] = workshopItems.map(item => ({
    id: item.id,
    name: item.treatment_type || item.product_name || 'Unnamed Product',
    category: getCategoryFromItem(item),
    room_name: item.room_name,
    specifications: item.specifications,
    measurements: item.measurements,
    materials: item.materials,
    instructions: item.notes,
    notes: item.notes,
    includeInWorkroom: item.include_in_workroom ?? true,
    quantity: item.quantity || 1
  }));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleRoom = (roomId: string) => {
    const newExpanded = new Set(expandedRooms);
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId);
    } else {
      newExpanded.add(roomId);
    }
    setExpandedRooms(newExpanded);
  };

  // Group products by category
  const productsByCategory = {
    curtains: products.filter(p => p.category === 'curtains' && p.includeInWorkroom),
    blinds: products.filter(p => p.category === 'blinds' && p.includeInWorkroom),
    wallpaper: products.filter(p => p.category === 'wallpaper' && p.includeInWorkroom),
    other: products.filter(p => p.category === 'other' && p.includeInWorkroom)
  };

  // Group by room within category
  const groupProductsByRoom = (items: WorkroomProduct[]) => {
    const grouped: Record<string, WorkroomProduct[]> = {};
    items.forEach(item => {
      const room = item.room_name || 'Unassigned';
      if (!grouped[room]) {
        grouped[room] = [];
      }
      grouped[room].push(item);
    });
    return grouped;
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Work Orders</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manufacturing instructions organized by product category
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Assign Team
          </Button>
          <Button size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share with Manufacturer
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="group-by-room"
                  checked={groupByRoom}
                  onCheckedChange={setGroupByRoom}
                />
                <Label htmlFor="group-by-room">Group by Room</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products by Category */}
      <div className="space-y-4">
        {Object.entries(productsByCategory).map(([category, items]) => {
          if (items.length === 0) return null;
          
          const isCategoryExpanded = expandedCategories.has(category);
          const groupedByRoom = groupByRoom ? groupProductsByRoom(items) : { 'All Items': items };

          return (
            <Card key={category}>
              <Collapsible open={isCategoryExpanded} onOpenChange={() => toggleCategory(category)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isCategoryExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        <span className="text-2xl">{getCategoryIcon(category)}</span>
                        <CardTitle className="text-xl">{getCategoryLabel(category)}</CardTitle>
                        <Badge variant="secondary">{items.length} item{items.length !== 1 ? 's' : ''}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {Object.entries(groupedByRoom).map(([roomName, roomItems]) => {
                      const roomId = `${category}-${roomName}`;
                      const isRoomExpanded = expandedRooms.has(roomId) || !groupByRoom;

                      if (groupByRoom && roomName !== 'All Items') {
                        return (
                          <Collapsible key={roomId} open={isRoomExpanded} onOpenChange={() => toggleRoom(roomId)}>
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer">
                                {isRoomExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                <span className="font-medium text-foreground">{roomName}</span>
                                <Badge variant="outline">{roomItems.length}</Badge>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-3 space-y-3">
                              {roomItems.map(product => (
                                <ProductCard key={product.id} product={product} category={category} />
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      }

                      return (
                        <div key={roomId} className="space-y-3">
                          {roomItems.map(product => (
                            <ProductCard key={product.id} product={product} category={category} />
                          ))}
                        </div>
                      );
                    })}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {products.filter(p => p.includeInWorkroom).length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No products assigned to workroom yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Product Card Component
const ProductCard: React.FC<{ product: WorkroomProduct; category: string }> = ({ product, category }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 border rounded-lg bg-card">
      {/* Left Side - Visual */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">{product.name}</h4>
          <Badge variant="outline">Qty: {product.quantity}</Badge>
        </div>
        
        {/* Visual Preview */}
        <div className="aspect-[4/3] bg-muted/30 rounded-lg flex items-center justify-center border">
          {category === 'curtains' && product.measurements ? (
            <CurtainVisualizer
              windowType="standard"
              measurements={{
                width: product.measurements.rail_width || product.measurements.width || 200,
                height: product.measurements.drop || product.measurements.height || 250,
                unit: 'cm'
              }}
              template={{ fullness: product.specifications?.fullness || '2x' }}
              fabric={{ type: product.materials?.fabric_type }}
              hardware={{ type: 'rod' }}
              className="w-full h-full"
              hideDetails={false}
            />
          ) : (
            <div className="text-center p-6">
              <span className="text-4xl">{getCategoryIcon(category)}</span>
              <p className="text-sm text-muted-foreground mt-2">Visual preview</p>
            </div>
          )}
        </div>

        {/* Measurements Summary */}
        {product.measurements && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(product.measurements).map(([key, value]) => (
              <div key={key} className="flex justify-between p-2 bg-muted/20 rounded">
                <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="font-medium text-foreground">{String(value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Side - Instructions */}
      <div className="space-y-4">
        <div>
          <h5 className="font-semibold text-sm text-foreground mb-2">Manufacturing Instructions</h5>
          <div className="prose prose-sm max-w-none text-foreground">
            {product.instructions ? (
              <p className="whitespace-pre-wrap text-sm">{product.instructions}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No specific instructions provided</p>
            )}
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && (
          <div>
            <h5 className="font-semibold text-sm text-foreground mb-2">Specifications</h5>
            <div className="space-y-1">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm py-1 border-b border-border/50">
                  <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-medium text-foreground">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Materials */}
        {product.materials && (
          <div>
            <h5 className="font-semibold text-sm text-foreground mb-2">Materials</h5>
            <div className="space-y-1">
              {Object.entries(product.materials).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2 text-sm py-1">
                  <span className="text-muted-foreground capitalize min-w-[100px]">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-medium text-foreground">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {product.notes && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <h5 className="font-semibold text-sm text-foreground mb-1">Notes</h5>
            <p className="text-sm text-muted-foreground">{product.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to determine category from workshop item
function getCategoryFromItem(item: any): 'curtains' | 'blinds' | 'wallpaper' | 'other' {
  const type = (item.treatment_type || item.product_name || '').toLowerCase();
  
  if (type.includes('curtain') || type === 'curtains') return 'curtains';
  if (type.includes('blind') || type.includes('shade') || type === 'roller' || type === 'venetian') return 'blinds';
  if (type.includes('wallpaper') || type.includes('wall covering')) return 'wallpaper';
  
  return 'other';
}
