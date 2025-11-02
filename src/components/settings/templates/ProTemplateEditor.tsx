import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, Save, Palette, Layout, Image as ImageIcon, FileText } from "lucide-react";
import { toast } from "sonner";
import { LivePreview } from "./visual-editor/LivePreview";
import { ProjectDataSelector } from "./ProjectDataSelector";
import { useTemplateData } from "@/hooks/useTemplateData";
import { supabase } from "@/integrations/supabase/client";
import { generateQuotePDF } from '@/utils/generateQuotePDF';

interface ProTemplateEditorProps {
  template: any;
  onSave?: (template: any) => void;
  onClose?: () => void;
}

export const ProTemplateEditor = ({ template, onSave, onClose }: ProTemplateEditorProps) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [useRealData, setUseRealData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  const { data: templateData } = useTemplateData(selectedProjectId, useRealData);
  
  // Document Layout Settings - Initialize from template if available (in millimeters)
  const [documentSettings, setDocumentSettings] = useState({
    pageSize: template.settings?.document?.pageSize || 'A4',
    orientation: template.settings?.document?.orientation || 'portrait',
    marginTop: template.settings?.document?.marginTop || 15,
    marginBottom: template.settings?.document?.marginBottom || 15,
    marginLeft: template.settings?.document?.marginLeft || 15,
    marginRight: template.settings?.document?.marginRight || 15,
  });

  // Products/Items Settings - Initialize from template if available
  const [productsSettings, setProductsSettings] = useState({
    showImages: template.settings?.products?.showImages ?? true,
    imageSize: template.settings?.products?.imageSize || 'medium',
    imagePosition: template.settings?.products?.imagePosition || 'left',
    showDetailedBreakdown: template.settings?.products?.showDetailedBreakdown ?? true,
    groupByRoom: template.settings?.products?.groupByRoom ?? false,
    showQuantity: template.settings?.products?.showQuantity ?? true,
    showUnitPrice: template.settings?.products?.showUnitPrice ?? true,
    showTotal: template.settings?.products?.showTotal ?? true,
  });

  // Typography Settings - Initialize from template if available
  const [typographySettings, setTypographySettings] = useState({
    headingSize: template.settings?.typography?.headingSize || 'large',
    bodySize: template.settings?.typography?.bodySize || 'medium',
    fontFamily: template.settings?.typography?.fontFamily || 'default',
  });

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    try {
      const updatedTemplate = {
        ...template,
        blocks: template.blocks.map((block: any) => {
          if (block.type === 'products') {
            return {
              ...block,
              content: {
                ...block.content,
                ...productsSettings,
              }
            };
          }
          return block;
        }),
        settings: {
          document: documentSettings,
          products: productsSettings,
          typography: typographySettings,
        }
      };

      const { error } = await supabase
        .from('quote_templates')
        .update({
          blocks: updatedTemplate.blocks,
          settings: updatedTemplate.settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', template.id);

      if (error) throw error;

      toast.success("Template saved successfully");
      onSave?.(updatedTemplate);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    const element = previewRef.current;
    if (!element) {
      toast.error("Preview not ready");
      return;
    }

    setIsExportingPDF(true);
    try {
      const filename = `${template.name.toLowerCase().replace(/\s+/g, '-')}-preview.pdf`;
      await generateQuotePDF(element, { 
        filename,
        margin: [documentSettings.marginTop, documentSettings.marginRight, documentSettings.marginBottom, documentSettings.marginLeft]
      });
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const getImageSizeValue = () => {
    const sizes = { small: 80, medium: 120, large: 180 };
    return sizes[productsSettings.imageSize as keyof typeof sizes];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Settings Panel - Left Side */}
      <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Template Settings</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExportingPDF ? 'Exporting...' : 'Test PDF'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveTemplate}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="layout" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="layout" className="text-xs">
                  <Layout className="h-3 w-3 mr-1" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="products" className="text-xs">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="style" className="text-xs">
                  <Palette className="h-3 w-3 mr-1" />
                  Style
                </TabsTrigger>
              </TabsList>

              {/* Layout Settings */}
              <TabsContent value="layout" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Page Size</Label>
                  <Select
                    value={documentSettings.pageSize}
                    onValueChange={(value) => setDocumentSettings({ ...documentSettings, pageSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                      <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
                      <SelectItem value="legal">Legal (8.5 × 14 in)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Orientation</Label>
                  <Select
                    value={documentSettings.orientation}
                    onValueChange={(value) => setDocumentSettings({ ...documentSettings, orientation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <Label className="text-sm font-semibold">Page Margins</Label>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Top</Label>
                      <span className="text-xs text-muted-foreground">{documentSettings.marginTop}mm</span>
                    </div>
                    <Slider
                      value={[documentSettings.marginTop]}
                      onValueChange={([value]) => setDocumentSettings({ ...documentSettings, marginTop: value })}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Bottom</Label>
                      <span className="text-xs text-muted-foreground">{documentSettings.marginBottom}mm</span>
                    </div>
                    <Slider
                      value={[documentSettings.marginBottom]}
                      onValueChange={([value]) => setDocumentSettings({ ...documentSettings, marginBottom: value })}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Left</Label>
                      <span className="text-xs text-muted-foreground">{documentSettings.marginLeft}mm</span>
                    </div>
                    <Slider
                      value={[documentSettings.marginLeft]}
                      onValueChange={([value]) => setDocumentSettings({ ...documentSettings, marginLeft: value })}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Right</Label>
                      <span className="text-xs text-muted-foreground">{documentSettings.marginRight}mm</span>
                    </div>
                    <Slider
                      value={[documentSettings.marginRight]}
                      onValueChange={([value]) => setDocumentSettings({ ...documentSettings, marginRight: value })}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Products Settings */}
              <TabsContent value="products" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Product Images</Label>
                  <Switch
                    checked={productsSettings.showImages}
                    onCheckedChange={(checked) => setProductsSettings({ ...productsSettings, showImages: checked })}
                  />
                </div>

                {productsSettings.showImages && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm">Image Size</Label>
                      <Select
                        value={productsSettings.imageSize}
                        onValueChange={(value) => setProductsSettings({ ...productsSettings, imageSize: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (80px)</SelectItem>
                          <SelectItem value="medium">Medium (120px)</SelectItem>
                          <SelectItem value="large">Large (180px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Image Position</Label>
                      <Select
                        value={productsSettings.imagePosition}
                        onValueChange={(value) => setProductsSettings({ ...productsSettings, imagePosition: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left of details</SelectItem>
                          <SelectItem value="right">Right of details</SelectItem>
                          <SelectItem value="top">Above details</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <Label className="text-sm">Detailed Breakdown</Label>
                  <Switch
                    checked={productsSettings.showDetailedBreakdown}
                    onCheckedChange={(checked) => setProductsSettings({ ...productsSettings, showDetailedBreakdown: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Group by Room</Label>
                  <Switch
                    checked={productsSettings.groupByRoom}
                    onCheckedChange={(checked) => setProductsSettings({ ...productsSettings, groupByRoom: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Quantity</Label>
                  <Switch
                    checked={productsSettings.showQuantity}
                    onCheckedChange={(checked) => setProductsSettings({ ...productsSettings, showQuantity: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Unit Price</Label>
                  <Switch
                    checked={productsSettings.showUnitPrice}
                    onCheckedChange={(checked) => setProductsSettings({ ...productsSettings, showUnitPrice: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Total</Label>
                  <Switch
                    checked={productsSettings.showTotal}
                    onCheckedChange={(checked) => setProductsSettings({ ...productsSettings, showTotal: checked })}
                  />
                </div>
              </TabsContent>

              {/* Style Settings */}
              <TabsContent value="style" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm">Font Family</Label>
                  <Select
                    value={typographySettings.fontFamily}
                    onValueChange={(value) => setTypographySettings({ ...typographySettings, fontFamily: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">System Default</SelectItem>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Heading Size</Label>
                  <Select
                    value={typographySettings.headingSize}
                    onValueChange={(value) => setTypographySettings({ ...typographySettings, headingSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Body Text Size</Label>
                  <Select
                    value={typographySettings.bodySize}
                    onValueChange={(value) => setTypographySettings({ ...typographySettings, bodySize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <div className="pt-4 border-t space-y-3">
              <Label className="text-sm font-medium">Preview Data</Label>
              <ProjectDataSelector
                selectedProjectId={selectedProjectId}
                onProjectIdChange={setSelectedProjectId}
                useRealData={useRealData}
                onUseRealDataChange={setUseRealData}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Panel - Right Side */}
      <div className="lg:col-span-2 flex flex-col">
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Live Preview</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {documentSettings.pageSize} • {documentSettings.orientation}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 overflow-auto h-full bg-muted/30">
            <div className="flex justify-center">
              <div 
                ref={previewRef}
                id="template-preview"
                className="bg-white shadow-lg"
                style={{
                  width: documentSettings.orientation === 'portrait' ? '210mm' : '297mm',
                  minHeight: documentSettings.orientation === 'portrait' ? '297mm' : '210mm',
                  padding: `${documentSettings.marginTop}px ${documentSettings.marginRight}px ${documentSettings.marginBottom}px ${documentSettings.marginLeft}px`,
                  boxSizing: 'border-box',
                  overflow: 'visible'
                }}
              >
                <LivePreview
                  blocks={template.blocks || []}
                  projectData={templateData}
                  isEditable={false}
                  isPrintMode={true}
                  showDetailedBreakdown={productsSettings.showDetailedBreakdown}
                  showImages={productsSettings.showImages}
                  groupByRoom={productsSettings.groupByRoom}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
