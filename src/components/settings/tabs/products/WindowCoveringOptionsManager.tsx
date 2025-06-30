
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ArrowLeft, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WindowCovering {
  id: string;
  name: string;
}

interface WindowCoveringOption {
  id: string;
  option_type: string;
  name: string;
  description?: string;
  cost_type: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed';
  base_cost: number;
  is_required: boolean;
  is_default: boolean;
  sort_order: number;
  specifications: Record<string, any>;
}

interface WindowCoveringOptionsManagerProps {
  windowCovering: WindowCovering;
  onBack: () => void;
}

interface FormData {
  option_type: string;
  name: string;
  description: string;
  cost_type: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed';
  base_cost: number;
  is_required: boolean;
  is_default: boolean;
  specifications: Record<string, any>;
}

export const WindowCoveringOptionsManager = ({ windowCovering, onBack }: WindowCoveringOptionsManagerProps) => {
  const { toast } = useToast();
  const [options, setOptions] = useState<WindowCoveringOption[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    option_type: '',
    name: '',
    description: '',
    cost_type: 'per-unit',
    base_cost: 0,
    is_required: false,
    is_default: false,
    specifications: {}
  });

  const optionTypes = [
    'heading',
    'border',
    'track',
    'rod',
    'hem',
    'fold',
    'lining',
    'trim',
    'hardware',
    'mechanism',
    'other'
  ];

  const resetForm = () => {
    setFormData({
      option_type: '',
      name: '',
      description: '',
      cost_type: 'per-unit',
      base_cost: 0,
      is_required: false,
      is_default: false,
      specifications: {}
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.option_type) {
      toast({
        title: "Error",
        description: "Option name and type are required",
        variant: "destructive"
      });
      return;
    }

    const newOption: WindowCoveringOption = {
      id: editingId || Date.now().toString(),
      option_type: formData.option_type,
      name: formData.name,
      description: formData.description || undefined,
      cost_type: formData.cost_type,
      base_cost: formData.base_cost,
      is_required: formData.is_required,
      is_default: formData.is_default,
      sort_order: options.length,
      specifications: formData.specifications
    };

    if (editingId) {
      setOptions(prev => prev.map(o => o.id === editingId ? newOption : o));
      toast({
        title: "Success",
        description: "Option updated successfully"
      });
    } else {
      setOptions(prev => [...prev, newOption]);
      toast({
        title: "Success",
        description: "Option created successfully"
      });
    }

    resetForm();
  };

  const handleEdit = (option: WindowCoveringOption) => {
    setFormData({
      option_type: option.option_type,
      name: option.name,
      description: option.description || '',
      cost_type: option.cost_type,
      base_cost: option.base_cost,
      is_required: option.is_required,
      is_default: option.is_default,
      specifications: option.specifications
    });
    setEditingId(option.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    setOptions(prev => prev.filter(o => o.id !== id));
    toast({
      title: "Success",
      description: "Option deleted successfully"
    });
  };

  const groupedOptions = options.reduce((acc, option) => {
    if (!acc[option.option_type]) {
      acc[option.option_type] = [];
    }
    acc[option.option_type].push(option);
    return acc;
  }, {} as Record<string, WindowCoveringOption[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h3 className="text-lg font-semibold text-brand-primary">Options for {windowCovering.name}</h3>
            <p className="text-sm text-brand-neutral">Manage available options for this window covering</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-brand-primary hover:bg-brand-accent"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      </div>

      {/* Options by Type */}
      <div className="space-y-4">
        {Object.entries(groupedOptions).map(([type, typeOptions]) => (
          <Card key={type}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base capitalize">{type} Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {typeOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {option.cost_type}: £{option.base_cost}
                      </Badge>
                      {option.is_required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      {option.is_default && <Badge variant="default" className="text-xs">Default</Badge>}
                    </div>
                    {option.description && (
                      <p className="text-sm text-brand-neutral mt-1">{option.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(option)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(option.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Option' : 'Create New Option'}</CardTitle>
            <CardDescription>Configure the option specifications and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Option Type *</Label>
                <Select
                  value={formData.option_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, option_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option type" />
                  </SelectTrigger>
                  <SelectContent>
                    {optionTypes.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="optionName">Name *</Label>
                <Input
                  id="optionName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Pinch Pleat, Chrome Track"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="optionDescription">Description</Label>
              <Textarea
                id="optionDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description of this option..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cost Type</Label>
                <Select
                  value={formData.cost_type}
                  onValueChange={(value: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed') => 
                    setFormData(prev => ({ ...prev, cost_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-unit">Per Unit</SelectItem>
                    <SelectItem value="per-meter">Per Meter</SelectItem>
                    <SelectItem value="per-sqm">Per Square Meter</SelectItem>
                    <SelectItem value="fixed">Fixed Cost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="baseCost">Base Cost (£)</Label>
                <Input
                  id="baseCost"
                  type="number"
                  step="0.01"
                  value={formData.base_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_cost: Number(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={formData.is_required}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: checked }))}
                />
                <Label htmlFor="required">Required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                />
                <Label htmlFor="default">Default Selection</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="bg-brand-primary hover:bg-brand-accent">
                {editingId ? 'Update Option' : 'Create Option'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
