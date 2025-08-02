import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Save, X, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CurtainTemplate, useCreateCurtainTemplate, useUpdateCurtainTemplate } from "@/hooks/useCurtainTemplates";

interface CurtainTemplateFormProps {
  template?: CurtainTemplate;
  onClose: () => void;
}

export const CurtainTemplateForm = ({ template, onClose }: CurtainTemplateFormProps) => {
  const { toast } = useToast();
  const createTemplate = useCreateCurtainTemplate();
  const updateTemplate = useUpdateCurtainTemplate();
  const [formData, setFormData] = useState({
    // Basic Information
    name: template?.name || "",
    description: template?.description || "",
    
    // Curtain Type
    curtain_type: template?.curtain_type || "single",
    
    // Heading Style
    heading_name: template?.heading_name || "",
    fullness_ratio: template?.fullness_ratio?.toString() || "2.0",
    extra_fabric_fixed: template?.extra_fabric_fixed?.toString() || "",
    extra_fabric_percentage: template?.extra_fabric_percentage?.toString() || "",
    heading_upcharge_per_metre: template?.heading_upcharge_per_metre?.toString() || "",
    heading_upcharge_per_curtain: template?.heading_upcharge_per_curtain?.toString() || "",
    glider_spacing: template?.glider_spacing?.toString() || "",
    eyelet_spacing: template?.eyelet_spacing?.toString() || "",
    
    // Fabric Requirements
    fabric_width_type: template?.fabric_width_type || "wide",
    vertical_repeat: template?.vertical_repeat?.toString() || "",
    horizontal_repeat: template?.horizontal_repeat?.toString() || "",
    fabric_direction: template?.fabric_direction || "standard",
    bottom_hem: template?.bottom_hem?.toString() || "15",
    side_hems: template?.side_hems?.toString() || "7.5",
    seam_hems: template?.seam_hems?.toString() || "1.5",
    
    // Manufacturing Configuration
    return_left: template?.return_left?.toString() || "7.5",
    return_right: template?.return_right?.toString() || "7.5",
    overlap: template?.overlap?.toString() || "10",
    header_allowance: template?.header_allowance?.toString() || "8",
    waste_percent: template?.waste_percent?.toString() || "5",
    is_railroadable: template?.is_railroadable || false,
    
    // Lining Options
    lining_types: template?.lining_types || [],
    
    // Hardware
    compatible_hardware: template?.compatible_hardware || [],
    
    // Make-Up Pricing
    pricing_type: template?.pricing_type || "per_metre",
    price_rules: template?.price_rules || [],
    unit_price: template?.unit_price?.toString() || "",
    
    // Manufacturing
    manufacturing_type: template?.manufacturing_type || "machine",
    hand_finished_upcharge_fixed: template?.hand_finished_upcharge_fixed?.toString() || "",
    hand_finished_upcharge_percentage: template?.hand_finished_upcharge_percentage?.toString() || ""
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

    try {
      const templateData = {
        name: formData.name,
        description: formData.description,
        curtain_type: formData.curtain_type as 'single' | 'pair',
        heading_name: formData.heading_name,
        fullness_ratio: parseFloat(formData.fullness_ratio.toString()) || 2.0,
        extra_fabric_fixed: formData.extra_fabric_fixed ? parseFloat(formData.extra_fabric_fixed.toString()) : undefined,
        extra_fabric_percentage: formData.extra_fabric_percentage ? parseFloat(formData.extra_fabric_percentage.toString()) : undefined,
        heading_upcharge_per_metre: formData.heading_upcharge_per_metre ? parseFloat(formData.heading_upcharge_per_metre.toString()) : undefined,
        heading_upcharge_per_curtain: formData.heading_upcharge_per_curtain ? parseFloat(formData.heading_upcharge_per_curtain.toString()) : undefined,
        glider_spacing: formData.glider_spacing ? parseFloat(formData.glider_spacing.toString()) : undefined,
        eyelet_spacing: formData.eyelet_spacing ? parseFloat(formData.eyelet_spacing.toString()) : undefined,
        fabric_width_type: formData.fabric_width_type as 'wide' | 'narrow',
        vertical_repeat: formData.vertical_repeat ? parseFloat(formData.vertical_repeat.toString()) : undefined,
        horizontal_repeat: formData.horizontal_repeat ? parseFloat(formData.horizontal_repeat.toString()) : undefined,
        fabric_direction: formData.fabric_direction as 'standard' | 'railroaded',
        bottom_hem: parseFloat(formData.bottom_hem.toString()) || 15,
        side_hems: parseFloat(formData.side_hems.toString()) || 7.5,
        seam_hems: parseFloat(formData.seam_hems.toString()) || 1.5,
        lining_types: [],
        compatible_hardware: [],
        pricing_type: formData.pricing_type as 'per_metre' | 'per_drop' | 'per_curtain' | 'pricing_grid',
        price_rules: [],
        unit_price: formData.unit_price ? parseFloat(formData.unit_price.toString()) : undefined,
        pricing_grid_data: {},
        manufacturing_type: formData.manufacturing_type as 'machine' | 'hand',
        hand_finished_upcharge_fixed: formData.hand_finished_upcharge_fixed ? parseFloat(formData.hand_finished_upcharge_fixed.toString()) : undefined,
        hand_finished_upcharge_percentage: formData.hand_finished_upcharge_percentage ? parseFloat(formData.hand_finished_upcharge_percentage.toString()) : undefined,
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
    <div className="space-y-6 py-4 max-h-[80vh] overflow-y-auto">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
          <CardDescription>General template details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Premium Blackout Curtains"
            />
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
        </CardContent>
      </Card>

      {/* Curtain Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">2.1 Curtain Type Selection</CardTitle>
          <CardDescription>Select if this template is for single curtains or pairs</CardDescription>
        </CardHeader>
        <CardContent>
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
            {formData.curtain_type === "pair" && (
              <p className="text-sm text-muted-foreground mt-2">
                For pairs, extra hems and fabric will be automatically calculated
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Heading Style Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">2.2 Heading Style Setup</CardTitle>
          <CardDescription>Configure heading style details and pricing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="heading_name">Heading Name</Label>
              <Input
                id="heading_name"
                value={formData.heading_name}
                onChange={(e) => handleInputChange("heading_name", e.target.value)}
                placeholder="e.g., Wave, Pinch Pleat"
              />
            </div>
            <div>
              <Label htmlFor="fullness_ratio">Fullness Ratio (e.g., 1:2)</Label>
              <Input
                id="fullness_ratio"
                type="number"
                step="0.1"
                value={formData.fullness_ratio}
                onChange={(e) => handleInputChange("fullness_ratio", e.target.value)}
                placeholder="2.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="extra_fabric_fixed">Extra Fabric (Fixed cm)</Label>
              <Input
                id="extra_fabric_fixed"
                type="number"
                value={formData.extra_fabric_fixed}
                onChange={(e) => handleInputChange("extra_fabric_fixed", e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="extra_fabric_percentage">Extra Fabric (%)</Label>
              <Input
                id="extra_fabric_percentage"
                type="number"
                step="0.1"
                value={formData.extra_fabric_percentage}
                onChange={(e) => handleInputChange("extra_fabric_percentage", e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="heading_upcharge_per_metre">Upcharge per Metre</Label>
              <Input
                id="heading_upcharge_per_metre"
                type="number"
                step="0.01"
                value={formData.heading_upcharge_per_metre}
                onChange={(e) => handleInputChange("heading_upcharge_per_metre", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="heading_upcharge_per_curtain">Upcharge per Curtain</Label>
              <Input
                id="heading_upcharge_per_curtain"
                type="number"
                step="0.01"
                value={formData.heading_upcharge_per_curtain}
                onChange={(e) => handleInputChange("heading_upcharge_per_curtain", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Special heading configurations */}
          {formData.heading_name?.toLowerCase().includes("wave") && (
            <div>
              <Label htmlFor="glider_spacing">Glider Spacing (cm)</Label>
              <Input
                id="glider_spacing"
                type="number"
                value={formData.glider_spacing}
                onChange={(e) => handleInputChange("glider_spacing", e.target.value)}
                placeholder="e.g., 10"
              />
            </div>
          )}

          {formData.heading_name?.toLowerCase().includes("eyelet") && (
            <div>
              <Label htmlFor="eyelet_spacing">Eyelet Spacing (cm)</Label>
              <Input
                id="eyelet_spacing"
                type="number"
                value={formData.eyelet_spacing}
                onChange={(e) => handleInputChange("eyelet_spacing", e.target.value)}
                placeholder="e.g., 15"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fabric Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">2.3 Fabric Requirements</CardTitle>
          <CardDescription>Define fabric specifications and measurements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fabric_width_type">Fabric Width Type</Label>
              <Select value={formData.fabric_width_type} onValueChange={(value) => handleInputChange("fabric_width_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select width type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wide">Wide-Width</SelectItem>
                  <SelectItem value="narrow">Narrow-Width</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fabric_direction">Fabric Direction</Label>
              <Select value={formData.fabric_direction} onValueChange={(value) => handleInputChange("fabric_direction", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="railroaded">Railroaded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vertical_repeat">Vertical Repeat (cm)</Label>
              <Input
                id="vertical_repeat"
                type="number"
                value={formData.vertical_repeat}
                onChange={(e) => handleInputChange("vertical_repeat", e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="horizontal_repeat">Horizontal Repeat (cm)</Label>
              <Input
                id="horizontal_repeat"
                type="number"
                value={formData.horizontal_repeat}
                onChange={(e) => handleInputChange("horizontal_repeat", e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
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
            <div>
              <Label htmlFor="seam_hems">Seam Hems (cm)</Label>
              <Input
                id="seam_hems"
                type="number"
                step="0.5"
                value={formData.seam_hems}
                onChange={(e) => handleInputChange("seam_hems", e.target.value)}
                placeholder="1.5"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Note: Seam hems will increase fabric requirements if fabric width is insufficient
          </p>
        </CardContent>
      </Card>

      {/* Manufacturing Configuration - Returns, Headers, Waste */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manufacturing Configuration</CardTitle>
          <CardDescription>Customise fabric usage rules based on your manufacturing setup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TooltipProvider>
            {/* Return & Overlap Allowance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">1. Return & Overlap Allowance</h4>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Returns are the part of fabric that wraps to the wall at each end of the track.</p>
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
                  <p className="text-xs text-muted-foreground mt-1">For pairs only</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                These values will be added to the flat finished width
              </p>
            </div>

            <Separator />

            {/* Header & Bottom Hem Allowances */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">2. Header & Bottom Hem Allowances</h4>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Header is the pleat or tape section at the top. Typically 5–10 cm.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="bottom_hem_manufacturing">Bottom Hem (cm)</Label>
                  <Input
                    id="bottom_hem_manufacturing"
                    type="number"
                    step="0.5"
                    value={formData.bottom_hem}
                    onChange={(e) => handleInputChange("bottom_hem", e.target.value)}
                    placeholder="10"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                These values are added to the drop to get the cut length
              </p>
            </div>

            <Separator />

            {/* Waste Allowance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">3. Waste Allowance</h4>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a small waste % to avoid shortages due to cutting, matching, or human error.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="w-1/2">
                <Label htmlFor="waste_percent">Fabric Cutting Waste (%)</Label>
                <Input
                  id="waste_percent"
                  type="number"
                  step="0.1"
                  value={formData.waste_percent}
                  onChange={(e) => handleInputChange("waste_percent", e.target.value)}
                  placeholder="5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Applied at the very end of the calculation
                </p>
              </div>
            </div>

            <Separator />

            {/* Railroading Toggle */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">4. Railroading Option</h4>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>If enabled, app checks if curtain drop + header + hem is less than fabric width to allow railroading.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_railroadable"
                  checked={formData.is_railroadable}
                  onCheckedChange={(checked) => handleInputChange("is_railroadable", checked)}
                />
                <Label htmlFor="is_railroadable">Allow railroading with this fabric/template</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                When enabled, the system will check if railroading is possible and calculate accordingly
              </p>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Lining Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">2.4 Lining Options</CardTitle>
          <CardDescription>Configure available lining types and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["standard", "blackout", "thermal", "interlining"].map((liningType) => (
              <div key={liningType} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex-1">
                  <Label className="text-sm font-medium capitalize">{liningType} Lining</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price per metre"
                    className="w-32"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Labour per curtain"
                    className="w-32"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pooling Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">2.5 Pooling Settings</CardTitle>
          <CardDescription>Information about pooling options (configured later in projects)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Pooling options (Break, No Pooling, Puddle) will be selected during project configuration. 
              This template will support all pooling types by default.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hardware Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">2.6 Hardware Selection</CardTitle>
          <CardDescription>Select compatible hardware types from your library</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="compatible_hardware">Compatible Hardware Types</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select hardware types..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pole">Pole</SelectItem>
                <SelectItem value="track">Track</SelectItem>
                <SelectItem value="motorised">Motorised</SelectItem>
                <SelectItem value="bay_pole">Bay Pole</SelectItem>
                <SelectItem value="ceiling_fix">Ceiling Fix</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              Hardware compatibility will be automatically matched with heading styles (e.g., Wave needs track)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Make-Up Pricing Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">2.7 Make-Up Pricing Setup</CardTitle>
          <CardDescription>Configure how pricing is calculated for this template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pricing_type">Pricing Type</Label>
            <Select value={formData.pricing_type} onValueChange={(value) => handleInputChange("pricing_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select pricing method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_metre">Per Running Metre/Yard</SelectItem>
                <SelectItem value="per_drop">Per Drop/Panel</SelectItem>
                <SelectItem value="per_curtain">Per Curtain (Unit Price)</SelectItem>
                <SelectItem value="pricing_grid">From Pricing Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.pricing_type === "per_metre" && (
            <div className="space-y-3">
              <Label>Price Rules by Drop Range</Label>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-sm font-medium">
                  <span>Drop Range (cm)</span>
                  <span>From</span>
                  <span>Price per metre</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm text-muted-foreground">0 - 200 cm</span>
                  <Input placeholder="0" />
                  <Input placeholder="£20.00" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm text-muted-foreground">201 - 300 cm</span>
                  <Input placeholder="201" />
                  <Input placeholder="£25.00" />
                </div>
              </div>
            </div>
          )}

          {formData.pricing_type === "per_curtain" && (
            <div>
              <Label htmlFor="unit_price">Unit Price per Curtain</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => handleInputChange("unit_price", e.target.value)}
                placeholder="0.00"
              />
            </div>
          )}

          {formData.pricing_type === "pricing_grid" && (
            <div>
              <Label htmlFor="pricing_grid_file">Upload Pricing Grid (CSV/Excel)</Label>
              <Input
                id="pricing_grid_file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => handleInputChange("pricing_grid_file", e.target.files?.[0])}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Upload a file with width × drop matrix pricing
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manufacturing Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">2.8 Manufacturing Type</CardTitle>
          <CardDescription>Select manufacturing method and any additional costs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="manufacturing_type">Manufacturing Type</Label>
            <Select value={formData.manufacturing_type} onValueChange={(value) => handleInputChange("manufacturing_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select manufacturing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="machine">Machine Finished</SelectItem>
                <SelectItem value="hand">Hand Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.manufacturing_type === "hand" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hand_finished_upcharge_fixed">Hand-Finished Upcharge (Fixed)</Label>
                <Input
                  id="hand_finished_upcharge_fixed"
                  type="number"
                  step="0.01"
                  value={formData.hand_finished_upcharge_fixed}
                  onChange={(e) => handleInputChange("hand_finished_upcharge_fixed", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="hand_finished_upcharge_percentage">Hand-Finished Upcharge (%)</Label>
                <Input
                  id="hand_finished_upcharge_percentage"
                  type="number"
                  step="0.1"
                  value={formData.hand_finished_upcharge_percentage}
                  onChange={(e) => handleInputChange("hand_finished_upcharge_percentage", e.target.value)}
                  placeholder="0.0"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button onClick={handleSave} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {template ? "Update Template" : "Create Template"}
        </Button>
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};