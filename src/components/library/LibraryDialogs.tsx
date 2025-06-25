
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateInventoryItem } from "@/hooks/useInventory";
import { useCreateVendor } from "@/hooks/useVendors";
import { useFabricImport } from "@/hooks/useFabricImport";
import { useToast } from "@/hooks/use-toast";

interface LibraryDialogsProps {
  showFabricForm: boolean;
  setShowFabricForm: (show: boolean) => void;
  showBrandForm: boolean;
  setShowBrandForm: (show: boolean) => void;
  showCollectionForm: boolean;
  setShowCollectionForm: (show: boolean) => void;
  showFilterDialog: boolean;
  setShowFilterDialog: (show: boolean) => void;
  showCSVUpload: boolean;
  setShowCSVUpload: (show: boolean) => void;
}

export const LibraryDialogs = ({
  showFabricForm,
  setShowFabricForm,
  showBrandForm,
  setShowBrandForm,
  showCollectionForm,
  setShowCollectionForm,
  showFilterDialog,
  setShowFilterDialog,
  showCSVUpload,
  setShowCSVUpload,
}: LibraryDialogsProps) => {
  const [fabricData, setFabricData] = useState({
    name: "",
    sku: "",
    type: "",
    color: "",
    pattern: "",
    supplier: "",
    width: "",
    cost_per_unit: "",
    quantity: "",
  });

  const [brandData, setBrandData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    website: "",
  });

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  const createInventory = useCreateInventoryItem();
  const createVendor = useCreateVendor();
  const fabricImport = useFabricImport();
  const { toast } = useToast();

  const handleFabricSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createInventory.mutateAsync({
        name: fabricData.name,
        category: "Fabric",
        sku: fabricData.sku,
        type: fabricData.type,
        color: fabricData.color,
        pattern: fabricData.pattern,
        supplier: fabricData.supplier,
        width: fabricData.width ? parseFloat(fabricData.width) : null,
        cost_per_unit: fabricData.cost_per_unit ? parseFloat(fabricData.cost_per_unit) : null,
        quantity: fabricData.quantity ? parseFloat(fabricData.quantity) : 0,
        unit: "yard",
      });
      
      setShowFabricForm(false);
      setFabricData({
        name: "",
        sku: "",
        type: "",
        color: "",
        pattern: "",
        supplier: "",
        width: "",
        cost_per_unit: "",
        quantity: "",
      });
    } catch (error) {
      console.error("Failed to create fabric:", error);
    }
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createVendor.mutateAsync({
        name: brandData.name,
        contact_person: brandData.contact_person,
        email: brandData.email,
        phone: brandData.phone,
        website: brandData.website,
        address: "",
      });
      
      setShowBrandForm(false);
      setBrandData({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        website: "",
      });
    } catch (error) {
      console.error("Failed to create brand:", error);
    }
  };

  const handleCSVUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await csvFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const csvData = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim());
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

      console.log("Parsed CSV data:", csvData);
      
      await fabricImport.mutateAsync({
        csvData,
        imageFiles: imageFiles || undefined,
      });
      
      setShowCSVUpload(false);
      setCsvFile(null);
      setImageFiles(null);
    } catch (error) {
      console.error("CSV upload failed:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to process CSV file",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Add Fabric Dialog */}
      <Dialog open={showFabricForm} onOpenChange={setShowFabricForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Fabric</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFabricSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Fabric Name</Label>
                <Input
                  id="name"
                  value={fabricData.name}
                  onChange={(e) => setFabricData({ ...fabricData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU/Code</Label>
                <Input
                  id="sku"
                  value={fabricData.sku}
                  onChange={(e) => setFabricData({ ...fabricData, sku: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={fabricData.type} onValueChange={(value) => setFabricData({ ...fabricData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cotton">Cotton</SelectItem>
                    <SelectItem value="Polyester">Polyester</SelectItem>
                    <SelectItem value="Linen">Linen</SelectItem>
                    <SelectItem value="Silk">Silk</SelectItem>
                    <SelectItem value="Velvet">Velvet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={fabricData.color}
                  onChange={(e) => setFabricData({ ...fabricData, color: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pattern">Pattern</Label>
                <Input
                  id="pattern"
                  value={fabricData.pattern}
                  onChange={(e) => setFabricData({ ...fabricData, pattern: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={fabricData.supplier}
                  onChange={(e) => setFabricData({ ...fabricData, supplier: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="width">Width (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  value={fabricData.width}
                  onChange={(e) => setFabricData({ ...fabricData, width: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cost_per_unit">Cost per Unit</Label>
                <Input
                  id="cost_per_unit"
                  type="number"
                  step="0.01"
                  value={fabricData.cost_per_unit}
                  onChange={(e) => setFabricData({ ...fabricData, cost_per_unit: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={fabricData.quantity}
                  onChange={(e) => setFabricData({ ...fabricData, quantity: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowFabricForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createInventory.isPending}>
                {createInventory.isPending ? "Adding..." : "Add Fabric"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Brand Dialog */}
      <Dialog open={showBrandForm} onOpenChange={setShowBrandForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBrandSubmit} className="space-y-4">
            <div>
              <Label htmlFor="brand-name">Brand Name</Label>
              <Input
                id="brand-name"
                value={brandData.name}
                onChange={(e) => setBrandData({ ...brandData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="contact-person">Contact Person</Label>
              <Input
                id="contact-person"
                value={brandData.contact_person}
                onChange={(e) => setBrandData({ ...brandData, contact_person: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="brand-email">Email</Label>
              <Input
                id="brand-email"
                type="email"
                value={brandData.email}
                onChange={(e) => setBrandData({ ...brandData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="brand-phone">Phone</Label>
              <Input
                id="brand-phone"
                value={brandData.phone}
                onChange={(e) => setBrandData({ ...brandData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="brand-website">Website</Label>
              <Input
                id="brand-website"
                value={brandData.website}
                onChange={(e) => setBrandData({ ...brandData, website: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowBrandForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createVendor.isPending}>
                {createVendor.isPending ? "Adding..." : "Add Brand"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* CSV Upload Dialog */}
      <Dialog open={showCSVUpload} onOpenChange={setShowCSVUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Fabrics from CSV</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCSVUpload} className="space-y-4">
            <div>
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                required
              />
            </div>
            <div>
              <Label htmlFor="image-files">Fabric Images (optional)</Label>
              <Input
                id="image-files"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImageFiles(e.target.files)}
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>CSV should contain columns: vendor_name, collection_name, fabric_name, fabric_code, etc.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCSVUpload(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={fabricImport.isPending}>
                {fabricImport.isPending ? "Importing..." : "Import Fabrics"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog - Basic implementation */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Fabrics</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cotton">Cotton</SelectItem>
                  <SelectItem value="polyester">Polyester</SelectItem>
                  <SelectItem value="linen">Linen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Brand</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowFilterDialog(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collection Dialog - Basic implementation */}
      <Dialog open={showCollectionForm} onOpenChange={setShowCollectionForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input id="collection-name" placeholder="Enter collection name" />
            </div>
            <div>
              <Label htmlFor="collection-brand">Brand</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fibre-naturelle">Fibre Naturelle</SelectItem>
                  <SelectItem value="kd-design">KD Design</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="collection-description">Description</Label>
              <Textarea id="collection-description" placeholder="Collection description" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCollectionForm(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCollectionForm(false)}>
                Add Collection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
