import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Plus, Search, Filter } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useCreateEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export const VendorProductLibrary = () => {
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { data: vendors = [] } = useVendors();
  const { data: inventory = [] } = useEnhancedInventory();
  const createInventoryItem = useCreateEnhancedInventoryItem();
  const { toast } = useToast();

  // Filter inventory by selected vendor
  const vendorProducts = inventory.filter(item => 
    selectedVendor && selectedVendor !== "all" ? item.vendor_id === selectedVendor : true
  ).filter(item =>
    searchTerm ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const selectedVendorData = vendors.find(v => v.id === selectedVendor && selectedVendor !== "all");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const processCSV = async () => {
    if (!csvFile || !selectedVendor) {
      toast({
        title: "Missing information",
        description: "Please select a vendor and CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      
      // Support Shopify CSV format with fabric-specific enhancements
      const products = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const product: any = { vendor_id: selectedVendor };
        
        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          if (value) {
            switch (header) {
              // Shopify standard fields
              case 'handle':
              case 'title':
              case 'name':
                product.name = value;
                break;
              case 'body (html)':
              case 'description':
                product.description = value;
                break;
              case 'vendor':
                // Keep track of original vendor from CSV
                product.original_vendor = value;
                break;
              case 'product type':
              case 'type':
              case 'category':
                // Map to our categories with fabric focus
                if (value.toLowerCase().includes('fabric') || value.toLowerCase().includes('textile')) {
                  product.category = 'curtain_fabric';
                } else if (value.toLowerCase().includes('hardware')) {
                  product.category = 'hardware';
                } else if (value.toLowerCase().includes('trim')) {
                  product.category = 'trims';
                } else {
                  product.category = value.toLowerCase().replace(' ', '_');
                }
                break;
              case 'tags':
                product.tags = value.split(',').map(tag => tag.trim());
                break;
              case 'variant sku':
              case 'sku':
                product.sku = value;
                break;
              case 'variant price':
              case 'price':
              case 'unit_price':
                const price = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
                product.unit_price = price;
                product.selling_price = price;
                product.cost_price = price * 0.7;
                break;
              case 'variant inventory qty':
              case 'quantity':
              case 'inventory':
                product.quantity = parseInt(value) || 0;
                break;
              case 'image src':
              case 'image_url':
                product.image_url = value;
                break;
              
              // Fabric-specific fields
              case 'fabric width':
              case 'fabric_width':
              case 'width':
                product.fabric_width = parseFloat(value) || 0;
                break;
              case 'composition':
              case 'fabric composition':
              case 'material':
                product.fabric_composition = value;
                break;
              case 'pattern repeat vertical':
              case 'pattern_repeat_vertical':
                product.pattern_repeat_vertical = parseFloat(value) || 0;
                break;
              case 'pattern repeat horizontal':
              case 'pattern_repeat_horizontal':
                product.pattern_repeat_horizontal = parseFloat(value) || 0;
                break;
              case 'color':
              case 'colour':
                product.color = value;
                break;
              case 'collection':
              case 'fabric collection':
                product.fabric_collection = value;
                break;
              case 'care instructions':
              case 'care':
                product.care_instructions = value;
                break;
              case 'origin':
              case 'country of origin':
                product.origin_country = value;
                break;
              case 'weight':
              case 'fabric weight':
                product.fabric_weight = parseFloat(value) || 0;
                break;
              case 'fire rating':
              case 'flame retardant':
                product.fire_rating = value;
                break;
              case 'unit':
              case 'sold by':
                product.unit = value.toLowerCase().includes('meter') ? 'meters' : 
                            value.toLowerCase().includes('yard') ? 'yards' : value;
                break;
              case 'rotation':
              case 'orientation':
              case 'roll direction':
                product.roll_direction = value.toLowerCase().includes('vertical') ? 'vertical' : 'horizontal';
                break;
              case 'rotatable':
              case 'can rotate':
              case 'fabric rotatable':
                product.fabric_rotatable = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
                break;
              default:
                // Store any additional fields as metadata
                if (value && value !== '') {
                  if (!product.metadata) product.metadata = {};
                  product.metadata[header] = value;
                }
            }
          }
        });
        
        // Set intelligent defaults based on product type
        product.active = true;
        if (!product.quantity) product.quantity = 0;
        if (!product.unit) product.unit = 'meters'; // Default for fabrics
        
        // Auto-categorize if not set
        if (!product.category) {
          if (product.name?.toLowerCase().includes('fabric') || product.fabric_width) {
            product.category = 'curtain_fabric';
          } else if (product.name?.toLowerCase().includes('pole') || product.name?.toLowerCase().includes('rod')) {
            product.category = 'hardware';
          } else {
            product.category = 'other';
          }
        }
        
        return product;
      }).filter(product => product.name && product.name !== ''); // Only include products with names

      // Create products in batches
      let successCount = 0;
      let errorCount = 0;

      for (const product of products) {
        try {
          await createInventoryItem.mutateAsync(product);
          successCount++;
        } catch (error) {
          console.error("Error creating product:", error);
          errorCount++;
        }
      }

      toast({
        title: "CSV Upload Complete",
        description: `${successCount} products added successfully${errorCount > 0 ? `, ${errorCount} errors` : ''}`,
      });

      setIsUploadOpen(false);
      setCsvFile(null);
      
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast({
        title: "Error processing CSV",
        description: "Please check your CSV format and try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      // Shopify-compatible format with fabric-specific fields
      "Handle,Title,Body (HTML),Vendor,Product Type,Tags,Published,Option1 Name,Option1 Value,Option2 Name,Option2 Value,Variant SKU,Variant Grams,Variant Inventory Tracker,Variant Inventory Qty,Variant Inventory Policy,Variant Fulfillment Service,Variant Price,Variant Compare At Price,Variant Requires Shipping,Variant Taxable,Variant Barcode,Image Src,Image Position,Image Alt Text,Gift Card,SEO Title,SEO Description,Google Shopping / Google Product Category,Google Shopping / Gender,Google Shopping / Age Group,Google Shopping / MPN,Google Shopping / AdWords Grouping,Google Shopping / AdWords Labels,Google Shopping / Condition,Google Shopping / Custom Product,Google Shopping / Custom Label 0,Google Shopping / Custom Label 1,Google Shopping / Custom Label 2,Google Shopping / Custom Label 3,Google Shopping / Custom Label 4,Variant Image,Variant Weight Unit,Variant Tax Code,Cost per item,Status,Fabric Width,Composition,Pattern Repeat Vertical,Pattern Repeat Horizontal,Color,Collection,Care Instructions,Origin,Fabric Weight,Fire Rating,Unit,Rotation,Rotatable",
      
      // Sample fabric entries
      "luxury-velvet-navy,Luxury Velvet Navy,Premium velvet curtain fabric perfect for elegant window treatments,Angely-Paris,Fabric,curtain fabric;velvet;luxury,TRUE,Color,Navy,,,LVN-001,0,shopify,50,deny,manual,45.00,,TRUE,TRUE,,,,,,,,,,,,,,,,,,,,kg,,45.00,active,137,100% Cotton Velvet,64,32,Navy Blue,Luxury Collection,Dry clean only,France,350,FR rated,meters,horizontal,yes",
      
      "silk-dupioni-gold,Silk Dupioni Gold,Elegant silk dupioni with natural slub texture for sophisticated interiors,Angely-Paris,Fabric,curtain fabric;silk;premium,TRUE,Color,Gold,,,SDG-002,0,shopify,25,deny,manual,85.00,,TRUE,TRUE,,,,,,,,,,,,,,,,,,,,kg,,65.00,active,140,100% Silk,0,0,Gold,Premium Collection,Dry clean recommended,Italy,220,Inherently flame resistant,meters,vertical,no",
      
      "cotton-linen-natural,Cotton Linen Natural,Natural cotton linen blend perfect for casual elegance,Angely-Paris,Fabric,curtain fabric;cotton;linen;natural,TRUE,Color,Natural,,,CLN-003,0,shopify,100,deny,manual,32.00,,TRUE,TRUE,,,,,,,,,,,,,,,,,,,,kg,,22.00,active,150,65% Cotton 35% Linen,25,15,Natural,Essentials Collection,Machine wash cold,Portugal,280,Flame retardant treated,meters,horizontal,yes"
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'shopify_fabric_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header with vendor selection and upload */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Label>Select Vendor</Label>
            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger>
                <SelectValue placeholder="All vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-64">
            <Label>Search Products</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedVendor}>
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Vendor Products</DialogTitle>
                <DialogDescription>
                  Upload a CSV file with products for {selectedVendorData?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv-upload">CSV File</Label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                </div>
                
                {csvFile && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{csvFile.name}</span>
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground">
                  <p>CSV should include columns: name, description, sku, category, price, fabric_width, composition</p>
                  <p>Download the template above for the correct format.</p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={processCSV} 
                    disabled={!csvFile || isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Upload Products"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vendor info card */}
      {selectedVendorData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {selectedVendorData.name}
              <Badge variant="secondary">{selectedVendorData.company_type}</Badge>
            </CardTitle>
            <CardDescription>
              {selectedVendorData.contact_person && `Contact: ${selectedVendorData.contact_person}`}
              {selectedVendorData.email && ` • ${selectedVendorData.email}`}
              {selectedVendorData.lead_time_days && ` • Lead time: ${selectedVendorData.lead_time_days} days`}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Products table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Product Library
            <Badge variant="outline">{vendorProducts.length} products</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Specifications</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorProducts.map((product) => {
                  const vendor = vendors.find(v => v.id === product.vendor_id);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-muted-foreground">{product.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category?.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>{vendor?.name || 'Unknown'}</TableCell>
                      <TableCell>${product.selling_price?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {product.fabric_width && (
                            <div>Width: {product.fabric_width}cm</div>
                          )}
                          {product.fabric_composition && (
                            <div>Composition: {product.fabric_composition}</div>
                          )}
                          {product.color && (
                            <div>Color: {product.color}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.active ? "default" : "secondary"}>
                          {product.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {vendorProducts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No products found. Upload a CSV to add products for your vendors.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};