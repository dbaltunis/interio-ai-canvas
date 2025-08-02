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
    name: template?.name || "",
    description: template?.description || "",
    fabric_type: template?.fabric_type || "",
    heading_style: template?.heading_style || "",
    lining_type: template?.lining_type || "",
    width_multiplier: template?.width_multiplier || "2.0",
    drop_allowance: template?.drop_allowance || "15",
    base_price: template?.base_price || "",
    installation_fee: template?.installation_fee || ""
  });

  const handleInputChange = (field: string, value: string) => {
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
    <div className="space-y-6 py-4">
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

      {/* Curtain Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Curtain Specifications</CardTitle>
          <CardDescription>Technical details and fabric options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fabric_type">Fabric Type</Label>
            <Select value={formData.fabric_type} onValueChange={(value) => handleInputChange("fabric_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select fabric type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cotton">Cotton</SelectItem>
                <SelectItem value="polyester">Polyester</SelectItem>
                <SelectItem value="linen">Linen</SelectItem>
                <SelectItem value="silk">Silk</SelectItem>
                <SelectItem value="blackout">Blackout</SelectItem>
                <SelectItem value="sheer">Sheer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="heading_style">Heading Style</Label>
            <Select value={formData.heading_style} onValueChange={(value) => handleInputChange("heading_style", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select heading style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pencil_pleat">Pencil Pleat</SelectItem>
                <SelectItem value="eyelet">Eyelet</SelectItem>
                <SelectItem value="tab_top">Tab Top</SelectItem>
                <SelectItem value="rod_pocket">Rod Pocket</SelectItem>
                <SelectItem value="grommet">Grommet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="lining_type">Lining Type</Label>
            <Select value={formData.lining_type} onValueChange={(value) => handleInputChange("lining_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select lining type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Lining</SelectItem>
                <SelectItem value="standard">Standard Lining</SelectItem>
                <SelectItem value="thermal">Thermal Lining</SelectItem>
                <SelectItem value="blackout">Blackout Lining</SelectItem>
                <SelectItem value="interlining">Interlining</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Measurements & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Measurements & Pricing</CardTitle>
          <CardDescription>Default measurements and pricing structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width_multiplier">Width Multiplier</Label>
              <Input
                id="width_multiplier"
                type="number"
                step="0.1"
                value={formData.width_multiplier}
                onChange={(e) => handleInputChange("width_multiplier", e.target.value)}
                placeholder="2.0"
              />
            </div>
            <div>
              <Label htmlFor="drop_allowance">Drop Allowance (cm)</Label>
              <Input
                id="drop_allowance"
                type="number"
                value={formData.drop_allowance}
                onChange={(e) => handleInputChange("drop_allowance", e.target.value)}
                placeholder="15"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="base_price">Base Price (per m²)</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => handleInputChange("base_price", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="installation_fee">Installation Fee</Label>
              <Input
                id="installation_fee"
                type="number"
                step="0.01"
                value={formData.installation_fee}
                onChange={(e) => handleInputChange("installation_fee", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
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