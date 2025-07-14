import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { useProductTemplates } from "@/hooks/useProductTemplates";
import { useComponentOptions } from "@/hooks/useComponentOptions";
import { usePricingGrids } from "@/hooks/usePricingGrids";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ProductTemplatesTab = () => {
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    product_type: "",
    product_category: "",
    window_covering_id: "",
    calculationMethod: "fabric_area",
    pricingUnit: "per-sq-meter",
    selectedPricingGrid: "",
    baseMakingCost: "",
    baseHeightLimit: "2.4",
    useHeightSurcharges: false,
    complexityMultiplier: "standard",
    showComplexityOption: true,
    heightSurcharge1: "",
    heightSurcharge2: "",
    heightSurcharge3: "",
    heightRange1Start: "2.4",
    heightRange1End: "3.0",
    heightRange2Start: "3.0",
    heightRange2End: "4.0",
    heightRange3Start: "4.0",
    selectedComponents: {
      headings: {},
      lining: {},
      hardware: {},
      parts: {},
      trimming: {},
      service: {}
    },
    requiredComponents: {
      headings: [],
      lining: [],
      hardware: [],
      parts: [],
      trimming: [],
      service: []
    },
    calculationRules: {
      baseMakingCost: 0,
      markup_percentage: 40,
      labor_rate: 45
    },
    measurementRequirements: {}
  });

  const { windowCoverings, isLoading: windowCoveringsLoading } =
    useWindowCoverings();
  const {
    templates,
    isLoading: templatesLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate
  } = useProductTemplates();
  const { components, isLoading: componentsLoading } = useComponentOptions();
  const { data: pricingGrids, isLoading: pricingGridsLoading } =
    usePricingGrids();
  const { data: businessSettings } = useBusinessSettings();

  useEffect(() => {
    if (businessSettings) {
      setFormData(prev => ({
        ...prev,
        calculationRules: {
          ...prev.calculationRules,
          labor_rate: parseFloat(businessSettings?.labor_rate?.toString() || "45")
        }
      }));
    }
  }, [businessSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (
    name: string,
    value: string,
    windowCoveringId?: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      window_covering_id: windowCoveringId || prev.window_covering_id
    }));
  };

  const handleComponentChange = (
    category: string,
    componentId: string,
    isChecked: boolean,
    isRequired: boolean
  ) => {
    setFormData(prev => {
      const updatedSelectedComponents = {
        ...prev.selectedComponents,
        [category]: {
          ...prev.selectedComponents[category],
          [componentId]: isChecked
        }
      };

      const updatedRequiredComponents = {
        ...prev.requiredComponents,
        [category]: isRequired
          ? [...(prev.requiredComponents[category] || []), componentId]
          : (prev.requiredComponents[category] || []).filter(
              id => id !== componentId
            )
      };

      return {
        ...prev,
        selectedComponents: updatedSelectedComponents,
        requiredComponents: updatedRequiredComponents
      };
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      setIsSaving(true);

      // Build calculation rules object with pricing grid reference
      const calculationRules = {
        baseMakingCost: parseFloat(formData.baseMakingCost) || 0,
        markup_percentage: 40,
        labor_rate: parseFloat(businessSettings?.labor_rate?.toString() || "45"),
        baseHeightLimit: parseFloat(formData.baseHeightLimit) || 2.4,
        useHeightSurcharges: formData.useHeightSurcharges,
        complexityMultiplier: formData.complexityMultiplier,
        heightSurcharge1: parseFloat(formData.heightSurcharge1) || 0,
        heightSurcharge2: parseFloat(formData.heightSurcharge2) || 0,
        heightSurcharge3: parseFloat(formData.heightSurcharge3) || 0,
        heightRange1Start: parseFloat(formData.heightRange1Start) || 2.4,
        heightRange1End: parseFloat(formData.heightRange1End) || 3.0,
        heightRange2Start: parseFloat(formData.heightRange2Start) || 3.0,
        heightRange2End: parseFloat(formData.heightRange2End) || 4.0,
        heightRange3Start: parseFloat(formData.heightRange3Start) || 4.0,
        // Save the selected pricing grid ID
        selectedPricingGrid: formData.selectedPricingGrid || null
      };

      const templateData = {
        name: formData.name,
        description: formData.description,
        product_type: formData.product_type,
        product_category: formData.product_category,
        calculation_method: formData.calculationMethod,
        pricing_unit: formData.pricingUnit,
        calculation_rules: calculationRules,
        // Also save pricing grid ID at template level for easier access
        pricing_grid_id: formData.selectedPricingGrid || null,
        components: {
          headings: formData.selectedComponents.headings || {},
          lining: formData.selectedComponents.lining || {},
          hardware: formData.selectedComponents.hardware || {},
          parts: formData.selectedComponents.parts || {},
          trimming: formData.selectedComponents.trimming || {},
          service: formData.selectedComponents.service || {}
        },
        measurement_requirements: formData.measurementRequirements,
        active: true
      };

      console.log("Saving template with pricing grid:", {
        templateData,
        selectedPricingGrid: formData.selectedPricingGrid
      });

      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          updates: templateData
        });
        toast.success("Template updated successfully");
      } else {
        await createTemplate.mutateAsync(templateData);
        toast.success("Template created successfully");
      }

      handleCancel();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setFormData({
      name: "",
      description: "",
      product_type: "",
      product_category: "",
      window_covering_id: "",
      calculationMethod: "fabric_area",
      pricingUnit: "per-sq-meter",
      selectedPricingGrid: "",
      baseMakingCost: "",
      baseHeightLimit: "2.4",
      useHeightSurcharges: false,
      complexityMultiplier: "standard",
      showComplexityOption: true,
      heightSurcharge1: "",
      heightSurcharge2: "",
      heightSurcharge3: "",
      heightRange1Start: "2.4",
      heightRange1End: "3.0",
      heightRange2Start: "3.0",
      heightRange2End: "4.0",
      heightRange3Start: "4.0",
      selectedComponents: {
        headings: {},
        lining: {},
        hardware: {},
        parts: {},
        trimming: {},
        service: {}
      },
      requiredComponents: {
        headings: [],
        lining: [],
        hardware: [],
        parts: [],
        trimming: [],
        service: []
      },
      calculationRules: {
        baseMakingCost: 0,
        markup_percentage: 40,
        labor_rate: 45
      },
      measurementRequirements: {}
    });
  };

  const handleDelete = async (templateId: string) => {
    try {
      await deleteTemplate.mutateAsync(templateId);
      toast.success("Template deleted successfully");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    
    // Extract selected components
    const selectedComponents = {
      headings: template.components?.headings || {},
      lining: template.components?.lining || {},
      hardware: template.components?.hardware || {},
      parts: template.components?.parts || {},
      trimming: template.components?.trimming || {},
      service: template.components?.service || {}
    };
    
    // Extract required components
    const requiredComponents = {
      headings: [],
      lining: [],
      hardware: [],
      parts: [],
      trimming: [],
      service: []
    };
    
    // Extract values with proper fallbacks - FIXED pricing grid loading
    const baseMakingCost = template.baseMakingCost || template.calculation_rules?.baseMakingCost || "";
    const baseHeightLimit = template.baseHeightLimit || template.calculation_rules?.baseHeightLimit || "2.4";
    const heightSurcharge1 = template.heightSurcharge1 || template.calculation_rules?.heightSurcharge1 || "";
    const heightSurcharge2 = template.heightSurcharge2 || template.calculation_rules?.heightSurcharge2 || "";
    const heightSurcharge3 = template.heightSurcharge3 || template.calculation_rules?.heightSurcharge3 || "";
    
    // FIXED: Load selectedPricingGrid from multiple possible locations
    const selectedPricingGrid = template.pricing_grid_id || 
                                template.calculation_rules?.selectedPricingGrid || 
                                template.selectedPricingGrid || "";
    
    console.log("Loading template for edit:", {
      templateId: template.id,
      selectedPricingGrid,
      pricingGridId: template.pricing_grid_id,
      calculationRules: template.calculation_rules
    });
    
    setFormData({
      name: template.name || "",
      description: template.description || "",
      product_type: template.product_type || "",
      product_category: template.product_category || "",
      window_covering_id: windowCoverings.find(wc => wc.name === template.product_type)?.id || "",
      calculationMethod: template.calculation_method || "",
      pricingUnit: template.pricing_unit || "",
      selectedPricingGrid: selectedPricingGrid, // FIXED: Use the properly extracted value
      baseMakingCost: baseMakingCost.toString(),
      baseHeightLimit: baseHeightLimit.toString(),
      useHeightSurcharges: template.useHeightSurcharges || template.calculation_rules?.useHeightSurcharges || false,
      complexityMultiplier: template.complexityMultiplier || template.calculation_rules?.complexityMultiplier || "standard",
      showComplexityOption: template.showComplexityOption !== false,
      heightSurcharge1: heightSurcharge1.toString(),
      heightSurcharge2: heightSurcharge2.toString(),
      heightSurcharge3: heightSurcharge3.toString(),
      heightRange1Start: (template.heightRange1Start || template.calculation_rules?.heightRange1Start || "2.4").toString(),
      heightRange1End: (template.heightRange1End || template.calculation_rules?.heightRange1End || "3.0").toString(),
      heightRange2Start: (template.heightRange2Start || template.calculation_rules?.heightRange2Start || "3.0").toString(),
      heightRange2End: (template.heightRange2End || template.calculation_rules?.heightRange2End || "4.0").toString(),
      heightRange3Start: (template.heightRange3Start || template.calculation_rules?.heightRange3Start || "4.0").toString(),
      selectedComponents: selectedComponents,
      requiredComponents: requiredComponents,
      calculationRules: {
        baseMakingCost: parseFloat(baseMakingCost.toString()) || 0,
        markup_percentage: 40,
        labor_rate: 45
      },
      measurementRequirements: template.measurement_requirements || {}
    });
    
    setShowForm(true);
  };

  if (windowCoveringsLoading || templatesLoading || componentsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Templates</CardTitle>
          <CardDescription>Loading templates...</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
          <Separator />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Product Templates</CardTitle>
          <CardDescription>
            Manage product templates for different window coverings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowForm(true)}>Add Template</Button>
        </CardContent>
      </Card>

      <Table>
        <TableCaption>A list of your product templates.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Product Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Calculation Method</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates?.map(template => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>{template.product_type}</TableCell>
              <TableCell>{template.product_category}</TableCell>
              <TableCell>{template.calculation_method}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(template)}
                >
                  Edit
                </Button>{" "}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        the template and remove its data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(template.id)}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>
              {templates?.length} template(s) in total
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTemplate ? "Edit Template" : "Add Template"}</CardTitle>
            <CardDescription>
              {editingTemplate
                ? "Edit the details of the selected template."
                : "Create a new product template."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleTextareaChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_type">Product Type</Label>
                <Select
                  value={formData.window_covering_id}
                  onValueChange={value => {
                    const windowCovering = windowCoverings.find(
                      wc => wc.id === value
                    );
                    handleSelectChange(
                      "product_type",
                      windowCovering?.name || "",
                      value
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {windowCoverings.map(wc => (
                      <SelectItem key={wc.id} value={wc.id}>
                        {wc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="product_category">Product Category</Label>
                <Input
                  type="text"
                  id="product_category"
                  name="product_category"
                  value={formData.product_category}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calculationMethod">Calculation Method</Label>
                <Select
                  value={formData.calculationMethod}
                  onValueChange={value =>
                    handleSelectChange("calculationMethod", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select calculation method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fabric_area">Fabric Area</SelectItem>
                    <SelectItem value="pricing_grid">Pricing Grid</SelectItem>
                    {/* <SelectItem value="complex">Complex</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>

              {formData.calculationMethod === "pricing_grid" && (
                <div>
                  <Label htmlFor="selectedPricingGrid">Pricing Grid</Label>
                  <Select
                    value={formData.selectedPricingGrid}
                    onValueChange={value =>
                      handleSelectChange("selectedPricingGrid", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing grid" />
                    </SelectTrigger>
                    <SelectContent>
                      {pricingGrids?.map(grid => (
                        <SelectItem key={grid.id} value={grid.id}>
                          {grid.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="pricingUnit">Pricing Unit</Label>
                <Select
                  value={formData.pricingUnit}
                  onValueChange={value => handleSelectChange("pricingUnit", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-sq-meter">Per Square Meter</SelectItem>
                    <SelectItem value="per-linear-meter">
                      Per Linear Meter
                    </SelectItem>
                    <SelectItem value="per-unit">Per Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baseMakingCost">Base Making Cost</Label>
                <Input
                  type="number"
                  id="baseMakingCost"
                  name="baseMakingCost"
                  value={formData.baseMakingCost}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <h3>Height Surcharges</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="baseHeightLimit">Base Height Limit (m)</Label>
                <Input
                  type="number"
                  id="baseHeightLimit"
                  name="baseHeightLimit"
                  value={formData.baseHeightLimit}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="useHeightSurcharges">Use Height Surcharges</Label>
                <Switch
                  id="useHeightSurcharges"
                  name="useHeightSurcharges"
                  checked={formData.useHeightSurcharges}
                  onCheckedChange={checked =>
                    setFormData(prev => ({ ...prev, useHeightSurcharges: checked }))
                  }
                />
              </div>
              {formData.useHeightSurcharges && (
                <div>
                  <Label htmlFor="complexityMultiplier">Complexity Multiplier</Label>
                  <Select
                    value={formData.complexityMultiplier}
                    onValueChange={value =>
                      handleSelectChange("complexityMultiplier", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select complexity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="complex">Complex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {formData.useHeightSurcharges && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="heightSurcharge1">Height Surcharge 1</Label>
                  <Input
                    type="number"
                    id="heightSurcharge1"
                    name="heightSurcharge1"
                    value={formData.heightSurcharge1}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="heightSurcharge2">Height Surcharge 2</Label>
                  <Input
                    type="number"
                    id="heightSurcharge2"
                    name="heightSurcharge2"
                    value={formData.heightSurcharge2}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="heightSurcharge3">Height Surcharge 3</Label>
                  <Input
                    type="number"
                    id="heightSurcharge3"
                    name="heightSurcharge3"
                    value={formData.heightSurcharge3}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {formData.useHeightSurcharges && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="heightRange1Start">Height Range 1 Start (m)</Label>
                  <Input
                    type="number"
                    id="heightRange1Start"
                    name="heightRange1Start"
                    value={formData.heightRange1Start}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="heightRange1End">Height Range 1 End (m)</Label>
                  <Input
                    type="number"
                    id="heightRange1End"
                    name="heightRange1End"
                    value={formData.heightRange1End}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="heightRange2Start">Height Range 2 Start (m)</Label>
                  <Input
                    type="number"
                    id="heightRange2Start"
                    name="heightRange2Start"
                    value={formData.heightRange2Start}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {formData.useHeightSurcharges && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="heightRange2End">Height Range 2 End (m)</Label>
                  <Input
                    type="number"
                    id="heightRange2End"
                    name="heightRange2End"
                    value={formData.heightRange2End}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="heightRange3Start">Height Range 3 Start (m)</Label>
                  <Input
                    type="number"
                    id="heightRange3Start"
                    name="heightRange3Start"
                    value={formData.heightRange3Start}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            <h3>Components</h3>
            <Card>
              <CardHeader>
                <CardTitle>Select Components</CardTitle>
                <CardDescription>
                  Choose which components are included in this product template.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                    {components &&
                      Object.entries(components).map(
                        ([category, componentList]) => (
                          <div key={category} className="space-y-2">
                            <h4>{category}</h4>
                            <div className="space-y-1">
                              {componentList.map(component => (
                                <div
                                  key={component.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`${category}-${component.id}`}
                                    checked={
                                      formData.selectedComponents[category]?.[
                                        component.id
                                      ] || false
                                    }
                                    onCheckedChange={checked =>
                                      handleComponentChange(
                                        category,
                                        component.id,
                                        checked === true,
                                        component.is_required
                                      )
                                    }
                                  />
                                  <div className="flex items-center">
                                    <Label
                                      htmlFor={`${category}-${component.id}`}
                                      className={component.is_required ? "font-bold" : ""}
                                    >
                                      {component.name}
                                    </Label>
                                    {component.is_required && (
                                      <span className="ml-1 text-xs text-gray-500">
                                        (Required)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} isLoading={isSaving}>
                {isSaving ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
