import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Download, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMakingCosts } from "@/hooks/useMakingCosts";

interface WindowCovering {
  id: string;
  name: string;
  description?: string;
  margin_percentage: number;
  fabrication_pricing_method?: 'per-panel' | 'per-drop' | 'per-meter' | 'per-yard' | 'pricing-grid';
  image_url?: string;
  active: boolean;
  pricing_grid_data?: string;
  unit_price?: number;
  making_cost_id?: string;
}

interface WindowCoveringFormProps {
  windowCovering?: WindowCovering;
  onSave: (windowCovering: WindowCovering) => void;
  onCancel: () => void;
  isEditing: boolean;
}

interface FormData {
  name: string;
  description: string;
  margin_percentage: number;
  fabrication_pricing_method: 'per-panel' | 'per-drop' | 'per-meter' | 'per-yard' | 'pricing-grid';
  image_url: string;
  active: boolean;
  pricing_grid_data: string;
  unit_price: number;
  making_cost_id: string;
}

export const WindowCoveringForm = ({ windowCovering, onSave, onCancel, isEditing }: WindowCoveringFormProps) => {
  const { toast } = useToast();
  const { makingCosts } = useMakingCosts();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    margin_percentage: 40.0,
    fabrication_pricing_method: 'per-panel',
    image_url: '',
    active: true,
    pricing_grid_data: '',
    unit_price: 0,
    making_cost_id: ''
  });

  useEffect(() => {
    if (windowCovering) {
      setFormData({
        name: windowCovering.name,
        description: windowCovering.description || '',
        margin_percentage: windowCovering.margin_percentage,
        fabrication_pricing_method: windowCovering.fabrication_pricing_method || 'per-panel',
        image_url: windowCovering.image_url || '',
        active: windowCovering.active,
        pricing_grid_data: windowCovering.pricing_grid_data || '',
        unit_price: windowCovering.unit_price || 0,
        making_cost_id: windowCovering.making_cost_id || ''
      });
      if (windowCovering.image_url) {
        setImagePreview(windowCovering.image_url);
      }
    }
  }, [windowCovering]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCsvSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: "Error",
          description: "Please select a CSV file",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, pricing_grid_data: result }));
        toast({
          title: "Success",
          description: "CSV file uploaded successfully"
        });
      };
      reader.readAsText(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleRemoveCsv = () => {
    setSelectedCsvFile(null);
    setFormData(prev => ({ ...prev, pricing_grid_data: '' }));
  };

  const downloadCsvTemplate = () => {
    const csvContent = `Drop/Width,100,200,300,400,500,600,700,800,900,1000,1100,1200,1300,1400,1500
100,23,46,69,92,115,138,161,184,207,230,253,276,299,322,345
200,46,92,138,184,230,276,322,368,414,460,506,552,598,644,690
300,69,138,207,276,345,414,483,552,621,690,759,828,897,966,1035
400,92,184,276,368,460,552,644,736,828,920,1012,1104,1196,1288,1380
500,115,230,345,460,575,690,805,920,1035,1150,1265,1380,1495,1610,1725
600,138,276,414,552,690,828,966,1104,1242,1380,1518,1656,1794,1932,2070
700,161,322,483,644,805,966,1127,1288,1449,1610,1771,1932,2093,2254,2415
800,184,368,552,736,920,1104,1288,1472,1656,1840,2024,2208,2392,2576,2760
900,207,414,621,828,1035,1242,1449,1656,1863,2070,2277,2484,2691,2898,3105
1000,230,460,690,920,1150,1380,1610,1840,2070,2300,2530,2760,2990,3220,3450`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing_grid_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Window covering name is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.fabrication_pricing_method === 'pricing-grid' && !formData.pricing_grid_data) {
      toast({
        title: "Error",
        description: "Please upload a pricing grid CSV file",
        variant: "destructive"
      });
      return;
    }

    if (formData.fabrication_pricing_method !== 'pricing-grid' && !formData.unit_price) {
      toast({
        title: "Error",
        description: "Please enter a unit price",
        variant: "destructive"
      });
      return;
    }

    // Don't set an ID when creating, let the database generate it
    const newWindowCovering: WindowCovering = {
      id: windowCovering?.id || '', // Only use existing ID for updates
      name: formData.name,
      description: formData.description || undefined,
      margin_percentage: formData.margin_percentage,
      fabrication_pricing_method: formData.fabrication_pricing_method,
      image_url: formData.image_url || undefined,
      active: formData.active,
      pricing_grid_data: formData.pricing_grid_data || undefined,
      unit_price: formData.unit_price,
      making_cost_id: formData.making_cost_id || undefined
    };

    onSave(newWindowCovering);
  };

  const getPricingMethodDescription = () => {
    switch (formData.fabrication_pricing_method) {
      case 'per-panel':
        return 'Price per panel. The system will calculate the number of panels needed based on track width, fabric width, fullness ratio, and panel split configuration.';
      case 'per-drop':
        return 'Price per drop/length of fabric required.';
      case 'per-meter':
        return 'Price per linear meter of fabric or track length.';
      case 'per-yard':
        return 'Price per linear yard of fabric or track length.';
      case 'pricing-grid':
        return 'Uses a CSV pricing grid where prices are determined by width and drop combinations.';
      default:
        return 'Select a pricing method above.';
    }
  };

  const getMarginDescription = () => {
    switch (formData.fabrication_pricing_method) {
      case 'per-panel':
        return 'Margin will be applied to the calculated cost per panel';
      case 'per-drop':
        return 'Margin will be applied to the calculated cost per drop';
      case 'per-meter':
        return 'Margin will be applied to the calculated cost per meter';
      case 'per-yard':
        return 'Margin will be applied to the calculated cost per yard';
      case 'pricing-grid':
        return 'Margin will be applied to all prices in the uploaded CSV grid';
      default:
        return 'Margin will be applied to the calculated cost';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Window Covering' : 'Create New Window Covering'}</CardTitle>
        <CardDescription>Configure the window covering specifications and pricing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="name">Treatment Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Roman Blind, Curtains, Roller Blind"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description of the window covering..."
            rows={3}
          />
        </div>

        {/* Image Upload */}
        <div>
          <Label>Treatment Image</Label>
          <div className="mt-2">
            {imagePreview ? (
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Window covering preview" 
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemoveImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-brand-primary transition-colors">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload treatment image</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <Label 
                  htmlFor="image-upload" 
                  className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Choose File
                </Label>
              </div>
            )}
          </div>
        </div>

        {/* Making Cost Configuration */}
        <div>
          <Label>Making Cost Configuration (Optional)</Label>
          <Select
            value={formData.making_cost_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, making_cost_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a making cost configuration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No making cost configuration</SelectItem>
              {makingCosts.map((cost) => (
                <SelectItem key={cost.id} value={cost.id}>
                  {cost.name} - {cost.pricing_method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-600 mt-1">
            Link this window covering to a making cost configuration for bundled options and automated calculations.
          </p>
        </div>

        <div>
          <Label>Pricing Method</Label>
          <Select
            value={formData.fabrication_pricing_method}
            onValueChange={(value: 'per-panel' | 'per-drop' | 'per-meter' | 'per-yard' | 'pricing-grid') => 
              setFormData(prev => ({ ...prev, fabrication_pricing_method: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="per-panel">Per Panel</SelectItem>
              <SelectItem value="per-drop">Per Drop</SelectItem>
              <SelectItem value="per-meter">Per Linear Meter</SelectItem>
              <SelectItem value="per-yard">Per Linear Yard</SelectItem>
              <SelectItem value="pricing-grid">Pricing Grid (CSV Upload)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-600 mt-1">{getPricingMethodDescription()}</p>
        </div>

        {/* Unit Price for non-grid pricing methods */}
        {formData.fabrication_pricing_method !== 'pricing-grid' && (
          <div>
            <Label htmlFor="unit_price">
              Unit Price (£) *
              <span className="text-sm font-normal text-gray-600 ml-2">
                {formData.fabrication_pricing_method === 'per-panel' && '(per panel)'}
                {formData.fabrication_pricing_method === 'per-drop' && '(per drop)'}
                {formData.fabrication_pricing_method === 'per-meter' && '(per meter)'}
                {formData.fabrication_pricing_method === 'per-yard' && '(per yard)'}
              </span>
            </Label>
            <Input
              id="unit_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.unit_price}
              onChange={(e) => setFormData(prev => ({ ...prev, unit_price: Number(e.target.value) }))}
              placeholder="0.00"
            />
          </div>
        )}

        {/* CSV Upload for Pricing Grid */}
        {formData.fabrication_pricing_method === 'pricing-grid' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Pricing Grid (CSV File) *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadCsvTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>
              
              {selectedCsvFile ? (
                <div className="flex items-center justify-between p-3 border border-green-300 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-green-700">{selectedCsvFile.name}</span>
                    <span className="text-xs text-green-600">({(selectedCsvFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveCsv}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-brand-primary transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload pricing grid CSV file</p>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvSelect}
                    className="hidden"
                    id="csv-upload"
                  />
                  <Label 
                    htmlFor="csv-upload" 
                    className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Choose CSV File
                  </Label>
                </div>
              )}
              
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 font-medium mb-1">CSV File Format:</p>
                <p className="text-xs text-blue-600">
                  First row should contain width values (100, 200, 300, etc.)
                  <br />
                  First column should contain drop/height values (100, 200, 300, etc.)
                  <br />
                  Each cell should contain the corresponding base price for that width/drop combination
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profit Margin Section */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="margin_percentage">Profit Margin (%)</Label>
            <Input
              id="margin_percentage"
              type="number"
              step="0.1"
              min="0"
              max="200"
              value={formData.margin_percentage}
              onChange={(e) => setFormData(prev => ({ ...prev, margin_percentage: Number(e.target.value) }))}
              placeholder="40.0"
            />
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">How this works:</p>
              <p className="text-amber-700">
                {getMarginDescription()}. For example, if the base cost is £100 and you set a 40% margin, 
                the final selling price will be £140.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
          />
          <Label htmlFor="active">Active</Label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="bg-brand-primary hover:bg-brand-accent">
            {isEditing ? 'Update Window Covering' : 'Create Window Covering'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
