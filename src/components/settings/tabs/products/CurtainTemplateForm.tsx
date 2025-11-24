import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CurtainTemplate, useCreateCurtainTemplate, useUpdateCurtainTemplate } from "@/hooks/useCurtainTemplates";
import { TREATMENT_CATEGORIES } from "@/types/treatmentCategories";
import { SimplifiedTemplateFormPricing } from "./SimplifiedTemplateFormPricing";
import { SimplifiedTemplateFormManufacturing } from "./SimplifiedTemplateFormManufacturing";

interface CurtainTemplateFormProps {
  template?: CurtainTemplate;
  onClose: () => void;
}

export const CurtainTemplateForm = ({ template, onClose }: CurtainTemplateFormProps) => {
  const { toast } = useToast();
  const createTemplate = useCreateCurtainTemplate();
  const updateTemplate = useUpdateCurtainTemplate();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    image_url: (template as any)?.image_url || "",
    curtain_type: template?.curtain_type || "curtain",
    
    // Hidden system_type - auto-generated from curtain_type
    system_type: (template as any)?.system_type || "",
    
    // Heading/Options
    selected_heading_ids: template?.selected_heading_ids || [],
    
    // Pricing
    pricing_type: template?.pricing_type || "per_metre",
    unit_price: template?.unit_price?.toString() || "",
    machine_price_per_metre: template?.machine_price_per_metre?.toString() || "",
    
    // Manufacturing
    header_allowance: template?.header_allowance?.toString() || "8",
    bottom_hem: template?.bottom_hem?.toString() || "15",
    side_hems: template?.side_hems?.toString() || "7.5",
    seam_hems: template?.seam_hems?.toString() || "3",
    return_left: template?.return_left?.toString() || "7.5",
    return_right: template?.return_right?.toString() || "7.5",
    overlap: template?.overlap?.toString() || "10",
    waste_percent: template?.waste_percent?.toString() || "5",
    minimum_width: (template as any)?.minimum_width?.toString() || "30",
    maximum_width: (template as any)?.maximum_width?.toString() || "300",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      handleInputChange("image_url", publicUrl);
      
      toast({
        title: "Image uploaded",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        variant: "destructive",
      });
    }
  };

  const handleRemoveImage = () => {
    handleInputChange("image_url", "");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const templateData: any = {
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url,
        curtain_type: formData.curtain_type,
        system_type: formData.system_type || formData.curtain_type,
        selected_heading_ids: formData.selected_heading_ids,
        pricing_type: formData.pricing_type,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
        machine_price_per_metre: formData.machine_price_per_metre ? parseFloat(formData.machine_price_per_metre) : null,
        header_allowance: formData.header_allowance ? parseFloat(formData.header_allowance) : null,
        bottom_hem: formData.bottom_hem ? parseFloat(formData.bottom_hem) : null,
        side_hems: formData.side_hems ? parseFloat(formData.side_hems) : null,
        seam_hems: formData.seam_hems ? parseFloat(formData.seam_hems) : null,
        return_left: formData.return_left ? parseFloat(formData.return_left) : null,
        return_right: formData.return_right ? parseFloat(formData.return_right) : null,
        overlap: formData.overlap ? parseFloat(formData.overlap) : null,
        waste_percent: formData.waste_percent ? parseFloat(formData.waste_percent) : null,
        minimum_width: formData.minimum_width ? parseFloat(formData.minimum_width) : null,
        maximum_width: formData.maximum_width ? parseFloat(formData.maximum_width) : null,
        active: true,
      };

      if (template?.id) {
        await updateTemplate.mutateAsync({
          id: template.id,
          ...templateData,
        });
      } else {
        await createTemplate.mutateAsync(templateData);
      }

      toast({
        title: template ? "Updated" : "Created",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="heading">Heading</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label>Image</Label>
                <div className="space-y-2">
                  {formData.image_url ? (
                    <div className="relative inline-block">
                      <img 
                        src={formData.image_url} 
                        alt={formData.name || 'Product'}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="product_image"
                      />
                      <label htmlFor="product_image" className="cursor-pointer">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Type</Label>
                <Select value={formData.curtain_type} onValueChange={(value) => handleInputChange("curtain_type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TREATMENT_CATEGORIES).map((category) => (
                      <SelectItem key={category.singular} value={category.singular}>
                        {category.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heading" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Heading styles configuration</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4 mt-4">
          <SimplifiedTemplateFormPricing 
            formData={formData}
            template={template}
            handleInputChange={handleInputChange}
          />
        </TabsContent>

        <TabsContent value="manufacturing" className="space-y-4 mt-4">
          <SimplifiedTemplateFormManufacturing 
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 pt-4 border-t">
        <Button 
          onClick={handleSave} 
          className="flex-1"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {template ? "Update" : "Create"}
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
