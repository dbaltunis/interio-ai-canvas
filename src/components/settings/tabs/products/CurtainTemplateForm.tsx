import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CurtainTemplateFormProps {
  template?: any;
  onClose: () => void;
}

export const CurtainTemplateForm = ({ template, onClose }: CurtainTemplateFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Basic Information
    name: template?.name || "",
    description: template?.description || "",
    
    // Curtain Type
    curtain_type: template?.curtain_type || "single",
    
    // Heading Style
    heading_name: template?.heading_name || "",
    fullness_ratio: template?.fullness_ratio || "2.0",
    extra_fabric_fixed: template?.extra_fabric_fixed || "",
    extra_fabric_percentage: template?.extra_fabric_percentage || "",
    heading_upcharge_per_metre: template?.heading_upcharge_per_metre || "",
    heading_upcharge_per_curtain: template?.heading_upcharge_per_curtain || "",
    glider_spacing: template?.glider_spacing || "",
    eyelet_spacing: template?.eyelet_spacing || "",
    
    // Fabric Requirements
    fabric_width_type: template?.fabric_width_type || "wide",
    vertical_repeat: template?.vertical_repeat || "",
    horizontal_repeat: template?.horizontal_repeat || "",
    fabric_direction: template?.fabric_direction || "standard",
    bottom_hem: template?.bottom_hem || "15",
    side_hems: template?.side_hems || "7.5",
    seam_hems: template?.seam_hems || "1.5",
    
    // Lining Options
    lining_types: template?.lining_types || [],
    
    // Hardware
    compatible_hardware: template?.compatible_hardware || [],
    
    // Make-Up Pricing
    pricing_type: template?.pricing_type || "per_metre",
    price_rules: template?.price_rules || [],
    unit_price: template?.unit_price || "",
    pricing_grid_file: template?.pricing_grid_file || null,
    
    // Manufacturing
    manufacturing_type: template?.manufacturing_type || "machine",
    hand_finished_upcharge_fixed: template?.hand_finished_upcharge_fixed || "",
    hand_finished_upcharge_percentage: template?.hand_finished_upcharge_percentage || ""
  });

  const handleInputChange = (field: string, value: string | any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement save logic with actual API
    console.log("Saving curtain template:", formData);
    
    toast({
      title: "Success",
      description: template ? "Template updated successfully" : "Template created successfully"
    });
    
    onClose();
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