
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useCreateLiningOption, useUpdateLiningOption } from "@/hooks/useComponentOptions";
import type { LiningOption } from "@/hooks/useComponentOptions";

interface LiningManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingLining?: LiningOption | null;
}

interface LiningItem {
  id?: string;
  name: string;
  category: string;
  fabricPrice: number;
  fabricUnit: string;
  pricingMethod: 'fixed' | 'per-width' | 'csv-grid';
  csvPricingData?: Array<{ width: number; price: number }>;
  fabricChargeMethod: 'per-meter' | 'per-yard' | 'per-square-meter';
  makeupCostMethod: 'fixed' | 'per-meter' | 'per-width';
  makeupCost: number;
  hemCost: number;
  specifications: Record<string, any>;
}

export const LiningManagementDialog = ({ open, onOpenChange, editingLining }: LiningManagementDialogProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [liningData, setLiningData] = useState<LiningItem>({
    name: editingLining?.name || "",
    category: "",
    fabricPrice: editingLining?.price || 0,
    fabricUnit: editingLining?.unit || "per-meter",
    pricingMethod: "fixed",
    fabricChargeMethod: "per-meter",
    makeupCostMethod: "fixed",
    makeupCost: 0,
    hemCost: 0,
    specifications: {}
  });

  const createLining = useCreateLiningOption();
  const updateLining = useUpdateLiningOption();

  const [csvData, setCsvData] = useState("");

  const liningCategories = [
    "Blackout Lining",
    "Thermal Lining", 
    "Interlining",
    "Bump Interlining",
    "Cotton Sateen",
    "Poly Cotton",
    "Voile Lining",
    "Fire Retardant",
    "Waterproof Lining"
  ];

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        setCsvData(csv);
        processCsvData(csv);
      };
      reader.readAsText(file);
    }
  };

  const processCsvData = (csv: string) => {
    try {
      const lines = csv.trim().split('\n');
      const pricingData: Array<{ width: number; price: number }> = [];
      
      lines.forEach((line, index) => {
        if (index === 0) return; // Skip header
        const [width, price] = line.split(',');
        if (width && price) {
          pricingData.push({
            width: parseFloat(width.trim()),
            price: parseFloat(price.trim())
          });
        }
      });

      setLiningData(prev => ({
        ...prev,
        csvPricingData: pricingData,
        pricingMethod: 'csv-grid'
      }));
      
      toast.success(`Imported ${pricingData.length} pricing entries`);
    } catch (error) {
      toast.error("Error processing CSV data");
    }
  };

  const handleSave = async () => {
    if (!liningData.name.trim()) {
      toast.error("Please enter a lining name");
      return;
    }

    try {
      const liningPayload = {
        name: liningData.name,
        price: liningData.fabricPrice,
        unit: liningData.fabricUnit,
        active: true
      };

      if (editingLining?.id) {
        await updateLining.mutateAsync({
          id: editingLining.id,
          ...liningPayload
        });
        toast.success("Lining option updated successfully");
      } else {
        await createLining.mutateAsync(liningPayload);
        toast.success("Lining option created successfully");
      }
      
      onOpenChange(false);
      
      // Reset form
      setLiningData({
        name: "",
        category: "",
        fabricPrice: 0,
        fabricUnit: "per-meter",
        pricingMethod: "fixed",
        fabricChargeMethod: "per-meter",
        makeupCostMethod: "fixed",
        makeupCost: 0,
        hemCost: 0,
        specifications: {}
      });
    } catch (error) {
      console.error('Error saving lining:', error);
      toast.error("Failed to save lining option");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingLining ? 'Edit' : 'Add'} Lining Option
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Fabric Pricing</TabsTrigger>
            <TabsTrigger value="costs">Make-up & Labor</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="liningName">Lining Name</Label>
                <Input
                  id="liningName"
                  value={liningData.name}
                  onChange={(e) => setLiningData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Premium Blackout Lining"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select 
                  value={liningData.category} 
                  onValueChange={(value) => setLiningData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {liningCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Fabric Charging Method</Label>
              <Select 
                value={liningData.fabricChargeMethod} 
                onValueChange={(value: 'per-meter' | 'per-yard' | 'per-square-meter') => setLiningData(prev => ({ ...prev, fabricChargeMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per-meter">Per Linear Meter</SelectItem>
                  <SelectItem value="per-yard">Per Linear Yard</SelectItem>
                  <SelectItem value="per-square-meter">Per Square Meter</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                How you charge customers for the lining fabric
              </p>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fabric Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Pricing Method</Label>
                  <Select 
                    value={liningData.pricingMethod} 
                    onValueChange={(value: 'fixed' | 'per-width' | 'csv-grid') => setLiningData(prev => ({ ...prev, pricingMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="per-width">Price Per Width</SelectItem>
                      <SelectItem value="csv-grid">CSV Pricing Grid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fabricPrice">Fabric Price</Label>
                    <Input
                      id="fabricPrice"
                      type="number"
                      step="0.01"
                      value={liningData.fabricPrice}
                      onChange={(e) => setLiningData(prev => ({ ...prev, fabricPrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select 
                      value={liningData.fabricUnit} 
                      onValueChange={(value) => setLiningData(prev => ({ ...prev, fabricUnit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per-meter">Per Meter</SelectItem>
                        <SelectItem value="per-yard">Per Yard</SelectItem>
                        <SelectItem value="per-square-meter">Per Square Meter</SelectItem>
                        <SelectItem value="per-foot">Per Foot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {liningData.pricingMethod === 'csv-grid' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="csvUpload">Upload CSV File</Label>
                      <Input
                        id="csvUpload"
                        type="file"
                        accept=".csv"
                        onChange={handleCsvUpload}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: Width (inches), Price. First row should be headers.
                      </p>
                    </div>

                    {liningData.csvPricingData && liningData.csvPricingData.length > 0 && (
                      <div>
                        <Label>Pricing Data Preview</Label>
                        <div className="max-h-40 overflow-y-auto border rounded p-2">
                          {liningData.csvPricingData.slice(0, 10).map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.width}"</span>
                              <span>${item.price}</span>
                            </div>
                          ))}
                          {liningData.csvPricingData.length > 10 && (
                            <p className="text-xs text-muted-foreground">
                              ... and {liningData.csvPricingData.length - 10} more entries
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Make-up Costs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Make-up Cost Method</Label>
                    <Select 
                      value={liningData.makeupCostMethod} 
                      onValueChange={(value: 'fixed' | 'per-meter' | 'per-width') => setLiningData(prev => ({ ...prev, makeupCostMethod: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Cost</SelectItem>
                        <SelectItem value="per-meter">Per Meter</SelectItem>
                        <SelectItem value="per-width">Per Width</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="makeupCost">Make-up Cost</Label>
                    <Input
                      id="makeupCost"
                      type="number"
                      step="0.01"
                      value={liningData.makeupCost}
                      onChange={(e) => setLiningData(prev => ({ ...prev, makeupCost: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="hemCost">Hem Cost</Label>
                  <Input
                    id="hemCost"
                    type="number"
                    step="0.01"
                    value={liningData.hemCost}
                    onChange={(e) => setLiningData(prev => ({ ...prev, hemCost: parseFloat(e.target.value) || 0 }))}
                    placeholder="Cost for hemming"
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Labor Pricing Structure</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Fabric Price:</strong> What you pay for the lining material</p>
                    <p><strong>Make-up Cost:</strong> Labor cost to prepare and attach the lining</p>
                    <p><strong>Hem Cost:</strong> Additional cost for hemming the lining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (gsm)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="e.g., 280"
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Standard Width</Label>
                    <Input
                      id="width"
                      placeholder="e.g., 280cm, 110 inches"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="composition">Composition</Label>
                    <Input
                      id="composition"
                      placeholder="e.g., 100% Polyester, Cotton Blend"
                    />
                  </div>
                  <div>
                    <Label htmlFor="washcare">Wash Care</Label>
                    <Input
                      id="washcare"
                      placeholder="e.g., Dry Clean Only"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="features">Special Features</Label>
                  <Textarea
                    id="features"
                    rows={3}
                    placeholder="e.g., Light blocking, Thermal insulation, Fire retardant..."
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    placeholder="Any additional specifications or notes..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-slate-600 hover:bg-slate-700"
            disabled={createLining.isPending || updateLining.isPending}
          >
            {createLining.isPending || updateLining.isPending 
              ? 'Saving...' 
              : editingLining ? 'Update Lining Option' : 'Save Lining Option'
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
