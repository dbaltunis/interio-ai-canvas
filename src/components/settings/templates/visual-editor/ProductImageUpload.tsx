import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, Plus, Search } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";

interface ProductImageUploadProps {
  productImages: any[];
  onUpdate: (images: any[]) => void;
}

interface ProductImage {
  id: string;
  productName: string;
  imageUrl: string;
  imageSource: 'inventory' | 'upload' | 'placeholder';
  inventoryItemId?: string;
}

export const ProductImageUpload = ({ productImages = [], onUpdate }: ProductImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedInventoryItems, setSelectedInventoryItems] = useState<string[]>([]);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: inventoryItems } = useEnhancedInventory();

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: ProductImage = {
            id: `upload_${Date.now()}_${Math.random()}`,
            productName: newProductName || file.name.replace(/\.[^/.]+$/, ""),
            imageUrl: e.target?.result as string,
            imageSource: 'upload'
          };
          onUpdate([...productImages, newImage]);
          setNewProductName('');
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (imageId: string) => {
    onUpdate(productImages.filter(img => img.id !== imageId));
  };

  const addInventoryItems = () => {
    const newImages = selectedInventoryItems.map(itemId => {
      const inventoryItem = inventoryItems?.find(item => item.id === itemId);
      return {
        id: `inventory_${itemId}`,
        productName: inventoryItem?.name || 'Unknown Product',
        imageUrl: '/placeholder.svg', // In real app, this would come from inventory
        imageSource: 'inventory' as const,
        inventoryItemId: itemId
      };
    });
    
    onUpdate([...productImages, ...newImages]);
    setSelectedInventoryItems([]);
    setShowInventoryDialog(false);
  };

  const addPlaceholderProduct = () => {
    const placeholderProducts = [
      { name: 'Blackout Curtains', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400' },
      { name: 'Roman Blinds', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
      { name: 'Sheer Curtains', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400' },
      { name: 'Venetian Blinds', image: 'https://images.unsplash.com/photo-1522444195799-478538b28823?w=400' },
      { name: 'Roller Shades', image: 'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=400' }
    ];
    
    const randomProduct = placeholderProducts[Math.floor(Math.random() * placeholderProducts.length)];
    
    const newImage: ProductImage = {
      id: `placeholder_${Date.now()}`,
      productName: randomProduct.name,
      imageUrl: randomProduct.image,
      imageSource: 'placeholder'
    };
    
    onUpdate([...productImages, newImage]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Product Images</Label>
        <div className="flex gap-2">
          <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-1" />
                From Inventory
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Select from Inventory</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {inventoryItems?.filter(item => 
                    !productImages.some(img => img.inventoryItemId === item.id)
                  ).map((item) => (
                    <Card 
                      key={item.id} 
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedInventoryItems.includes(item.id) 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedInventoryItems(prev => 
                          prev.includes(item.id) 
                            ? prev.filter(id => id !== item.id)
                            : [...prev, item.id]
                        );
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-600">{item.category}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowInventoryDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={addInventoryItems}
                    disabled={selectedInventoryItems.length === 0}
                  >
                    Add Selected ({selectedInventoryItems.length})
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="sm" onClick={addPlaceholderProduct}>
            <Plus className="h-4 w-4 mr-1" />
            Sample Product
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" />
            Upload Image
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop product images here, or click upload
        </p>
        <div className="space-y-2">
          <Input
            placeholder="Product name (optional)"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            className="max-w-xs mx-auto"
          />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Product Images Grid */}
      {productImages.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-medium">Added Products:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productImages.map((productImage) => (
              <Card key={productImage.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={productImage.imageUrl}
                    alt={productImage.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(productImage.id)}
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Badge 
                    className="absolute top-2 left-2 text-xs"
                    variant={
                      productImage.imageSource === 'inventory' ? 'default' :
                      productImage.imageSource === 'upload' ? 'secondary' : 'outline'
                    }
                  >
                    {productImage.imageSource === 'inventory' ? 'Inventory' :
                     productImage.imageSource === 'upload' ? 'Uploaded' : 'Sample'}
                  </Badge>
                </div>
                <div className="p-3">
                  <Input
                    value={productImage.productName}
                    onChange={(e) => {
                      const updatedImages = productImages.map(img =>
                        img.id === productImage.id
                          ? { ...img, productName: e.target.value }
                          : img
                      );
                      onUpdate(updatedImages);
                    }}
                    className="text-sm font-medium"
                    placeholder="Product name"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};