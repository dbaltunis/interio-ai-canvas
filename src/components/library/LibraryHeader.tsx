
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, FolderTree, ShoppingBag, Upload, Download, Settings, Zap, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";

interface LibraryHeaderProps {
  onAddNew: (type: "vendor" | "fabric" | "hardware" | "collection") => void;
  onShowFilter: () => void;
  onImport: () => void;
  onExport: () => void;
  onShowCategories: () => void;
  onShowShopify: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const LibraryHeader = ({ 
  onAddNew, 
  onShowFilter, 
  onImport, 
  onExport,
  onShowCategories,
  onShowShopify,
  searchTerm,
  onSearchChange 
}: LibraryHeaderProps) => {
  const [hideSetupSection, setHideSetupSection] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('inventory-hide-setup');
    if (saved) {
      setHideSetupSection(JSON.parse(saved));
    }
  }, []);

  // Save preference to localStorage when changed
  const toggleSetupSection = () => {
    const newValue = !hideSetupSection;
    setHideSetupSection(newValue);
    localStorage.setItem('inventory-hide-setup', JSON.stringify(newValue));
  };

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="modern-card-elevated company-gradient text-primary-foreground p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
            <p className="text-primary-foreground/90 text-lg">Manage your products, sync with Shopify, and track inventory</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold">247</div>
              <div className="text-sm text-primary-foreground/80">Total Products</div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleSetupSection}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              {hideSetupSection ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {!hideSetupSection ? (
        <>
          {/* Quick Actions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Shopify Integration Card */}
            <Card className="modern-card hover:border-primary/30 transition-colors cursor-pointer" onClick={onShowShopify}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <ShoppingBag className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">Shopify Store</CardTitle>
                      <CardDescription>Connect & sync products</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-warning">Not Connected</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  Sync inventory, prices, and product data with your Shopify store automatically
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Connect Store
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Categories Management Card */}
            <Card className="modern-card hover:border-primary/30 transition-colors cursor-pointer" onClick={onShowCategories}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-brand-primary/10 rounded-lg">
                    <FolderTree className="h-5 w-5 text-brand-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground">Categories</CardTitle>
                    <CardDescription>Organize product types</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  Create categories like Fabrics, Hardware, Wallpapers to organize your inventory
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">Fabrics</Badge>
                  <Badge variant="secondary" className="text-xs">Hardware</Badge>
                  <Badge variant="secondary" className="text-xs">+3 more</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Add Card */}
            <Card className="modern-card hover:border-accent/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-brand-accent/10 rounded-lg">
                    <Plus className="h-5 w-5 text-brand-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground">Quick Add</CardTitle>
                    <CardDescription>Add new inventory items</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onAddNew("fabric")}>
                  Add Fabric
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onAddNew("hardware")}>
                  Add Hardware
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onAddNew("vendor")}>
                  Add Vendor
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Guide */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-brand-primary flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Getting Started with Shopify Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                  <h4 className="font-medium text-brand-primary mb-1">Connect Store</h4>
                  <p className="text-xs text-muted-foreground">Link your Shopify account</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-brand-secondary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                  <h4 className="font-medium text-brand-primary mb-1">Sync Products</h4>
                  <p className="text-xs text-muted-foreground">Import existing inventory</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-brand-accent text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                  <h4 className="font-medium text-brand-primary mb-1">Set Categories</h4>
                  <p className="text-xs text-muted-foreground">Organize by product type</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">4</div>
                  <h4 className="font-medium text-brand-primary mb-1">Auto-Sync</h4>
                  <p className="text-xs text-muted-foreground">Keep inventory updated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Status Notifications Area */
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-800">Setup Complete</h3>
                  <p className="text-emerald-600">Your inventory system is configured and ready to go!</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700">5</div>
                  <div className="text-sm text-emerald-600">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700">Connected</div>
                  <div className="text-sm text-emerald-600">Shopify Store</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700">247</div>
                  <div className="text-sm text-emerald-600">Products Synced</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between modern-card p-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products, vendors, collections..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 focus:border-primary"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onShowFilter}>
            <Settings className="h-4 w-4 mr-2" />
            Filter
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button variant="brand-outline" size="sm" onClick={onImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Button variant="brand-outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};
