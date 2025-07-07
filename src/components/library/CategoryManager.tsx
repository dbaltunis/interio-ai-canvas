
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: 'fabric' | 'hardware';
  productCount: number;
  collections: Collection[];
}

interface Collection {
  id: string;
  name: string;
  vendor: string;
  productCount: number;
  season?: string;
}

export const CategoryManager = () => {
  const [categories] = useState<Category[]>([
    {
      id: "1",
      name: "Upholstery Fabrics",
      type: "fabric",
      productCount: 156,
      collections: [
        { id: "1", name: "Heritage Collection", vendor: "Fibre Naturelle", productCount: 45 },
        { id: "2", name: "Luxury Series", vendor: "KD Design", productCount: 32 }
      ]
    },
    {
      id: "2", 
      name: "Drapery Fabrics",
      type: "fabric",
      productCount: 234,
      collections: [
        { id: "3", name: "Classic Drapes", vendor: "James Hare", productCount: 67 },
        { id: "4", name: "Modern Lines", vendor: "Sahco", productCount: 89 }
      ]
    },
    {
      id: "3",
      name: "Curtain Tracks",
      type: "hardware",
      productCount: 45,
      collections: [
        { id: "5", name: "Professional Series", vendor: "Hunter Douglas", productCount: 25 },
        { id: "6", name: "Silent Systems", vendor: "Silent Gliss", productCount: 20 }
      ]
    }
  ]);

  const renderCategoryCard = (category: Category) => (
    <Card key={category.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{category.name}</CardTitle>
          <Badge variant={category.type === 'fabric' ? 'default' : 'secondary'}>
            {category.type === 'fabric' ? 'Fabric' : 'Hardware'}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{category.productCount} products</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Collections ({category.collections.length})</h4>
          {category.collections.map(collection => (
            <div key={collection.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-sm">{collection.name}</p>
                <p className="text-xs text-gray-500">{collection.vendor} • {collection.productCount} items</p>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between pt-2 border-t">
          <Button variant="outline" size="sm">
            <Plus className="h-3 w-3 mr-1" />
            Add Collection
          </Button>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm">
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Categories & Collections</h2>
          <p className="text-gray-600">Organize your inventory by categories and collections</p>
        </div>
        <Button className="bg-slate-600 hover:bg-slate-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(renderCategoryCard)}
      </div>
    </div>
  );
};
