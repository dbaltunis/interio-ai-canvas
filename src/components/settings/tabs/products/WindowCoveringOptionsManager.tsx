
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WindowCovering {
  id: string;
  name: string;
}

interface OptionCategory {
  id: string;
  name: string;
  description?: string;
  is_required: boolean;
  subcategories: OptionSubcategory[];
}

interface OptionSubcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  pricing_method: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage';
  base_price: number;
  fullness_ratio?: number;
  extra_fabric_percentage?: number;
  sort_order: number;
}

interface WindowCoveringOption {
  id: string;
  window_covering_id: string;
  option_type: string;
  name: string;
  description?: string;
  cost_type: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage';
  base_cost: number;
  is_required: boolean;
  is_default: boolean;
  sort_order: number;
  specifications?: any;
}

interface WindowCoveringOptionsManagerProps {
  windowCovering: WindowCovering;
  onBack: () => void;
}

export const WindowCoveringOptionsManager = ({ windowCovering, onBack }: WindowCoveringOptionsManagerProps) => {
  const { toast } = useToast();
  const [options, setOptions] = useState<WindowCoveringOption[]>([]);
  const [availableCategories, setAvailableCategories] = useState<OptionCategory[]>([]);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);

  // Mock data for available categories - replace with actual data fetching
  useEffect(() => {
    const mockCategories: OptionCategory[] = [
      {
        id: "1",
        name: "Heading",
        description: "Top treatment options",
        is_required: true,
        subcategories: [
          {
            id: "1",
            category_id: "1",
            name: "Pinch Pleat",
            description: "Traditional pinch pleat heading",
            pricing_method: "per-meter",
            base_price: 8.50,
            sort_order: 0
          },
          {
            id: "2",
            category_id: "1",
            name: "Eyelet",
            description: "Modern eyelet heading",
            pricing_method: "per-meter",
            base_price: 6.00,
            sort_order: 1
          }
        ]
      },
      {
        id: "2",
        name: "Lining",
        description: "Lining options",
        is_required: false,
        subcategories: [
          {
            id: "3",
            category_id: "2",
            name: "Standard Lining",
            description: "Basic cotton lining",
            pricing_method: "per-sqm",
            base_price: 4.50,
            sort_order: 0
          },
          {
            id: "4",
            category_id: "2",
            name: "Blackout Lining",
            description: "Complete light blocking",
            pricing_method: "per-sqm",
            base_price: 12.00,
            sort_order: 1
          }
        ]
      }
    ];
    setAvailableCategories(mockCategories);

    // Mock existing options for this window covering
    const mockOptions: WindowCoveringOption[] = [
      {
        id: "opt1",
        window_covering_id: windowCovering.id,
        option_type: "heading",
        name: "Pinch Pleat",
        description: "Traditional pinch pleat heading",
        cost_type: "per-meter",
        base_cost: 8.50,
        is_required: true,
        is_default: true,
        sort_order: 0
      }
    ];
    setOptions(mockOptions);
  }, [windowCovering.id]);

  const getAvailableSubcategories = () => {
    if (!selectedCategoryId) return [];
    const category = availableCategories.find(cat => cat.id === selectedCategoryId);
    return category?.subcategories || [];
  };

  const handleAddOption = () => {
    if (!selectedCategoryId || !selectedSubcategoryId) {
      toast({
        title: "Error",
        description: "Please select a category and subcategory",
        variant: "destructive"
      });
      return;
    }

    const category = availableCategories.find(cat => cat.id === selectedCategoryId);
    const subcategory = category?.subcategories.find(sub => sub.id === selectedSubcategoryId);
    
    if (!category || !subcategory) return;

    const newOption: WindowCoveringOption = {
      id: Date.now().toString(),
      window_covering_id: windowCovering.id,
      option_type: category.name.toLowerCase(),
      name: subcategory.name,
      description: subcategory.description,
      cost_type: subcategory.pricing_method,
      base_cost: subcategory.base_price,
      is_required: category.is_required,
      is_default: false,
      sort_order: options.length,
      specifications: {
        fullness_ratio: subcategory.fullness_ratio,
        extra_fabric_percentage: subcategory.extra_fabric_percentage
      }
    };

    setOptions(prev => [...prev, newOption]);
    setIsAddingOption(false);
    setSelectedCategoryId('');
    setSelectedSubcategoryId('');
    
    toast({
      title: "Success",
      description: "Option added successfully"
    });
  };

  const handleToggleDefault = (optionId: string) => {
    setOptions(prev => prev.map(opt => 
      opt.id === optionId ? { ...opt, is_default: !opt.is_default } : opt
    ));
  };

  const handleToggleRequired = (optionId: string) => {
    setOptions(prev => prev.map(opt => 
      opt.id === optionId ? { ...opt, is_required: !opt.is_required } : opt
    ));
  };

  const handleDeleteOption = (optionId: string) => {
    setOptions(prev => prev.filter(opt => opt.id !== optionId));
    toast({
      title: "Success",
      description: "Option removed successfully"
    });
  };

  const handleSave = () => {
    // Here you would save the options to the database
    toast({
      title: "Success",
      description: "Options saved successfully"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">
            Manage Options - {windowCovering.name}
          </h3>
          <p className="text-sm text-brand-neutral">
            Configure available options for this window covering
          </p>
        </div>
      </div>

      {/* Add Option Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add New Option</CardTitle>
              <CardDescription>Select from available option categories</CardDescription>
            </div>
            <Button
              onClick={() => setIsAddingOption(!isAddingOption)}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
        </CardHeader>
        {isAddingOption && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Option Category</Label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={(value) => {
                    setSelectedCategoryId(value);
                    setSelectedSubcategoryId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} {category.is_required && "(Required)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subcategory</Label>
                <Select
                  value={selectedSubcategoryId}
                  onValueChange={setSelectedSubcategoryId}
                  disabled={!selectedCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSubcategories().map(subcategory => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name} - £{subcategory.base_price} ({subcategory.pricing_method})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddOption}>Add Option</Button>
              <Button variant="outline" onClick={() => setIsAddingOption(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Current Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Options</CardTitle>
              <CardDescription>
                {options.length} option{options.length !== 1 ? 's' : ''} configured
              </CardDescription>
            </div>
            <Button onClick={handleSave} className="bg-brand-primary hover:bg-brand-accent">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {options.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No options configured yet. Add some options to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {options.map((option) => (
                <div key={option.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{option.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {option.option_type}
                        </Badge>
                      </div>
                      {option.description && (
                        <p className="text-sm text-brand-neutral mb-2">{option.description}</p>
                      )}
                      <div className="flex gap-2 text-sm">
                        <Badge variant="outline">
                          £{option.base_cost} {option.cost_type}
                        </Badge>
                        {option.is_required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        {option.is_default && (
                          <Badge variant="default" className="text-xs">Default</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDeleteOption(option.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`required-${option.id}`}
                        checked={option.is_required}
                        onCheckedChange={() => handleToggleRequired(option.id)}
                      />
                      <Label htmlFor={`required-${option.id}`} className="text-sm">Required</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`default-${option.id}`}
                        checked={option.is_default}
                        onCheckedChange={() => handleToggleDefault(option.id)}
                      />
                      <Label htmlFor={`default-${option.id}`} className="text-sm">Default Selection</Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
