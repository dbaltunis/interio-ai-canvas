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
import { useEnhancedInventoryByCategory } from "@/hooks/useEnhancedInventory";
import { useOptionCategories } from "@/hooks/useOptionCategories";

// Import pricing components
import { HandFinishedToggle } from "./pricing/HandFinishedToggle";
import { PricingMethodSelector } from "./pricing/PricingMethodSelector";
import { FabricWidthSelector } from "./pricing/FabricWidthSelector";
import { PerDropPricing } from "./pricing/PerDropPricing";
import { PerMetrePricing } from "./pricing/PerMetrePricing";
import { PerPanelPricing } from "./pricing/PerPanelPricing";
import { HeightBasedPricingRanges } from "./pricing/HeightBasedPricingRanges";

interface CurtainTemplateFormProps {
  template?: CurtainTemplate;
  onClose: () => void;
}

export const CurtainTemplateForm = ({ template, onClose }: CurtainTemplateFormProps) => {
  const { toast } = useToast();
  const createTemplate = useCreateCurtainTemplate();
  const updateTemplate = useUpdateCurtainTemplate();
  const { data: headingStyles = [] } = useHeadingInventory();
  const { data: topSystems = [] } = useEnhancedInventoryByCategory('top_system');
  const { data: optionCategories = [] } = useOptionCategories();
  const { data: treatmentOptions = [] } = useEnhancedInventoryByCategory('treatment_option');

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
    curtain_type: template?.curtain_type || "curtain",
    
    // Selected Headings from Library (for curtains)
    selected_heading_ids: template?.selected_heading_ids || [],
    
    // Selected Top Systems from Library (for blinds)
    selected_top_system_ids: (template as any)?.selected_top_system_ids || [],
    
    // Fabric Requirements (for curtains - will use inventory)
    fabric_width_type: template?.fabric_width_type || "wide",
    vertical_repeat: template?.vertical_repeat?.toString() || "",
    horizontal_repeat: template?.horizontal_repeat?.toString() || "",
    fabric_direction: template?.fabric_direction || "standard",
    
    // Curtain-specific: Hem Allowances - Default + Editable
    bottom_hem: template?.bottom_hem?.toString() || "15",
    side_hems: template?.side_hems?.toString() || "7.5",
    seam_hems: template?.seam_hems?.toString() || "1.5",
    
    // Curtain-specific: Returns - Set in template, ON/OFF toggle in projects
    return_left: template?.return_left?.toString() || "7.5",
    return_right: template?.return_right?.toString() || "7.5",
    overlap: template?.overlap?.toString() || "10",
    header_allowance: template?.header_allowance?.toString() || "8",
    waste_percent: template?.waste_percent?.toString() || "5",
    is_railroadable: template?.is_railroadable || false,
    
    // Blind/Shutter-specific: Manufacturing settings
    bracket_deduction: (template as any)?.bracket_deduction?.toString() || "0",
    minimum_width: (template as any)?.minimum_width?.toString() || "30",
    maximum_width: (template as any)?.maximum_width?.toString() || "300",
    minimum_height: (template as any)?.minimum_height?.toString() || "30",
    maximum_height: (template as any)?.maximum_height?.toString() || "300",
    stack_allowance: (template as any)?.stack_allowance?.toString() || "0",
    
    // Lining Selection - Pre-created with pricing (for curtains)
    lining_types: template?.lining_types || [
      { type: "Standard", price_per_metre: 15, labour_per_curtain: 25 },
      { type: "Blackout", price_per_metre: 22, labour_per_curtain: 35 },
      { type: "Thermal", price_per_metre: 28, labour_per_curtain: 40 },
      { type: "Interlining", price_per_metre: 18, labour_per_curtain: 45 }
    ],
    
    // Hardware - From inventory
    compatible_hardware: template?.compatible_hardware || [],
    
    // Make-Up Pricing with machine/hand conditions
    pricing_type: template?.pricing_type || "per_metre" as 'per_metre' | 'per_drop' | 'per_panel' | 'pricing_grid' | 'per_sqm' | 'per_unit',
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
    hand_drop_height_prices: template?.hand_drop_height_prices || [],
    
    // Option Categories Integration
    selected_option_categories: template?.compatible_hardware || []  // Temporarily use this field
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

    // Only validate heading selection for curtains
    if (formData.curtain_type === 'curtain' && formData.selected_heading_ids.length === 0) {
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
        curtain_type: formData.curtain_type,
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
        compatible_hardware: formData.selected_option_categories, // Store option categories here for now
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          {formData.curtain_type === 'curtain' ? (
            <TabsTrigger value="heading">Heading</TabsTrigger>
          ) : (
            <TabsTrigger value="treatment_settings">Treatment Settings</TabsTrigger>
          )}
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
                    placeholder="e.g., Premium Roller Blind, Plantation Shutters"
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
                  <Label htmlFor="window_covering_type">Window Covering Type</Label>
                  <Select value={formData.curtain_type} onValueChange={(value) => handleInputChange("curtain_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select window covering type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="curtain">Curtain</SelectItem>
                      <SelectItem value="roller_blind">Roller Blind</SelectItem>
                      <SelectItem value="venetian_blind">Venetian Blind</SelectItem>
                      <SelectItem value="vertical_blind">Vertical Blind</SelectItem>
                      <SelectItem value="cellular_blind">Cellular Blind</SelectItem>
                      <SelectItem value="roman_blind">Roman Blind</SelectItem>
                      <SelectItem value="plantation_shutter">Plantation Shutter</SelectItem>
                      <SelectItem value="cafe_shutter">Cafe Shutter</SelectItem>
                       <SelectItem value="awning">Awning</SelectItem>
                       <SelectItem value="panel_glide">Panel Glide</SelectItem>
                       <SelectItem value="custom">Custom Window Covering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.curtain_type === 'curtain' && (
                  <p className="text-xs text-muted-foreground mt-1">Users will choose single or pair when creating quotes</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="options" className="space-y-6">
            {/* Treatment Options - Dynamically filtered */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Treatment Options</CardTitle>
                <CardDescription>
                  Select which treatment options are available for this template
                  {formData.curtain_type && formData.curtain_type !== 'custom' && (
                    <span className="block mt-1 text-xs">
                      Showing only options for: <strong>{formData.curtain_type.replace('_', ' ')}</strong>
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {treatmentOptions.filter(option => 
                    !option.treatment_type || 
                    option.treatment_type === formData.curtain_type ||
                    formData.curtain_type === 'custom'
                  ).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No treatment options found for {formData.curtain_type}. Create treatment options in the "Treatment Options" section and set their treatment type to "{formData.curtain_type}".
                    </p>
                  ) : (
                    treatmentOptions
                      .filter(option => 
                        !option.treatment_type || 
                        option.treatment_type === formData.curtain_type ||
                        formData.curtain_type === 'custom'
                      )
                      .map((option) => (
                      <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={`treatment-option-${option.id}`}
                          checked={formData.selected_option_categories.includes(option.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange("selected_option_categories", [...formData.selected_option_categories, option.id]);
                            } else {
                              handleInputChange("selected_option_categories", formData.selected_option_categories.filter(id => id !== option.id));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`treatment-option-${option.id}`} className="font-medium cursor-pointer">
                            {option.name}
                          </Label>
                          <div className="text-sm text-muted-foreground">
                            {option.description || "No description"}
                          </div>
                          {option.cost_price && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Cost: ${option.cost_price} | Sell: ${option.selling_price || option.cost_price}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Option Categories Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hierarchical Option Categories</CardTitle>
                <CardDescription>
                  Select which option categories customers can choose from (advanced multi-level options)
                  {formData.curtain_type && formData.curtain_type !== 'custom' && (
                    <span className="block mt-1 text-xs">
                      Showing only categories for: <strong>{formData.curtain_type.replace('_', ' ')}</strong>
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optionCategories.filter(category => 
                    !category.treatment_type || 
                    category.treatment_type === formData.curtain_type ||
                    formData.curtain_type === 'custom'
                  ).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No option categories found for {formData.curtain_type}. Create option categories in the "Option Categories" tab, or set their treatment type to "{formData.curtain_type}".
                    </p>
                  ) : (
                    optionCategories
                      .filter(category => 
                        !category.treatment_type || 
                        category.treatment_type === formData.curtain_type ||
                        formData.curtain_type === 'custom'
                      )
                      .map((category) => (
                      <div key={category.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={`option-category-${category.id}`}
                          checked={formData.selected_option_categories.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange("selected_option_categories", [...formData.selected_option_categories, category.id]);
                            } else {
                              handleInputChange("selected_option_categories", formData.selected_option_categories.filter(id => id !== category.id));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`option-category-${category.id}`} className="font-medium cursor-pointer">
                            {category.name}
                          </Label>
                          <div className="text-sm text-muted-foreground">
                            {category.description || "No description"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Type: {category.category_type} | Subcategories: {category.subcategories?.length || 0}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Heading Tab - Only for Curtains */}
          <TabsContent value="heading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Available Heading Styles</CardTitle>
                <CardDescription>
                  Select heading styles to include in this template
                  {formData.curtain_type && formData.curtain_type !== 'custom' && (
                    <span className="block mt-1 text-xs">
                      Showing only headings for: <strong>{formData.curtain_type.replace('_', ' ')}</strong>
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {headingStyles.filter(heading => 
                    !heading.treatment_type || 
                    heading.treatment_type === formData.curtain_type ||
                    formData.curtain_type === 'custom'
                  ).length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No heading styles found for {formData.curtain_type}. Create heading styles in the inventory section first, or set their treatment type to "{formData.curtain_type}".
                    </p>
                  ) : (
                    headingStyles
                      .filter(heading => 
                        !heading.treatment_type || 
                        heading.treatment_type === formData.curtain_type ||
                        formData.curtain_type === 'custom'
                      )
                      .map((heading) => (
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

          {/* Treatment Settings Tab - Only for Non-Curtain Window Coverings */}
          <TabsContent value="treatment_settings" className="space-y-6">
            {(() => {
              // Map curtain_type to organized option types
              const treatmentOptionGroups: Record<string, { type: string; label: string }[]> = {
                roller_blind: [
                  { type: 'tube_size', label: 'Tube Sizes' },
                  { type: 'mount_type', label: 'Mount Types' },
                  { type: 'fascia_type', label: 'Fascia Types' },
                  { type: 'bottom_rail_style', label: 'Bottom Rails' },
                  { type: 'control_type', label: 'Control Types' },
                  { type: 'motor_type', label: 'Motor Types' },
                ],
                roman_blind: [
                  { type: 'headrail_type', label: 'Headrail Types' },
                  { type: 'fold_style', label: 'Fold Styles' },
                  { type: 'lining_type', label: 'Lining Types' },
                  { type: 'control_type', label: 'Control Types' },
                  { type: 'mount_type', label: 'Mount Types' },
                ],
                venetian_blind: [
                  { type: 'slat_size', label: 'Slat Sizes' },
                  { type: 'material', label: 'Materials' },
                  { type: 'control_type', label: 'Control Types' },
                  { type: 'headrail_type', label: 'Headrail Types' },
                  { type: 'mount_type', label: 'Mount Types' },
                ],
                vertical_blind: [
                  { type: 'louvre_width', label: 'Louvre Widths' },
                  { type: 'headrail_type', label: 'Headrail Types' },
                  { type: 'control_type', label: 'Control Types' },
                  { type: 'weight_style', label: 'Weight Styles' },
                ],
                cellular_blind: [
                  { type: 'cell_size', label: 'Cell Sizes' },
                  { type: 'headrail_type', label: 'Headrail Types' },
                  { type: 'control_type', label: 'Control Types' },
                  { type: 'mount_type', label: 'Mount Types' },
                ],
                plantation_shutter: [
                  { type: 'louvre_size', label: 'Louvre Sizes' },
                  { type: 'frame_type', label: 'Frame Types' },
                  { type: 'hinge_type', label: 'Hinge Types' },
                  { type: 'material', label: 'Materials' },
                  { type: 'finish_type', label: 'Finish Types' },
                  { type: 'control_type', label: 'Control Types' },
                ],
                cafe_shutter: [
                  { type: 'louvre_size', label: 'Louvre Sizes' },
                  { type: 'frame_type', label: 'Frame Types' },
                  { type: 'hinge_type', label: 'Hinge Types' },
                  { type: 'material', label: 'Materials' },
                  { type: 'finish_type', label: 'Finish Types' },
                ],
                awning: [
                  { type: 'motor_type', label: 'Motor Types' },
                  { type: 'bracket_type', label: 'Bracket Types' },
                  { type: 'projection_type', label: 'Projection Types' },
                  { type: 'control_type', label: 'Control Types' },
                  { type: 'arm_type', label: 'Arm Types' },
                ],
                panel_glide: [
                  { type: 'track_type', label: 'Track Types' },
                  { type: 'panel_width', label: 'Panel Widths' },
                  { type: 'control_type', label: 'Control Types' },
                ],
              };

              const currentGroups = treatmentOptionGroups[formData.curtain_type] || [];
              
              // Helper to parse option_type from description field
              const getOptionType = (option: any): string => {
                try {
                  const details = option.description ? JSON.parse(option.description) : {};
                  return details.option_type || '';
                } catch {
                  return '';
                }
              };

              // Filter options for current treatment type
              const relevantOptions = treatmentOptions.filter(opt => 
                opt.treatment_type === formData.curtain_type
              );

              return currentGroups.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Treatment Settings</CardTitle>
                    <CardDescription>
                      No specific treatment settings configured for this window covering type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Select a different window covering type or create treatment options in the "Treatment Options" section.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                currentGroups.map((group) => {
                  const groupOptions = relevantOptions.filter(opt => getOptionType(opt) === group.type);
                  
                  return (
                    <Card key={group.type}>
                      <CardHeader>
                        <CardTitle className="text-base">{group.label}</CardTitle>
                        <CardDescription>
                          Select which {group.label.toLowerCase()} are available for this template
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {groupOptions.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No {group.label.toLowerCase()} found. Create them in the "Treatment Options" section with type "{group.type}" and treatment type "{formData.curtain_type}".
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 gap-3">
                            {groupOptions.map((option) => (
                              <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                                <Checkbox
                                  id={`option-${option.id}`}
                                  checked={formData.selected_option_categories.includes(option.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      handleInputChange("selected_option_categories", [...formData.selected_option_categories, option.id]);
                                    } else {
                                      handleInputChange("selected_option_categories", formData.selected_option_categories.filter(id => id !== option.id));
                                    }
                                  }}
                                />
                                <div className="flex-1">
                                  <Label htmlFor={`option-${option.id}`} className="font-medium cursor-pointer">
                                    {option.name}
                                  </Label>
                                  {option.description && !option.description.includes('{') && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {option.description}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                    {option.cost_price && option.cost_price > 0 && (
                                      <span>Cost: ${option.cost_price.toFixed(2)}</span>
                                    )}
                                    {option.selling_price && option.selling_price > 0 && (
                                      <span>Sell: ${option.selling_price.toFixed(2)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              );
            })()}
          </TabsContent>

          <TabsContent value="manufacturing" className="space-y-6">
            {/* Curtain Manufacturing Configuration */}
            {formData.curtain_type === 'curtain' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Curtain Manufacturing</CardTitle>
                  <CardDescription>Fabric usage rules for curtain production</CardDescription>
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
            )}

            {/* Blind/Shutter Manufacturing Configuration */}
            {formData.curtain_type !== 'curtain' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Manufacturing Specifications</CardTitle>
                  <CardDescription>Size constraints and deductions for {formData.curtain_type.replace('_', ' ')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bracket Deduction */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Bracket Deduction</h4>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Amount to deduct from width for bracket space (per side)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div>
                      <Label htmlFor="bracket_deduction">Deduction per Side (cm)</Label>
                      <Input
                        id="bracket_deduction"
                        type="number"
                        step="0.1"
                        value={formData.bracket_deduction}
                        onChange={(e) => handleInputChange("bracket_deduction", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Size Constraints */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Size Constraints</h4>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Minimum and maximum dimensions for this product</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minimum_width">Min Width (cm)</Label>
                        <Input
                          id="minimum_width"
                          type="number"
                          step="1"
                          value={formData.minimum_width}
                          onChange={(e) => handleInputChange("minimum_width", e.target.value)}
                          placeholder="30"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maximum_width">Max Width (cm)</Label>
                        <Input
                          id="maximum_width"
                          type="number"
                          step="1"
                          value={formData.maximum_width}
                          onChange={(e) => handleInputChange("maximum_width", e.target.value)}
                          placeholder="300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="minimum_height">Min Height (cm)</Label>
                        <Input
                          id="minimum_height"
                          type="number"
                          step="1"
                          value={formData.minimum_height}
                          onChange={(e) => handleInputChange("minimum_height", e.target.value)}
                          placeholder="30"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maximum_height">Max Height (cm)</Label>
                        <Input
                          id="maximum_height"
                          type="number"
                          step="1"
                          value={formData.maximum_height}
                          onChange={(e) => handleInputChange("maximum_height", e.target.value)}
                          placeholder="300"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Stack Allowance (for Roman blinds, etc.) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Stack Allowance</h4>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Height to add for stacking when raised (Roman blinds, etc.)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div>
                      <Label htmlFor="stack_allowance">Stack Height (cm)</Label>
                      <Input
                        id="stack_allowance"
                        type="number"
                        step="1"
                        value={formData.stack_allowance}
                        onChange={(e) => handleInputChange("stack_allowance", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            {/* Curtain Pricing */}
            {formData.curtain_type === 'curtain' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Curtain Make-Up Pricing</CardTitle>
                  <CardDescription>Configure pricing for curtain fabrication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Hand-finished toggle */}
                  <HandFinishedToggle
                    value={formData.offers_hand_finished}
                    onChange={(checked) => handleInputChange("offers_hand_finished", checked)}
                  />

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
                    <HeightBasedPricingRanges
                      heightPriceRanges={formData.height_price_ranges}
                      onInputChange={handleInputChange}
                    />
                  )}

                  <PricingMethodSelector
                    value={formData.pricing_type}
                    onChange={(value) => handleInputChange("pricing_type", value)}
                />

                  {/* Fabric width setting for drop calculations only */}
                  {formData.pricing_type === "per_drop" && (
                    <FabricWidthSelector
                      value={formData.fabric_width_type}
                      onChange={(value) => handleInputChange("fabric_width_type", value)}
                    />
                  )}

                  {/* Per-metre pricing */}
                  {formData.pricing_type === "per_metre" && !formData.uses_height_pricing && (
                    <PerMetrePricing
                      machinePricePerMetre={formData.machine_price_per_metre}
                      handPricePerMetre={formData.hand_price_per_metre}
                      offersHandFinished={formData.offers_hand_finished}
                      onInputChange={handleInputChange}
                    />
                  )}

                  {/* Per-drop pricing */}
                  {formData.pricing_type === "per_drop" && (
                    <PerDropPricing
                      machinePricePerDrop={formData.machine_price_per_drop}
                      handPricePerDrop={formData.hand_price_per_drop}
                      offersHandFinished={formData.offers_hand_finished}
                      dropHeightRanges={formData.drop_height_ranges}
                      machineDropHeightPrices={formData.machine_drop_height_prices}
                      handDropHeightPrices={formData.hand_drop_height_prices}
                      onInputChange={handleInputChange}
                    />
                  )}

                  {/* Per-panel pricing */}
                  {formData.pricing_type === "per_panel" && (
                    <PerPanelPricing
                      machinePricePerPanel={formData.machine_price_per_panel}
                      handPricePerPanel={formData.hand_price_per_panel}
                      offersHandFinished={formData.offers_hand_finished}
                      onInputChange={handleInputChange}
                    />
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
            )}

            {/* Blind/Shutter Pricing */}
            {formData.curtain_type !== 'curtain' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{formData.curtain_type.replace('_', ' ')} Pricing</CardTitle>
                  <CardDescription>
                    Industry-standard pricing for {formData.curtain_type.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pricing method for blinds/shutters */}
                  <div className="space-y-2">
                    <Label htmlFor="blind_pricing_method">Pricing Method</Label>
                    <Select 
                      value={formData.pricing_type} 
                      onValueChange={(value) => handleInputChange("pricing_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_sqm">Per Square Metre (Most Common)</SelectItem>
                        <SelectItem value="per_unit">Per Unit (Size Ranges)</SelectItem>
                        <SelectItem value="pricing_grid">Pricing Grid (Width x Height)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {formData.pricing_type === 'per_sqm' && 'Price calculated by width × height in square metres'}
                      {formData.pricing_type === 'per_unit' && 'Fixed price per unit based on size ranges'}
                      {formData.pricing_type === 'pricing_grid' && 'Upload a pricing grid with width/height combinations'}
                    </p>
                  </div>

                  {/* Per Square Metre Pricing */}
                  {formData.pricing_type === "per_sqm" && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <h5 className="font-medium text-xs text-blue-900 dark:text-blue-100">💡 Square Metre Pricing</h5>
                        <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                          Price = Width (m) × Height (m) × Price per m²<br/>
                          <strong>Example:</strong> 1.5m wide × 2.0m high × $150/m² = $450
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="price_per_sqm">Price per Square Metre ($)</Label>
                        <Input
                          id="price_per_sqm"
                          type="number"
                          step="0.01"
                          value={formData.machine_price_per_metre}
                          onChange={(e) => handleInputChange("machine_price_per_metre", e.target.value)}
                          placeholder="150.00"
                        />
                      </div>
                    </div>
                  )}

                  {/* Per Unit Pricing */}
                  {formData.pricing_type === "per_unit" && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <h5 className="font-medium text-xs text-blue-900 dark:text-blue-100">💡 Per Unit Pricing</h5>
                        <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                          Fixed price ranges based on blind dimensions<br/>
                          <strong>Example:</strong> Small (up to 1m²) = $200, Medium (1-2m²) = $350, Large (2m²+) = $500
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="base_price">Base Price per Unit ($)</Label>
                        <Input
                          id="base_price"
                          type="number"
                          step="0.01"
                          value={formData.machine_price_per_drop}
                          onChange={(e) => handleInputChange("machine_price_per_drop", e.target.value)}
                          placeholder="200.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Additional size-based pricing can be configured in price rules
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pricing Grid Upload */}
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
            )}

            {/* Hardware Compatibility - Only for Curtains */}
            {formData.curtain_type === 'curtain' && (
              <HardwareCompatibilityManager 
                headingType={formData.selected_heading_ids.length > 0 ? 
                  headingStyles.find(h => h.id === formData.selected_heading_ids[0])?.name || "" : ""}
                compatibleHardware={formData.compatible_hardware}
                onHardwareChange={(hardware) => handleInputChange("compatible_hardware", hardware)}
              />
            )}
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