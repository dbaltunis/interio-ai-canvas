
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Download } from "lucide-react";
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
  onSave: (windowCovering: Omit<WindowCovering, 'id' | 'optionsCount'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const WindowCoveringForm = ({ windowCovering, onSave, onCancel, isEditing }: WindowCoveringFormProps) => {
  const { toast } = useToast();
  const { makingCosts, isLoading: makingCostsLoading } = useMakingCosts();
  
  const [formData, setFormData] = useState({
    name: windowCovering?.name || '',
    description: windowCovering?.description || '',
    margin_percentage: windowCovering?.margin_percentage || 40,
    fabrication_pricing_method: windowCovering?.fabrication_pricing_method || 'per-panel' as const,
    image_url: windowCovering?.image_url || '',
    active: windowCovering?.active !== undefined ? windowCovering.active : true,
    pricing_grid_data: windowCovering?.pricing_grid_data || '',
    unit_price: windowCovering?.unit_price || 0,
    making_cost_id: windowCovering?.making_cost_id || ''
  });

  const [imagePreview, setImagePreview] = useState(windowCovering?.image_url || '');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, pricing_grid_data: result }));
      };
      reader.readAsText(file);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Width/Drop,100,200,300,400,500
100,50,100,150,200,250
200,100,200,300,400,500
300,150,300,450,600,750`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    if (formData.fabrication_pricing_method === 'pricing-grid' && !formData.pricing_grid_data) {
      toast({ title: "Error", description: "CSV file required for pricing grid", variant: "destructive" });
      return;
    }

    if (formData.fabrication_pricing_method !== 'pricing-grid' && !formData.unit_price) {
      toast({ title: "Error", description: "Unit price is required", variant: "destructive" });
      return;
    }

    onSave({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      margin_percentage: formData.margin_percentage,
      fabrication_pricing_method: formData.fabrication_pricing_method,
      image_url: formData.image_url || undefined,
      active: formData.active,
      pricing_grid_data: formData.pricing_grid_data || undefined,
      unit_price: formData.unit_price,
      making_cost_id: formData.making_cost_id === "no-making-cost" ? undefined : formData.making_cost_id || undefined
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit' : 'Create'} Window Covering</CardTitle>
        <CardDescription>Configure your window covering product</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Roman Blind"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              rows={2}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <Label>Image</Label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded border" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={() => {
                  setImagePreview('');
                  setFormData(prev => ({ ...prev, image_url: '' }));
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded p-4 text-center">
              <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Label htmlFor="image-upload" className="cursor-pointer text-sm text-blue-600">
                Choose Image
              </Label>
            </div>
          )}
        </div>

        {/* Making Cost */}
        <div>
          <Label>Making Cost Configuration</Label>
          <Select
            value={formData.making_cost_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, making_cost_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select making cost (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-making-cost">No making cost</SelectItem>
              {makingCosts?.map((cost) => (
                <SelectItem key={cost.id} value={cost.id}>
                  {cost.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pricing Method */}
        <div className="grid grid-cols-2 gap-4">
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
                <SelectItem value="per-meter">Per Meter</SelectItem>
                <SelectItem value="per-yard">Per Yard</SelectItem>
                <SelectItem value="pricing-grid">Pricing Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Margin %</Label>
            <Input
              type="number"
              value={formData.margin_percentage}
              onChange={(e) => setFormData(prev => ({ ...prev, margin_percentage: Number(e.target.value) || 40 }))}
              min="0"
              max="200"
            />
          </div>
        </div>

        {/* Unit Price or CSV Upload */}
        {formData.fabrication_pricing_method === 'pricing-grid' ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Pricing Grid CSV *</Label>
              <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-1" />
                Template
              </Button>
            </div>
            {csvFile ? (
              <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                <span className="text-sm text-green-700">{csvFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCsvFile(null);
                    setFormData(prev => ({ ...prev, pricing_grid_data: '' }));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded p-4 text-center">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <Label htmlFor="csv-upload" className="cursor-pointer text-sm text-blue-600">
                  Upload CSV File
                </Label>
              </div>
            )}
          </div>
        ) : (
          <div>
            <Label>Unit Price £ *</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.unit_price}
              onChange={(e) => setFormData(prev => ({ ...prev, unit_price: Number(e.target.value) || 0 }))}
              placeholder="0.00"
            />
          </div>
        )}

        {/* Active Switch */}
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
          />
          <Label htmlFor="active">Active</Label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave}>
            {isEditing ? 'Update' : 'Create'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
