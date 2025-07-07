
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
import { Plus, Trash2, Upload, Download } from "lucide-react";
import { toast } from "sonner";

interface HardwareManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface HardwareItem {
  id?: string;
  name: string;
  category: string;
  basePrice: number;
  unit: string;
  pricingMethod: 'fixed' | 'per-width' | 'csv-grid';
  csvPricingData?: Array<{ width: number; price: number }>;
  subComponents: SubComponent[];
  specifications: Record<string, any>;
}

interface SubComponent {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  required: boolean;
  options?: string[];
}

export const HardwareManagementDialog = ({ open, onOpenChange }: HardwareManagementDialogProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [hardwareData, setHardwareData] = useState<HardwareItem>({
    name: "",
    category: "",
    basePrice: 0,
    unit: "per-meter",
    pricingMethod: "fixed",
    subComponents: [],
    specifications: {}
  });

  const [csvData, setCsvData] = useState("");
  const [subComponentForm, setSubComponentForm] = useState({
    name: "",
    category: "",
    price: 0,
    unit: "each",
    required: false,
    options: ""
  });

  const hardwareCategories = [
    "Curtain Tracks",
    "Curtain Poles", 
    "Motorization",
    "Brackets & Fixings",
    "Finials",
    "Tie-backs",
    "Blind Components",
    "Valance Boards",
    "Accessories"
  ];

  const subComponentCategories = [
    "Finials",
    "Motors", 
    "Batteries",
    "Remotes",
    "Connectors",
    "Brackets",
    "Hooks",
    "Bending",
    "Colors",
    "Types"
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

      setHardwareData(prev => ({
        ...prev,
        csvPricingData: pricingData,
        pricingMethod: 'csv-grid'
      }));
      
      toast.success(`Imported ${pricingData.length} pricing entries`);
    } catch (error) {
      toast.error("Error processing CSV data");
    }
  };

  const addSubComponent = () => {
    if (!subComponentForm.name.trim()) {
      toast.error("Please enter a component name");
      return;
    }

    const newSubComponent: SubComponent = {
      id: Date.now().toString(),
      name: subComponentForm.name,
      category: subComponentForm.category,
      price: subComponentForm.price,
      unit: subComponentForm.unit,
      required: subComponentForm.required,
      options: subComponentForm.options ? subComponentForm.options.split(',').map(o => o.trim()) : undefined
    };

    setHardwareData(prev => ({
      ...prev,
      subComponents: [...prev.subComponents, newSubComponent]
    }));

    setSubComponentForm({
      name: "",
      category: "",
      price: 0,
      unit: "each",
      required: false,
      options: ""
    });

    toast.success("Sub-component added");
  };

  const removeSubComponent = (id: string) => {
    setHardwareData(prev => ({
      ...prev,
      subComponents: prev.subComponents.filter(sc => sc.id !== id)
    }));
  };

  const handleSave = () => {
    if (!hardwareData.name.trim()) {
      toast.error("Please enter a hardware name");
      return;
    }

    console.log("Saving hardware data:", hardwareData);
    toast.success("Hardware component saved successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hardware Component Management</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="subcomponents">Sub-Components</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hardwareName">Hardware Name</Label>
                <Input
                  id="hardwareName"
                  value={hardwareData.name}
                  onChange={(e) => setHardwareData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Premium Curtain Track"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select 
                  value={hardwareData.category} 
                  onValueChange={(value) => setHardwareData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {hardwareCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Base Price</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={hardwareData.basePrice}
                  onChange={(e) => setHardwareData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select 
                  value={hardwareData.unit} 
                  onValueChange={(value) => setHardwareData(prev => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-meter">Per Meter</SelectItem>
                    <SelectItem value="per-yard">Per Yard</SelectItem>
                    <SelectItem value="per-foot">Per Foot</SelectItem>
                    <SelectItem value="per-inch">Per Inch</SelectItem>
                    <SelectItem value="each">Each</SelectItem>
                    <SelectItem value="set">Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div>
              <Label>Pricing Method</Label>
              <Select 
                value={hardwareData.pricingMethod} 
                onValueChange={(value: 'fixed' | 'per-width' | 'csv-grid') => setHardwareData(prev => ({ ...prev, pricingMethod: value }))}
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

            {hardwareData.pricingMethod === 'csv-grid' && (
              <Card>
                <CardHeader>
                  <CardTitle>CSV Pricing Grid</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  {hardwareData.csvPricingData && hardwareData.csvPricingData.length > 0 && (
                    <div>
                      <Label>Pricing Data Preview</Label>
                      <div className="max-h-40 overflow-y-auto border rounded p-2">
                        {hardwareData.csvPricingData.slice(0, 10).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.width}"</span>
                            <span>${item.price}</span>
                          </div>
                        ))}
                        {hardwareData.csvPricingData.length > 10 && (
                          <p className="text-xs text-muted-foreground">
                            ... and {hardwareData.csvPricingData.length - 10} more entries
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="subcomponents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Sub-Component</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subName">Component Name</Label>
                    <Input
                      id="subName"
                      value={subComponentForm.name}
                      onChange={(e) => setSubComponentForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Chrome Finial"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={subComponentForm.category} 
                      onValueChange={(value) => setSubComponentForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {subComponentCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="subPrice">Price</Label>
                    <Input
                      id="subPrice"
                      type="number"
                      step="0.01"
                      value={subComponentForm.price}
                      onChange={(e) => setSubComponentForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select 
                      value={subComponentForm.unit} 
                      onValueChange={(value) => setSubComponentForm(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="each">Each</SelectItem>
                        <SelectItem value="per-meter">Per Meter</SelectItem>
                        <SelectItem value="per-yard">Per Yard</SelectItem>
                        <SelectItem value="set">Set</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={subComponentForm.required}
                      onCheckedChange={(checked) => setSubComponentForm(prev => ({ ...prev, required: checked }))}
                    />
                    <Label>Required</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="options">Options (comma separated)</Label>
                  <Input
                    id="options"
                    value={subComponentForm.options}
                    onChange={(e) => setSubComponentForm(prev => ({ ...prev, options: e.target.value }))}
                    placeholder="e.g., Chrome, Bronze, Black, White"
                  />
                </div>

                <Button onClick={addSubComponent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sub-Component
                </Button>
              </CardContent>
            </Card>

            {hardwareData.subComponents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sub-Components ({hardwareData.subComponents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {hardwareData.subComponents.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sub.name}</span>
                            <Badge variant="outline">{sub.category}</Badge>
                            {sub.required && <Badge variant="destructive">Required</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ${sub.price} {sub.unit}
                            {sub.options && ` • Options: ${sub.options.join(', ')}`}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeSubComponent(sub.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="specifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      placeholder="e.g., Aluminum, Steel, Brass"
                    />
                  </div>
                  <div>
                    <Label htmlFor="finish">Finish</Label>
                    <Input
                      id="finish"
                      placeholder="e.g., Chrome, Bronze, White"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxLoad">Max Load Capacity</Label>
                    <Input
                      id="maxLoad"
                      placeholder="e.g., 50kg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="warranty">Warranty Period</Label>
                    <Input
                      id="warranty"
                      placeholder="e.g., 5 years, Lifetime"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="installation">Installation Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select installation method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wall-mount">Wall Mount</SelectItem>
                      <SelectItem value="ceiling-mount">Ceiling Mount</SelectItem>
                      <SelectItem value="face-fix">Face Fix</SelectItem>
                      <SelectItem value="top-fix">Top Fix</SelectItem>
                      <SelectItem value="recess-mount">Recess Mount</SelectItem>
                    </SelectContent>
                  </Select>
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
          <Button onClick={handleSave} className="bg-slate-600 hover:bg-slate-700">
            Save Hardware Component
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
