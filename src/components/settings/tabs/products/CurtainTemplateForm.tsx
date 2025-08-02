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
    machine_price_per_metre: template?.unit_price?.toString() || "",
    hand_price_per_metre: "",
    machine_price_per_curtain: "",
    hand_price_per_curtain: "",
    price_rules: template?.price_rules || [],
    pricing_grid_data: template?.pricing_grid_data || null
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
        pricing_type: formData.pricing_type as 'per_metre' | 'per_drop' | 'per_curtain' | 'pricing_grid',
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
                <div>
                  <Label htmlFor="pricing_type">Pricing Method</Label>
                  <Select value={formData.pricing_type} onValueChange={(value) => handleInputChange("pricing_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_metre">Per Running Metre/Yard</SelectItem>
                      <SelectItem value="per_curtain">Per Curtain (Unit Price)</SelectItem>
                      <SelectItem value="pricing_grid">Pricing Grid (Upload)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.pricing_type === "per_metre" && (
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
                    </div>
                  </div>
                )}

                {formData.pricing_type === "per_curtain" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="machine_price_per_curtain">Machine Price per Curtain</Label>
                      <Input
                        id="machine_price_per_curtain"
                        type="number"
                        step="0.01"
                        value={formData.machine_price_per_curtain}
                        onChange={(e) => handleInputChange("machine_price_per_curtain", e.target.value)}
                        placeholder="150.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hand_price_per_curtain">Hand-Finished Price per Curtain</Label>
                      <Input
                        id="hand_price_per_curtain"
                        type="number"
                        step="0.01"
                        value={formData.hand_price_per_curtain}
                        onChange={(e) => handleInputChange("hand_price_per_curtain", e.target.value)}
                        placeholder="250.00"
                      />
                    </div>
                  </div>
                )}

                {formData.pricing_type === "pricing_grid" && (
                  <PricingGridUploader 
                    initialData={formData.pricing_grid_data}
                    onDataChange={(data) => handleInputChange("pricing_grid_data", data)}
                  />
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