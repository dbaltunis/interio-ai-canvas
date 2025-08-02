import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, Info, Plus, Trash2, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CurtainTemplate, useCreateCurtainTemplate, useUpdateCurtainTemplate } from "@/hooks/useCurtainTemplates";
import { EyeletRingManager } from "./EyeletRingManager";
import { LiningTypeManager } from "./LiningTypeManager";
import { PricingGridUploader } from "./PricingGridUploader";
import { HardwareCompatibilityManager } from "./HardwareCompatibilityManager";
import { useHeadingInventory } from "@/hooks/useHeadingInventory";

interface CurtainTemplateFormProps {
  template?: CurtainTemplate;
  onClose: () => void;
}

export const CurtainTemplateForm = ({ template, onClose }: CurtainTemplateFormProps) => {
  const { toast } = useToast();
  const createTemplate = useCreateCurtainTemplate();
  const updateTemplate = useUpdateCurtainTemplate();
  const { data: headingStyles = [] } = useHeadingInventory();

  // State for eyelet ring library
  const [eyeletRings] = useState([
    { id: 1, name: "Standard Silver 25mm", color: "Silver", diameter: 25 },
    { id: 2, name: "Antique Brass 20mm", color: "Antique Brass", diameter: 20 },
    { id: 3, name: "Black Matt 30mm", color: "Black", diameter: 30 },
    { id: 4, name: "Chrome 25mm", color: "Chrome", diameter: 25 }
  ]);

  const [formData, setFormData] = useState({
    // Basic Information
    name: template?.name || "",
    description: template?.description || "",
    
    // Curtain Type
    curtain_type: template?.curtain_type || "single",
    
    // Selected Headings from Library
    selected_heading_ids: template?.selected_heading_ids || [],
    
    // Fabric Requirements (will use inventory)
    fabric_width_type: template?.fabric_width_type || "wide",
    vertical_repeat: template?.vertical_repeat?.toString() || "",
    horizontal_repeat: template?.horizontal_repeat?.toString() || "",
    fabric_direction: template?.fabric_direction || "standard",
    
    // Hem Allowances - Default + Editable
    bottom_hem: template?.bottom_hem?.toString() || "15",
    side_hems: template?.side_hems?.toString() || "7.5",
    seam_hems: template?.seam_hems?.toString() || "1.5",
    
    // Returns - Set in template, ON/OFF toggle in projects
    return_left: template?.return_left?.toString() || "7.5",
    return_right: template?.return_right?.toString() || "7.5",
    overlap: template?.overlap?.toString() || "10",
    header_allowance: template?.header_allowance?.toString() || "8",
    waste_percent: template?.waste_percent?.toString() || "5",
    is_railroadable: template?.is_railroadable || false,
    
    // Lining Selection - Pre-created with pricing
    lining_types: template?.lining_types || [
      { type: "Standard", price_per_metre: 15, labour_per_curtain: 25 },
      { type: "Blackout", price_per_metre: 22, labour_per_curtain: 35 },
      { type: "Thermal", price_per_metre: 28, labour_per_curtain: 40 },
      { type: "Interlining", price_per_metre: 18, labour_per_curtain: 45 }
    ],
    
    // Hardware - From inventory
    compatible_hardware: template?.compatible_hardware || [],
    
    // Make-Up Pricing with machine/hand conditions
    pricing_type: template?.pricing_type || "per_metre",
    offers_hand_finished: false,
    machine_price_per_metre: template?.unit_price?.toString() || "",
    hand_price_per_metre: "",
    machine_price_per_drop: "",
    hand_price_per_drop: "",
    machine_price_per_panel: "",
    hand_price_per_panel: "",
    average_drop_width: "140", // Default average drop width in cm
    // Height range pricing
    uses_height_pricing: false,
    height_price_ranges: template?.height_price_ranges || [
      { min_height: 1, max_height: 200, price: 24 }
    ],
    price_rules: template?.price_rules || [],
    pricing_grid_data: template?.pricing_grid_data || null,
    
    // Height-based drop pricing
    drop_height_ranges: template?.drop_height_ranges || [],
    machine_drop_height_prices: template?.machine_drop_height_prices || [],
    hand_drop_height_prices: template?.hand_drop_height_prices || []
  });

  const handleInputChange = (field: string, value: string | any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.selected_heading_ids.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one heading style must be selected",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save templates",
          variant: "destructive"
        });
        return;
      }

      const templateData = {
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        curtain_type: formData.curtain_type as 'single' | 'pair',
        selected_heading_ids: formData.selected_heading_ids,
        // Keep these for compatibility - now derived from selected headings
        heading_name: formData.selected_heading_ids.length > 0 ? 
          headingStyles.find(h => h.id === formData.selected_heading_ids[0])?.name || "" : "",
        fullness_ratio: formData.selected_heading_ids.length > 0 ? 
          headingStyles.find(h => h.id === formData.selected_heading_ids[0])?.fullness_ratio || 2.0 : 2.0,
        fabric_width_type: formData.fabric_width_type as 'wide' | 'narrow',
        vertical_repeat: formData.vertical_repeat ? parseFloat(formData.vertical_repeat.toString()) : undefined,
        horizontal_repeat: formData.horizontal_repeat ? parseFloat(formData.horizontal_repeat.toString()) : undefined,
        fabric_direction: formData.fabric_direction as 'standard' | 'railroaded',
        bottom_hem: parseFloat(formData.bottom_hem.toString()) || 15,
        side_hems: parseFloat(formData.side_hems.toString()) || 7.5,
        seam_hems: parseFloat(formData.seam_hems.toString()) || 1.5,
        lining_types: formData.lining_types,
        compatible_hardware: formData.compatible_hardware,
        pricing_type: formData.pricing_type as 'per_metre' | 'per_drop' | 'per_panel' | 'pricing_grid',
        offers_hand_finished: formData.offers_hand_finished,
        machine_price_per_metre: formData.machine_price_per_metre ? parseFloat(formData.machine_price_per_metre.toString()) : undefined,
        hand_price_per_metre: formData.hand_price_per_metre ? parseFloat(formData.hand_price_per_metre.toString()) : undefined,
        machine_price_per_drop: formData.machine_price_per_drop ? parseFloat(formData.machine_price_per_drop.toString()) : undefined,
        hand_price_per_drop: formData.hand_price_per_drop ? parseFloat(formData.hand_price_per_drop.toString()) : undefined,
        drop_height_ranges: formData.drop_height_ranges || undefined,
        machine_drop_height_prices: formData.machine_drop_height_prices || undefined,
        hand_drop_height_prices: formData.hand_drop_height_prices || undefined,
        machine_price_per_panel: formData.machine_price_per_panel ? parseFloat(formData.machine_price_per_panel.toString()) : undefined,
        hand_price_per_panel: formData.hand_price_per_panel ? parseFloat(formData.hand_price_per_panel.toString()) : undefined,
        average_drop_width: formData.average_drop_width ? parseFloat(formData.average_drop_width.toString()) : 140,
        uses_height_pricing: formData.uses_height_pricing,
        height_price_ranges: formData.height_price_ranges,
        price_rules: formData.price_rules,
        unit_price: formData.machine_price_per_metre ? parseFloat(formData.machine_price_per_metre.toString()) : undefined,
        pricing_grid_data: formData.pricing_grid_data || {},
        manufacturing_type: "machine" as 'machine' | 'hand', // Default to machine
        hand_finished_upcharge_fixed: undefined,
        hand_finished_upcharge_percentage: undefined,
        return_left: parseFloat(formData.return_left.toString()) || 7.5,
        return_right: parseFloat(formData.return_right.toString()) || 7.5,
        overlap: parseFloat(formData.overlap.toString()) || 10,
        header_allowance: parseFloat(formData.header_allowance.toString()) || 8,
        waste_percent: parseFloat(formData.waste_percent.toString()) || 5,
        is_railroadable: formData.is_railroadable,
        active: true
      };

      if (template) {
        await updateTemplate.mutateAsync({ id: template.id, ...templateData });
      } else {
        await createTemplate.mutateAsync(templateData);
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving curtain template:", error);
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <TooltipProvider>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="heading">Heading</TabsTrigger>
          <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <div className="max-h-[70vh] overflow-y-auto py-4">
          <TabsContent value="basic" className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
                <CardDescription>General template details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Wave Heading - Premium"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Each heading style should be a separate template</p>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief description of the template"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="curtain_type">Curtain Type</Label>
                  <Select value={formData.curtain_type} onValueChange={(value) => handleInputChange("curtain_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select curtain type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Curtain</SelectItem>
                      <SelectItem value="pair">Pair of Curtains</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heading" className="space-y-6">
            {/* Heading Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Available Heading Styles</CardTitle>
                <CardDescription>Select heading styles to include in this template</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {headingStyles.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No heading styles found. Create heading styles in the inventory section first.</p>
                  ) : (
                    headingStyles.map((heading) => (
                      <div key={heading.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={`heading-${heading.id}`}
                          checked={formData.selected_heading_ids.includes(heading.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange("selected_heading_ids", [...formData.selected_heading_ids, heading.id]);
                            } else {
                              handleInputChange("selected_heading_ids", formData.selected_heading_ids.filter(id => id !== heading.id));
                            }
                          }}
                        />
                        <div className="flex items-center gap-3 flex-1">
                          {(heading as any).image_url && (
                            <img 
                              src={(heading as any).image_url} 
                              alt={heading.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <Label htmlFor={`heading-${heading.id}`} className="font-medium cursor-pointer">
                              {heading.name}
                            </Label>
                            <div className="text-sm text-muted-foreground">
                              Fullness: {heading.fullness_ratio}x
                              {(heading as any).fullness_ratios && Array.isArray((heading as any).fullness_ratios) && 
                                ` (${(heading as any).fullness_ratios.length} options)`
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lining Configuration */}
            <LiningTypeManager 
              liningTypes={formData.lining_types}
              onLiningTypesChange={(types) => handleInputChange("lining_types", types)}
            />

          </TabsContent>

          <TabsContent value="manufacturing" className="space-y-6">
            {/* Manufacturing Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Manufacturing Configuration</CardTitle>
                <CardDescription>Customize fabric usage rules based on your manufacturing setup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Return & Overlap Allowance */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Returns & Overlap</h4>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Returns wrap to the wall. Overlap is for pairs only.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="return_left">Return Left (cm)</Label>
                      <Input
                        id="return_left"
                        type="number"
                        step="0.5"
                        value={formData.return_left}
                        onChange={(e) => handleInputChange("return_left", e.target.value)}
                        placeholder="7.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="return_right">Return Right (cm)</Label>
                      <Input
                        id="return_right"
                        type="number"
                        step="0.5"
                        value={formData.return_right}
                        onChange={(e) => handleInputChange("return_right", e.target.value)}
                        placeholder="7.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="overlap">Centre Overlap (cm)</Label>
                      <Input
                        id="overlap"
                        type="number"
                        step="0.5"
                        value={formData.overlap}
                        onChange={(e) => handleInputChange("overlap", e.target.value)}
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Hem Allowances */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Hem Allowances</h4>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Default values that can be overridden in projects if needed.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="header_allowance">Header Allowance (cm)</Label>
                      <Input
                        id="header_allowance"
                        type="number"
                        step="0.5"
                        value={formData.header_allowance}
                        onChange={(e) => handleInputChange("header_allowance", e.target.value)}
                        placeholder="8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bottom_hem">Bottom Hem (cm)</Label>
                      <Input
                        id="bottom_hem"
                        type="number"
                        step="0.5"
                        value={formData.bottom_hem}
                        onChange={(e) => handleInputChange("bottom_hem", e.target.value)}
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="side_hems">Side Hems (cm)</Label>
                      <Input
                        id="side_hems"
                        type="number"
                        step="0.5"
                        value={formData.side_hems}
                        onChange={(e) => handleInputChange("side_hems", e.target.value)}
                        placeholder="7.5"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Waste & Railroading */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Waste Allowance</h4>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Applied at the end to avoid cutting shortages.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div>
                      <Label htmlFor="waste_percent">Waste (%)</Label>
                      <Input
                        id="waste_percent"
                        type="number"
                        step="0.1"
                        value={formData.waste_percent}
                        onChange={(e) => handleInputChange("waste_percent", e.target.value)}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Railroading</h4>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Allow cutting from fabric width instead of length when possible.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_railroadable"
                        checked={formData.is_railroadable}
                        onCheckedChange={(checked) => handleInputChange("is_railroadable", checked)}
                      />
                      <Label htmlFor="is_railroadable">Allow railroading</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            {/* Make-Up Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Make-Up Pricing</CardTitle>
                <CardDescription>Configure pricing logic with machine/hand conditions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hand-finished toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="offers_hand_finished"
                    checked={formData.offers_hand_finished}
                    onCheckedChange={(checked) => handleInputChange("offers_hand_finished", checked)}
                  />
                  <Label htmlFor="offers_hand_finished">
                    Offer Hand-Finished Options
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enable this if your company offers both machine and hand-finished curtains</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Height-based pricing toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="uses_height_pricing"
                    checked={formData.uses_height_pricing}
                    onCheckedChange={(checked) => handleInputChange("uses_height_pricing", checked)}
                  />
                  <Label htmlFor="uses_height_pricing">
                    Use Height-Based Pricing
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Use different per-metre rates based on curtain height ranges</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Clear explanation of pricing logic */}
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <h5 className="font-medium text-xs text-blue-900 dark:text-blue-100">💡 How Height-Based Pricing Works</h5>
                  <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                    <strong>Without height pricing:</strong> Uses your standard per-metre rate for all curtain heights<br/>
                    <strong>With height pricing:</strong> Uses DIFFERENT per-metre rates based on curtain height ranges<br/>
                    <strong>Example:</strong> 1-200cm = £18/m, 201-250cm = £22/m, 251cm+ = £25/m
                  </p>
                </div>

                {/* Height range pricing configuration */}
                {formData.uses_height_pricing && (
                  <Card className="p-4">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle className="text-sm">Height Range Pricing Configuration</CardTitle>
                      <CardDescription className="text-xs">
                        Create different pricing tiers based on curtain height ranges (e.g., 1-200cm = $24, 201-250cm = $30)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                      {formData.height_price_ranges.map((range, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Label htmlFor={`min_height_${index}`}>Min Height (cm)</Label>
                            <Input
                              id={`min_height_${index}`}
                              type="number"
                              value={range.min_height}
                              onChange={(e) => {
                                const newRanges = [...formData.height_price_ranges];
                                newRanges[index].min_height = parseInt(e.target.value) || 0;
                                handleInputChange("height_price_ranges", newRanges);
                              }}
                              placeholder="1"
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={`max_height_${index}`}>Max Height (cm)</Label>
                            <Input
                              id={`max_height_${index}`}
                              type="number"
                              value={range.max_height}
                              onChange={(e) => {
                                const newRanges = [...formData.height_price_ranges];
                                newRanges[index].max_height = parseInt(e.target.value) || 0;
                                handleInputChange("height_price_ranges", newRanges);
                              }}
                              placeholder="200"
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={`price_${index}`}>Per Metre Rate (£)</Label>
                            <Input
                              id={`price_${index}`}
                              type="number"
                              step="0.01"
                              value={range.price}
                              onChange={(e) => {
                                const newRanges = [...formData.height_price_ranges];
                                newRanges[index].price = parseFloat(e.target.value) || 0;
                                handleInputChange("height_price_ranges", newRanges);
                              }}
                              placeholder="18.00"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Per metre rate for this height range (replaces standard rate)
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newRanges = formData.height_price_ranges.filter((_, i) => i !== index);
                              handleInputChange("height_price_ranges", newRanges);
                            }}
                            disabled={formData.height_price_ranges.length === 1}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const lastRange = formData.height_price_ranges[formData.height_price_ranges.length - 1];
                          const newRange = {
                            min_height: lastRange.max_height + 1,
                            max_height: lastRange.max_height + 50,
                            price: lastRange.price + 5
                          };
                          handleInputChange("height_price_ranges", [...formData.height_price_ranges, newRange]);
                        }}
                      >
                        Add Range
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <Label htmlFor="pricing_type">Pricing Method</Label>
                  <Select value={formData.pricing_type} onValueChange={(value) => handleInputChange("pricing_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_metre">Per Running Metre/Yard</SelectItem>
                      <SelectItem value="per_drop">Per Drop - Price multiplies by fabric pieces needed</SelectItem>
                      <SelectItem value="per_panel">Per Panel - Fixed price per finished curtain</SelectItem>
                      <SelectItem value="pricing_grid">Pricing Grid (Upload)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fabric width setting for drop calculations only */}
                {formData.pricing_type === "per_drop" && (
                  <Card className="p-3 bg-muted/30">
                    <h5 className="font-medium text-sm mb-2">Fabric Width Configuration</h5>
                    <div>
                      <Label htmlFor="fabric_width_type">Standard Fabric Width</Label>
                      <Select value={formData.fabric_width_type} onValueChange={(value) => handleInputChange("fabric_width_type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fabric width" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="narrow">Narrow Width (140cm) - More drops needed for wide curtains</SelectItem>
                          <SelectItem value="wide">Wide Width (280cm) - Fewer drops needed</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        This determines how many fabric pieces (drops) are needed, which affects the total price
                      </p>
                    </div>
                  </Card>
                )}

                {formData.pricing_type === "per_metre" && !formData.uses_height_pricing && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="machine_price_per_metre">Machine Price per Metre</Label>
                        <Input
                          id="machine_price_per_metre"
                          type="number"
                          step="0.01"
                          value={formData.machine_price_per_metre}
                          onChange={(e) => handleInputChange("machine_price_per_metre", e.target.value)}
                          placeholder="20.00"
                        />
                      </div>
                      {formData.offers_hand_finished && (
                        <div>
                          <Label htmlFor="hand_price_per_metre">Hand-Finished Price per Metre</Label>
                          <Input
                            id="hand_price_per_metre"
                            type="number"
                            step="0.01"
                            value={formData.hand_price_per_metre}
                            onChange={(e) => handleInputChange("hand_price_per_metre", e.target.value)}
                            placeholder="35.00"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formData.pricing_type === "per_drop" && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">🟫 Per Drop Pricing</h4>
                      <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                        Price scales with fabric complexity. System calculates how many fabric pieces (drops) 
                        are needed based on curtain width vs fabric width, then multiplies by your price per drop.
                      </p>
                    </div>
                    
                    <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
                      <h5 className="font-medium text-xs text-amber-900 dark:text-amber-100">Calculation Example:</h5>
                      <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                        Curtain width: 300cm, Fabric width: 137cm → Need 3 drops<br/>
                        Final price: 3 drops × £{formData.machine_price_per_drop || '30'} = £{(3 * parseFloat(formData.machine_price_per_drop || '30')).toFixed(2)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="machine_price_per_drop">Machine Price per Drop</Label>
                        <Input
                          id="machine_price_per_drop"
                          type="number"
                          step="0.01"
                          value={formData.machine_price_per_drop}
                          onChange={(e) => handleInputChange("machine_price_per_drop", e.target.value)}
                          placeholder="30.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Price per fabric drop (scales with complexity)</p>
                      </div>
                      {formData.offers_hand_finished && (
                        <div>
                          <Label htmlFor="hand_price_per_drop">Hand-Finished Price per Drop</Label>
                          <Input
                            id="hand_price_per_drop"
                            type="number"
                            step="0.01"
                            value={formData.hand_price_per_drop}
                            onChange={(e) => handleInputChange("hand_price_per_drop", e.target.value)}
                            placeholder="45.00"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Hand-finished premium per drop</p>
                        </div>
                      )}
                    </div>

                    <Card className="p-4">
                      <h4 className="font-medium mb-4">Height-Based Drop Pricing Ranges</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Configure different drop pricing based on curtain height. If no ranges are set, the standard per-drop pricing above will be used.
                      </p>
                      
                      <div className="space-y-3">
                        {formData.drop_height_ranges?.map((range, index) => (
                          <div key={index} className="grid grid-cols-4 gap-2 items-center">
                            <div>
                              <Label className="text-xs">Min Height (cm)</Label>
                              <Input
                                type="number"
                                value={range.min}
                                onChange={(e) => {
                                  const newRanges = [...(formData.drop_height_ranges || [])];
                                  newRanges[index] = { ...range, min: Number(e.target.value) };
                                  handleInputChange('drop_height_ranges', newRanges);
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Max Height (cm)</Label>
                              <Input
                                type="number"
                                value={range.max}
                                onChange={(e) => {
                                  const newRanges = [...(formData.drop_height_ranges || [])];
                                  newRanges[index] = { ...range, max: Number(e.target.value) };
                                  handleInputChange('drop_height_ranges', newRanges);
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Machine (£/drop)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={formData.machine_drop_height_prices?.[index] || ''}
                                onChange={(e) => {
                                  const newPrices = [...(formData.machine_drop_height_prices || [])];
                                  newPrices[index] = Number(e.target.value);
                                  handleInputChange('machine_drop_height_prices', newPrices);
                                }}
                                className="mt-1"
                              />
                            </div>
                            {formData.offers_hand_finished && (
                              <div>
                                <Label className="text-xs">Hand (£/drop)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={formData.hand_drop_height_prices?.[index] || ''}
                                  onChange={(e) => {
                                    const newPrices = [...(formData.hand_drop_height_prices || [])];
                                    newPrices[index] = Number(e.target.value);
                                    handleInputChange('hand_drop_height_prices', newPrices);
                                  }}
                                  className="mt-1"
                                />
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newRanges = (formData.drop_height_ranges || []).filter((_, i) => i !== index);
                                const newMachinePrices = (formData.machine_drop_height_prices || []).filter((_, i) => i !== index);
                                const newHandPrices = (formData.hand_drop_height_prices || []).filter((_, i) => i !== index);
                                handleInputChange('drop_height_ranges', newRanges);
                                handleInputChange('machine_drop_height_prices', newMachinePrices);
                                handleInputChange('hand_drop_height_prices', newHandPrices);
                              }}
                              className="mt-6"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newRanges = [...(formData.drop_height_ranges || []), { min: 0, max: 100 }];
                            const newMachinePrices = [...(formData.machine_drop_height_prices || []), 0];
                            const newHandPrices = [...(formData.hand_drop_height_prices || []), 0];
                            handleInputChange('drop_height_ranges', newRanges);
                            handleInputChange('machine_drop_height_prices', newMachinePrices);
                            handleInputChange('hand_drop_height_prices', newHandPrices);
                          }}
                        >
                          Add Height Range
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}

                {formData.pricing_type === "per_panel" && (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                      <h4 className="font-medium text-sm text-green-900 dark:text-green-100">🟩 Per Panel Pricing</h4>
                      <p className="text-xs text-green-800 dark:text-green-200 mt-1">
                        Fixed price per finished curtain panel regardless of fabric complexity. 
                        Price stays the same whether you need 1 drop or 5 drops to make the panel.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                      <h5 className="font-medium text-xs text-purple-900 dark:text-purple-100">Calculation Example:</h5>
                      <p className="text-xs text-purple-800 dark:text-purple-200 mt-1">
                        Pair of curtains (2 panels) regardless of fabric complexity<br/>
                        Final price: 2 panels × ${formData.machine_price_per_panel || '180'} = ${(2 * parseFloat(formData.machine_price_per_panel || '180')).toFixed(2)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="machine_price_per_panel">Machine Price per Panel</Label>
                        <Input
                          id="machine_price_per_panel"
                          type="number"
                          step="0.01"
                          value={formData.machine_price_per_panel}
                          onChange={(e) => handleInputChange("machine_price_per_panel", e.target.value)}
                          placeholder="180.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Fixed price per finished curtain (doesn't scale)</p>
                      </div>
                      {formData.offers_hand_finished && (
                        <div>
                          <Label htmlFor="hand_price_per_panel">Hand-Finished Price per Panel</Label>
                          <Input
                            id="hand_price_per_panel"
                            type="number"
                            step="0.01"
                            value={formData.hand_price_per_panel}
                            onChange={(e) => handleInputChange("hand_price_per_panel", e.target.value)}
                            placeholder="280.00"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Hand-finished premium per panel</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formData.pricing_type === "pricing_grid" && (
                  <div className="space-y-4">
                    <PricingGridUploader 
                      initialData={formData.pricing_grid_data}
                      onDataChange={(data) => handleInputChange("pricing_grid_data", data)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>


            {/* Hardware Compatibility */}
            <HardwareCompatibilityManager 
              headingType={formData.selected_heading_ids.length > 0 ? 
                headingStyles.find(h => h.id === formData.selected_heading_ids[0])?.name || "" : ""}
              compatibleHardware={formData.compatible_hardware}
              onHardwareChange={(hardware) => handleInputChange("compatible_hardware", hardware)}
            />
          </TabsContent>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {template ? "Update Template" : "Create Template"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </Tabs>
    </TooltipProvider>
  );
};