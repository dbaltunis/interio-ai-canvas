import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Save, X, Upload, Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CurtainTemplate, useCreateCurtainTemplate, useUpdateCurtainTemplate } from "@/hooks/useCurtainTemplates";
import { TREATMENT_CATEGORIES } from "@/types/treatmentCategories";
import { SimplifiedTemplateFormPricing } from "./SimplifiedTemplateFormPricing";
import { SimplifiedTemplateFormManufacturing } from "./SimplifiedTemplateFormManufacturing";
import { HeadingStyleSelector } from "./HeadingStyleSelector";
import { TemplateOptionsManager } from "./TemplateOptionsManager";
import { TWCOptionsPreview } from "./TWCOptionsPreview";

interface PrefilledData {
  name: string;
  category: string;
  description: string;
  inventoryItemId: string;
}

interface CurtainTemplateFormProps {
  template?: CurtainTemplate;
  onClose: () => void;
  prefilledData?: PrefilledData | null;
}

export const CurtainTemplateForm = ({ template, onClose, prefilledData }: CurtainTemplateFormProps) => {
  const { toast } = useToast();
  const createTemplate = useCreateCurtainTemplate();
  const updateTemplate = useUpdateCurtainTemplate();
  const [isSaving, setIsSaving] = useState(false);
  const [linkedTWCProduct, setLinkedTWCProduct] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: template?.name || prefilledData?.name || "",
    description: template?.description || prefilledData?.description || "",
    image_url: (template as any)?.image_url || "",
    treatment_category: template?.treatment_category || prefilledData?.category || "curtains",
    
    // Hidden system_type - auto-generated from treatment_category
    system_type: (template as any)?.system_type || template?.treatment_category || "curtains",
    
    // Inventory item link for TWC products
    inventory_item_id: (template as any)?.inventory_item_id || prefilledData?.inventoryItemId || null,
    
    // Heading/Options
    selected_heading_ids: template?.selected_heading_ids || [],
    
    // Hand-finished toggle
    offers_hand_finished: template?.offers_hand_finished || false,
    
    // Pricing
    pricing_type: template?.pricing_type || "per_metre",
    unit_price: template?.unit_price?.toString() || "",
    machine_price_per_metre: template?.machine_price_per_metre?.toString() || "",
    hand_price_per_metre: template?.hand_price_per_metre?.toString() || "",
    machine_price_per_panel: template?.machine_price_per_panel?.toString() || "",
    hand_price_per_panel: template?.hand_price_per_panel?.toString() || "",
    height_price_ranges: template?.height_price_ranges || [],
    // Per Drop pricing fields
    machine_price_per_drop: (template as any)?.machine_price_per_drop?.toString() || "",
    hand_price_per_drop: (template as any)?.hand_price_per_drop?.toString() || "",
    drop_height_ranges: (template as any)?.drop_height_ranges || [],
    machine_drop_height_prices: (template as any)?.machine_drop_height_prices || [],
    hand_drop_height_prices: (template as any)?.hand_drop_height_prices || [],
    
    // Manufacturing
    header_allowance: template?.header_allowance?.toString() || "8",
    bottom_hem: template?.bottom_hem?.toString() || "15",
    side_hems: template?.side_hems?.toString() || "7.5",
    seam_hems: template?.seam_hems?.toString() || "3",
    return_left: template?.return_left?.toString() || "7.5",
    return_right: template?.return_right?.toString() || "7.5",
    overlap: template?.overlap?.toString() || "10",
    waste_percent: template?.waste_percent?.toString() || "5",
    // Size constraints (optional)
    minimum_width: (template as any)?.minimum_width?.toString() || "",
    maximum_width: (template as any)?.maximum_width?.toString() || "",
    minimum_height: (template as any)?.minimum_height?.toString() || "",
    maximum_height: (template as any)?.maximum_height?.toString() || "",
  });

  // Fetch linked TWC product data when template has inventory_item_id
  useEffect(() => {
    const fetchLinkedTWCProduct = async () => {
      const inventoryItemId = formData.inventory_item_id;
      if (!inventoryItemId) {
        setLinkedTWCProduct(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('enhanced_inventory_items')
          .select('id, name, sku, category, supplier, metadata')
          .eq('id', inventoryItemId)
          .single();

        if (error) throw error;

        // Check if it's a TWC product (has twc_item_number in metadata)
        const metadata = data?.metadata as Record<string, any> | null;
        if (metadata?.twc_item_number || data?.supplier?.toUpperCase() === 'TWC') {
          setLinkedTWCProduct(data);
        } else {
          setLinkedTWCProduct(null);
        }
      } catch (err) {
        console.error('Error fetching linked product:', err);
        setLinkedTWCProduct(null);
      }
    };

    fetchLinkedTWCProduct();
  }, [formData.inventory_item_id]);

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
        description: error.message || "Failed to upload image",
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
        treatment_category: formData.treatment_category,
        system_type: formData.system_type || formData.treatment_category,
        inventory_item_id: formData.inventory_item_id || null,
        selected_heading_ids: formData.selected_heading_ids,
        offers_hand_finished: formData.offers_hand_finished,
        pricing_type: formData.pricing_type,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
        machine_price_per_metre: formData.machine_price_per_metre ? parseFloat(formData.machine_price_per_metre) : null,
        hand_price_per_metre: formData.hand_price_per_metre ? parseFloat(formData.hand_price_per_metre) : null,
        machine_price_per_panel: formData.machine_price_per_panel ? parseFloat(formData.machine_price_per_panel) : null,
        hand_price_per_panel: formData.hand_price_per_panel ? parseFloat(formData.hand_price_per_panel) : null,
        height_price_ranges: formData.height_price_ranges,
        // Per Drop pricing fields
        machine_price_per_drop: formData.machine_price_per_drop ? parseFloat(formData.machine_price_per_drop) : null,
        hand_price_per_drop: formData.hand_price_per_drop ? parseFloat(formData.hand_price_per_drop) : null,
        drop_height_ranges: formData.drop_height_ranges,
        machine_drop_height_prices: formData.machine_drop_height_prices,
        hand_drop_height_prices: formData.hand_drop_height_prices,
        // Manufacturing
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
        minimum_height: formData.minimum_height ? parseFloat(formData.minimum_height) : null,
        maximum_height: formData.maximum_height ? parseFloat(formData.maximum_height) : null,
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
        title: "Failed to save template",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Determine which tabs to show based on treatment type
  // Curtains get Heading tab, Roman Blinds do NOT (they use lift systems/fold styles instead)
  const isCurtainOnly = formData.treatment_category === 'curtains';
  const isCurtainOrRoman = formData.treatment_category === 'curtains' || formData.treatment_category === 'roman_blinds';
  // Calculate visible tabs: Basic + Options + Pricing + (Heading for curtains) + (Manufacturing for curtains/romans)
  const visibleTabCount = 3 + (isCurtainOnly ? 1 : 0) + (isCurtainOrRoman ? 1 : 0);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className={`grid w-full grid-cols-${visibleTabCount}`}>
          <TabsTrigger value="basic">Basic</TabsTrigger>
          {isCurtainOnly && <TabsTrigger value="heading">Heading</TabsTrigger>}
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          {isCurtainOrRoman && <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>}
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
                <Select value={formData.treatment_category} onValueChange={(value) => handleInputChange("treatment_category", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TREATMENT_CATEGORIES).map((category) => (
                      <SelectItem key={category.db_value} value={category.db_value}>
                        {category.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* TWC Product Info - show when linked to TWC product */}
          {linkedTWCProduct && (
            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">Linked TWC Product</CardTitle>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    TWC
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Product:</span> {linkedTWCProduct.name}</p>
                  <p><span className="text-muted-foreground">Item #:</span> {(linkedTWCProduct.metadata as any)?.twc_item_number || linkedTWCProduct.sku}</p>
                  <p><span className="text-muted-foreground">Category:</span> {linkedTWCProduct.category}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isCurtainOnly && (
          <TabsContent value="heading" className="space-y-4 mt-4">
            <HeadingStyleSelector
              selectedHeadingIds={formData.selected_heading_ids}
              onSelectionChange={(ids) => handleInputChange("selected_heading_ids", ids)}
              curtainType={formData.treatment_category}
            />
          </TabsContent>
        )}

        <TabsContent value="options" className="space-y-4 mt-4">
          {/* TWC Options Preview - show when linked to TWC product */}
          {linkedTWCProduct && (linkedTWCProduct.metadata as any)?.twc_questions?.length > 0 && (
            <TWCOptionsPreview 
              twcQuestions={(linkedTWCProduct.metadata as any).twc_questions}
              productName={linkedTWCProduct.name}
              itemNumber={(linkedTWCProduct.metadata as any)?.twc_item_number || linkedTWCProduct.sku}
            />
          )}
          
          <TemplateOptionsManager 
            treatmentCategory={formData.treatment_category} 
            templateId={template?.id}
          />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4 mt-4">
          <SimplifiedTemplateFormPricing 
            formData={formData}
            template={template}
            handleInputChange={handleInputChange}
          />
        </TabsContent>

        {isCurtainOrRoman && (
          <TabsContent value="manufacturing" className="space-y-4 mt-4">
            <SimplifiedTemplateFormManufacturing 
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </TabsContent>
        )}
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
