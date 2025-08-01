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
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Expected CSV format: name, description, sku, category, price, fabric_width, composition, etc.
      const products = lines.slice(1).map(line => {
        const values = line.split(',');
        const product: any = { vendor_id: selectedVendor };
        
        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          if (value) {
            switch (header) {
              case 'name':
                product.name = value;
                break;
              case 'description':
                product.description = value;
                break;
              case 'sku':
                product.sku = value;
                break;
              case 'category':
                product.category = value;
                break;
              case 'price':
              case 'unit_price':
                product.unit_price = parseFloat(value) || 0;
                product.selling_price = parseFloat(value) || 0;
                product.cost_price = (parseFloat(value) || 0) * 0.7;
                break;
              case 'fabric_width':
                product.fabric_width = parseFloat(value) || 0;
                break;
              case 'composition':
                product.fabric_composition = value;
                break;
              case 'pattern_repeat_vertical':
                product.pattern_repeat_vertical = parseFloat(value) || 0;
                break;
              case 'pattern_repeat_horizontal':
                product.pattern_repeat_horizontal = parseFloat(value) || 0;
                break;
              case 'color':
                product.color = value;
                break;
              case 'collection':
                product.fabric_collection = value;
                break;
              case 'unit':
                product.unit = value;
                break;
              default:
                // Store any additional fields
                product[header] = value;
            }
          }
        });
        
        // Set defaults
        product.active = true;
        product.quantity = 0;
        
        return product;
      }).filter(product => product.name); // Only include products with names

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
      "name,description,sku,category,price,fabric_width,composition,pattern_repeat_vertical,pattern_repeat_horizontal,color,collection,unit",
      "Luxury Velvet Navy,Premium velvet fabric,LVN-001,curtain_fabric,45.00,137,100% Cotton Velvet,64,32,Navy Blue,Luxury Collection,meters",
      "Silk Dupioni Gold,Elegant silk dupioni,SDG-002,curtain_fabric,85.00,140,100% Silk,0,0,Gold,Premium Collection,meters"
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'vendor_products_template.csv';
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