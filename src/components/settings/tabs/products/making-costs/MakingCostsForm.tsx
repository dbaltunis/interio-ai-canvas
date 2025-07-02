import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMakingCosts, type MakingCostOption } from "@/hooks/useMakingCosts";

interface MakingCostsFormProps {
  initialData?: any;
  onSave: () => void;
  onCancel: () => void;
}

export const MakingCostsForm = ({ initialData, onSave, onCancel }: MakingCostsFormProps) => {
  const { createMakingCost, updateMakingCost } = useMakingCosts();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    pricing_method: initialData?.pricing_method || 'per-linear-meter',
    include_fabric_selection: initialData?.include_fabric_selection ?? true,
    measurement_type: initialData?.measurement_type || 'fabric-drop-required',
    description: initialData?.description || '',
    active: initialData?.active ?? true,
    heading_options: initialData?.heading_options || [],
    hardware_options: initialData?.hardware_options || [],
    lining_options: initialData?.lining_options || [],
    drop_ranges: initialData?.drop_ranges || []
  });

  const [newHeadingOption, setNewHeadingOption] = useState<Partial<MakingCostOption>>({
    name: '',
    pricing_method: 'per-item',
    base_price: 0,
    fullness: 2.5,
    sort_order: 0
  });

  const [newHardwareOption, setNewHardwareOption] = useState<Partial<MakingCostOption>>({
    name: '',
    pricing_method: 'per-item',
    base_price: 0,
    sort_order: 0
  });

  const [newDropRange, setNewDropRange] = useState({
    min: 0,
    max: 250,
    price: 0
  });

  const addHeadingOption = () => {
    if (newHeadingOption.name && newHeadingOption.base_price !== undefined) {
      setFormData(prev => ({
        ...prev,
        heading_options: [...prev.heading_options, { ...newHeadingOption, sort_order: prev.heading_options.length }]
      }));
      setNewHeadingOption({
        name: '',
        pricing_method: 'per-item',
        base_price: 0,
        fullness: 2.5,
        sort_order: 0
      });
    }
  };

  const addHardwareOption = () => {
    if (newHardwareOption.name && newHardwareOption.base_price !== undefined) {
      setFormData(prev => ({
        ...prev,
        hardware_options: [...prev.hardware_options, { ...newHardwareOption, sort_order: prev.hardware_options.length }]
      }));
      setNewHardwareOption({
        name: '',
        pricing_method: 'per-item',
        base_price: 0,
        sort_order: 0
      });
    }
  };

  const addDropRange = () => {
    if (newDropRange.price > 0) {
      setFormData(prev => ({
        ...prev,
        drop_ranges: [...prev.drop_ranges, newDropRange]
      }));
      setNewDropRange({
        min: newDropRange.max + 1,
        max: newDropRange.max + 250,
        price: 0
      });
    }
  };

  const removeHeadingOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      heading_options: prev.heading_options.filter((_, i) => i !== index)
    }));
  };

  const removeHardwareOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hardware_options: prev.hardware_options.filter((_, i) => i !== index)
    }));
  };

  const removeDropRange = (index: number) => {
    setFormData(prev => ({
      ...prev,
      drop_ranges: prev.drop_ranges.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (initialData) {
        await updateMakingCost(initialData.id, formData);
      } else {
        await createMakingCost(formData);
      }
      onSave();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Basic Configuration
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Set up the basic pricing and measurement configuration for this window covering type</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Configuration Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Standard Pleated Curtains"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="pricing_method">Pricing Method</Label>
                <Select
                  value={formData.pricing_method}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, pricing_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-linear-meter">Per running linear meter</SelectItem>
                    <SelectItem value="per-linear-yard">Per running linear yard</SelectItem>
                    <SelectItem value="per-sqm">Per square meter</SelectItem>
                    <SelectItem value="per-panel">Per panel</SelectItem>
                    <SelectItem value="per-drop">Per drop</SelectItem>
                    <SelectItem value="fixed">Fixed price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="measurement_type">Measurement to use for drops</Label>
                <Select
                  value={formData.measurement_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, measurement_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fabric-drop-required">Fabric drop required</SelectItem>
                    <SelectItem value="finished-drop">Finished drop</SelectItem>
                    <SelectItem value="total-drop">Total drop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="include_fabric_selection"
                  checked={formData.include_fabric_selection}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, include_fabric_selection: checked }))}
                />
                <Label htmlFor="include_fabric_selection">Include fabric selection</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Heading Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Choose headrail/heading
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add different heading styles with individual pricing and fullness ratios</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing heading options */}
            <div className="space-y-2">
              {formData.heading_options.map((option: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{option.name}</Badge>
                    <span className="text-sm text-gray-600">
                      {option.fullness}x fullness • ${option.base_price} {option.pricing_method}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHeadingOption(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add new heading option */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 p-4 border border-dashed border-gray-300 rounded-lg">
              <Input
                placeholder="Option name"
                value={newHeadingOption.name}
                onChange={(e) => setNewHeadingOption(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                type="number"
                step="0.1"
                placeholder="Fullness"
                value={newHeadingOption.fullness}
                onChange={(e) => setNewHeadingOption(prev => ({ ...prev, fullness: parseFloat(e.target.value) }))}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                value={newHeadingOption.base_price}
                onChange={(e) => setNewHeadingOption(prev => ({ ...prev, base_price: parseFloat(e.target.value) }))}
              />
              <Select
                value={newHeadingOption.pricing_method}
                onValueChange={(value) => setNewHeadingOption(prev => ({ ...prev, pricing_method: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per-item">Per Item</SelectItem>
                  <SelectItem value="per-meter">Per Meter</SelectItem>
                  <SelectItem value="per-yard">Per Yard</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={addHeadingOption}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hardware Options */}
        <Card>
          <CardHeader>
            <CardTitle>Hardware</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing hardware options */}
            <div className="space-y-2">
              {formData.hardware_options.map((option: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{option.name}</Badge>
                    <span className="text-sm text-gray-600">
                      ${option.base_price} {option.pricing_method}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHardwareOption(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add new hardware option */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-4 border border-dashed border-gray-300 rounded-lg">
              <Input
                placeholder="Hardware name"
                value={newHardwareOption.name}
                onChange={(e) => setNewHardwareOption(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                value={newHardwareOption.base_price}
                onChange={(e) => setNewHardwareOption(prev => ({ ...prev, base_price: parseFloat(e.target.value) }))}
              />
              <Select
                value={newHardwareOption.pricing_method}
                onValueChange={(value) => setNewHardwareOption(prev => ({ ...prev, pricing_method: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per-item">Per Item</SelectItem>
                  <SelectItem value="per-meter">Per Meter</SelectItem>
                  <SelectItem value="per-yard">Per Yard</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={addHardwareOption}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Drop Ranges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Drop range in cm
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Set tiered pricing based on curtain drop ranges</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing drop ranges */}
            <div className="space-y-2">
              {formData.drop_ranges.map((range: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">
                    {range.min}cm - {range.max}cm: ${range.price}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDropRange(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add new drop range */}
            <div className="grid grid-cols-4 gap-2 p-4 border border-dashed border-gray-300 rounded-lg">
              <Input
                type="number"
                placeholder="Min (cm)"
                value={newDropRange.min}
                onChange={(e) => setNewDropRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
              />
              <Input
                type="number"
                placeholder="Max (cm)"
                value={newDropRange.max}
                onChange={(e) => setNewDropRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Price ($)"
                value={newDropRange.price}
                onChange={(e) => setNewDropRange(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              />
              <Button type="button" onClick={addDropRange}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {initialData ? 'Update' : 'Create'} Configuration
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
};
