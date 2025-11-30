import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Download, Loader2, Package, Filter } from "lucide-react";
import { useTWCProducts, useImportTWCProducts, type TWCProduct } from "@/hooks/useTWCProducts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const TWCLibraryBrowser = () => {
  const { data: products, isLoading, error } = useTWCProducts();
  const importProducts = useImportTWCProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [productTypeFilter, setProductTypeFilter] = useState<string>("all");

  // Get unique product types from description (extract type from description)
  const productTypes = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    const types = new Set(
      products
        .filter(p => p && p.description)
        .map(p => {
          // Extract type from description (text before first parenthesis or full text)
          const match = p.description.match(/^([^(]+)/);
          return match ? match[1].trim() : p.description;
        })
    );
    return Array.from(types).sort();
  }, [products]);

  // Filter products based on search and product type
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    return products.filter(product => {
      // Skip products with missing required fields
      if (!product || !product.description || !product.itemNumber) {
        return false;
      }

      const productType = product.description.match(/^([^(]+)/)?.[1]?.trim() || product.description;

      const matchesSearch = 
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.itemNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = 
        productTypeFilter === "all" || productType === productTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [products, searchQuery, productTypeFilter]);

  const toggleProduct = (itemNumber: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(itemNumber)) {
      newSelected.delete(itemNumber);
    } else {
      newSelected.add(itemNumber);
    }
    setSelectedProducts(newSelected);
  };

  const toggleAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.itemNumber)));
    }
  };

  const handleImport = () => {
    if (!products || selectedProducts.size === 0) return;

    const productsToImport = products.filter(p => selectedProducts.has(p.itemNumber));
    importProducts.mutate(productsToImport);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading TWC product catalog...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Package className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Failed to load TWC products. Please check your integration settings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          TWC Product Library
        </CardTitle>
        <CardDescription>
          Browse and import products from TWC's catalog into your inventory
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, item number, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {productTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selection Controls */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
            >
              {selectedProducts.size === filteredProducts.length ? "Deselect All" : "Select All"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedProducts.size} of {filteredProducts.length} products selected
            </span>
          </div>
          <Button
            onClick={handleImport}
            disabled={selectedProducts.size === 0 || importProducts.isPending}
          >
            {importProducts.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Import Selected ({selectedProducts.size})
              </>
            )}
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No products found matching your search criteria
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card
                key={product.itemNumber}
                className={`cursor-pointer transition-colors hover:border-primary ${
                  selectedProducts.has(product.itemNumber) ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => toggleProduct(product.itemNumber)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedProducts.has(product.itemNumber)}
                      onCheckedChange={() => toggleProduct(product.itemNumber)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{product.description}</h4>
                          <p className="text-xs text-muted-foreground">
                            Item #: {product.itemNumber}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {product.description.match(/^([^(]+)/)?.[1]?.trim() || "Product"}
                        </Badge>
                      </div>

                      {/* Product Details */}
                      <div className="mt-3 space-y-2">
                        {product.questions && product.questions.length > 0 && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">Options: </span>
                            <span className="font-medium">{product.questions.length} configurable</span>
                          </div>
                        )}
                        {product.fabricsAndColours?.itemMaterials && product.fabricsAndColours.itemMaterials.length > 0 && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">Materials: </span>
                            <span className="font-medium">
                              {product.fabricsAndColours.itemMaterials.length} material options
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
