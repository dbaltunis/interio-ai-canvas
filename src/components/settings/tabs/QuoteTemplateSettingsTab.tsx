import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { FileText, Image as ImageIcon, Settings, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PrintableQuote } from "@/components/jobs/quotation/PrintableQuote";

export const QuoteTemplateSettingsTab = () => {
  const { toast } = useToast();
  const { data: businessSettings } = useBusinessSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch active template
  const { data: activeTemplate, refetch } = useQuery({
    queryKey: ["active-quote-template"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_templates")
        .select("*")
        .eq("active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const [templateData, setTemplateData] = useState({
    // Document Layout
    orientation: 'portrait' as 'portrait' | 'landscape',
    marginTop: 8,
    marginRight: 8,
    marginBottom: 6,
    marginLeft: 8,
    imageSize: 80,
    imagePosition: 'left' as 'above' | 'center' | 'left',
    
    companyName: businessSettings?.company_name || "",
    companyAddress: businessSettings?.address || "",
    companyPhone: businessSettings?.business_phone || "",
    companyEmail: businessSettings?.business_email || "",
    companyWebsite: businessSettings?.website || "",
    logoUrl: businessSettings?.company_logo_url || "",
    
    // Header settings
    showLogo: true,
    documentTitle: "Professional Quotation",
    tagline: "Quality products, exceptional service",
    headerLayout: "centered", // centered, left-right, modern
    
    // Quote details
    showClientCompany: true,
    showClientEmail: true,
    showClientPhone: true,
    showClientAddress: true,
    
    // Items display
    showImages: true,
    showDetailedBreakdown: true,
    itemsLayout: "detailed", // simple, detailed, premium
    
    // Totals
    showSubtotal: true,
    showTax: true,
    showTotal: true,
    
    // Discount display
    showDiscountType: true,        // Show "Percentage" or "Fixed Amount"
    showDiscountAppliedTo: true,   // Show "All Items", "Fabrics Only", or "Specific Items"
    showDiscountAmount: true,      // Show the discount amount
    
    // Footer
    termsAndConditions: `Terms & Conditions:
1. Payment terms: 50% deposit required, balance due upon completion
2. Prices valid for 30 days from quote date
3. All measurements are approximate and subject to site verification
4. Installation included unless otherwise stated
5. Lead time: 4-6 weeks from deposit receipt`,
    showSignature: true,
    signatureLabel: "Authorized Signature",
    
    // Styling
    accentColor: "#3b82f6",
    fontFamily: "Helvetica",
  });

  // Load saved template data
  useEffect(() => {
    if (activeTemplate?.blocks && Array.isArray(activeTemplate.blocks)) {
      const newData = { ...templateData };
      
      activeTemplate.blocks.forEach((block: any) => {
        if (block.type === 'document-settings' && block.content) {
          newData.orientation = block.content.orientation || newData.orientation;
          newData.marginTop = block.content.marginTop ?? newData.marginTop;
          newData.marginRight = block.content.marginRight ?? newData.marginRight;
          newData.marginBottom = block.content.marginBottom ?? newData.marginBottom;
          newData.marginLeft = block.content.marginLeft ?? newData.marginLeft;
          newData.imageSize = block.content.imageSize ?? newData.imageSize;
          newData.imagePosition = block.content.imagePosition || newData.imagePosition;
        }
        if (block.type === 'document-header' && block.content) {
          newData.headerLayout = block.content.layout || newData.headerLayout;
          newData.showLogo = block.content.showLogo ?? newData.showLogo;
          newData.documentTitle = block.content.documentTitle || newData.documentTitle;
          newData.tagline = block.content.tagline || newData.tagline;
          newData.showClientCompany = block.content.showClientCompany ?? newData.showClientCompany;
          newData.showClientEmail = block.content.showClientEmail ?? newData.showClientEmail;
          newData.showClientPhone = block.content.showClientPhone ?? newData.showClientPhone;
          newData.showClientAddress = block.content.showClientAddress ?? newData.showClientAddress;
        }
        if (block.type === 'products' && block.content) {
          newData.showImages = block.content.showImages ?? newData.showImages;
          newData.itemsLayout = block.content.layout || newData.itemsLayout;
        }
        if (block.type === 'totals' && block.content) {
          newData.showSubtotal = block.content.showSubtotal ?? newData.showSubtotal;
          newData.showTax = block.content.showTax ?? newData.showTax;
          newData.showTotal = block.content.showTotal ?? newData.showTotal;
          newData.showDiscountType = block.content.showDiscountType ?? newData.showDiscountType;
          newData.showDiscountAppliedTo = block.content.showDiscountAppliedTo ?? newData.showDiscountAppliedTo;
          newData.showDiscountAmount = block.content.showDiscountAmount ?? newData.showDiscountAmount;
        }
        if (block.type === 'text' && block.content?.text) {
          newData.termsAndConditions = block.content.text;
        }
        if (block.type === 'signature' && block.content) {
          newData.showSignature = true;
          newData.signatureLabel = block.content.signatureLabel || newData.signatureLabel;
        }
      });
      
      setTemplateData(newData);
    }
  }, [activeTemplate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Build template blocks structure
      const blocks = [
        {
          id: "document-settings",
          type: "document-settings",
          content: {
            orientation: templateData.orientation,
            marginTop: templateData.marginTop,
            marginRight: templateData.marginRight,
            marginBottom: templateData.marginBottom,
            marginLeft: templateData.marginLeft,
            imageSize: templateData.imageSize,
            imagePosition: templateData.imagePosition
          }
        },
        {
          id: "header",
          type: "document-header",
          content: {
            layout: templateData.headerLayout,
            showLogo: templateData.showLogo,
            documentTitle: templateData.documentTitle,
            tagline: templateData.tagline,
            showClientCompany: templateData.showClientCompany,
            showClientEmail: templateData.showClientEmail,
            showClientPhone: templateData.showClientPhone,
            showClientAddress: templateData.showClientAddress,
          }
        },
        {
          id: "products",
          type: "products",
          content: {
            title: "Quote Items",
            showImages: templateData.showImages,
            layout: templateData.itemsLayout
          }
        },
        {
          id: "totals",
          type: "totals",
          content: {
            showSubtotal: templateData.showSubtotal,
            showTax: templateData.showTax,
            showTotal: templateData.showTotal,
            showDiscountType: templateData.showDiscountType,
            showDiscountAppliedTo: templateData.showDiscountAppliedTo,
            showDiscountAmount: templateData.showDiscountAmount
          }
        },
        {
          id: "terms",
          type: "text",
          content: {
            text: templateData.termsAndConditions,
            fontSize: 9
          }
        }
      ];

      if (templateData.showSignature) {
        blocks.push({
          id: "signature",
          type: "signature",
          content: {
            signatureLabel: templateData.signatureLabel,
            showDate: true,
            dateLabel: "Date"
          } as any
        });
      }

      if (activeTemplate) {
        // Update existing template
        const { error } = await supabase
          .from("quote_templates")
          .update({
            blocks,
            updated_at: new Date().toISOString()
          })
          .eq("id", activeTemplate.id);

        if (error) throw error;
      } else {
        // Create new template
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase
          .from("quote_templates")
          .insert({
            name: "Default Quote Template",
            blocks,
            active: true,
            user_id: user.id
          });

        if (error) throw error;
      }

      await refetch();
      
      toast({
        title: "Template Saved",
        description: "Your quote template settings have been updated successfully"
      });
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Quote Template Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure how your quotes appear to clients. These settings control the PDF layout and content.
        </p>
      </div>

      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="layout">
            <Settings className="h-4 w-4 mr-2" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="header">
            <FileText className="h-4 w-4 mr-2" />
            Header
          </TabsTrigger>
          <TabsTrigger value="items">
            <ImageIcon className="h-4 w-4 mr-2" />
            Items
          </TabsTrigger>
          <TabsTrigger value="footer">
            <Settings className="h-4 w-4 mr-2" />
            Footer
          </TabsTrigger>
          <TabsTrigger value="styling">
            <Eye className="h-4 w-4 mr-2" />
            Display
          </TabsTrigger>
          <TabsTrigger value="printing">
            <FileText className="h-4 w-4 mr-2" />
            Printing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Layout</CardTitle>
              <CardDescription>
                Configure page size, orientation, margins, and image settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Orientation */}
              <div className="space-y-2">
                <Label htmlFor="orientation">Document Orientation</Label>
                <Select 
                  value={templateData.orientation} 
                  onValueChange={(value: 'portrait' | 'landscape') => setTemplateData({ ...templateData, orientation: value })}
                >
                  <SelectTrigger id="orientation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait (210mm × 297mm)</SelectItem>
                    <SelectItem value="landscape">Landscape (297mm × 210mm)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Standard A4 size in selected orientation</p>
              </div>

              <Separator />

              {/* Margins */}
              <div className="space-y-4">
                <div>
                  <Label>Page Margins (mm)</Label>
                  <p className="text-sm text-muted-foreground mt-1">Adjust spacing around document content</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marginTop">Top</Label>
                    <Input
                      id="marginTop"
                      type="number"
                      min="0"
                      max="50"
                      value={templateData.marginTop}
                      onChange={(e) => setTemplateData({ ...templateData, marginTop: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marginRight">Right</Label>
                    <Input
                      id="marginRight"
                      type="number"
                      min="0"
                      max="50"
                      value={templateData.marginRight}
                      onChange={(e) => setTemplateData({ ...templateData, marginRight: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marginBottom">Bottom</Label>
                    <Input
                      id="marginBottom"
                      type="number"
                      min="0"
                      max="50"
                      value={templateData.marginBottom}
                      onChange={(e) => setTemplateData({ ...templateData, marginBottom: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marginLeft">Left</Label>
                    <Input
                      id="marginLeft"
                      type="number"
                      min="0"
                      max="50"
                      value={templateData.marginLeft}
                      onChange={(e) => setTemplateData({ ...templateData, marginLeft: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Product Images */}
              <div className="space-y-4">
                <div>
                  <Label>Product Image Settings</Label>
                  <p className="text-sm text-muted-foreground mt-1">Control how product images appear</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imagePosition">Image Position</Label>
                  <Select 
                    value={templateData.imagePosition} 
                    onValueChange={(value: 'above' | 'center' | 'left') => setTemplateData({ ...templateData, imagePosition: value })}
                  >
                    <SelectTrigger id="imagePosition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Above Product Name</SelectItem>
                      <SelectItem value="center">Center Aligned</SelectItem>
                      <SelectItem value="left">Left Side</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Choose where images appear relative to product details</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageSize">Image Size (px)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="imageSize"
                      type="range"
                      min="40"
                      max="200"
                      step="10"
                      value={templateData.imageSize}
                      onChange={(e) => setTemplateData({ ...templateData, imageSize: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-20 text-right bg-muted px-3 py-1 rounded">{templateData.imageSize}px</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Default: 80px • Range: 40px - 200px
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="header" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Header Configuration</CardTitle>
              <CardDescription>
                Control what appears at the top of your quotes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentTitle">Document Title</Label>
                <Input
                  id="documentTitle"
                  value={templateData.documentTitle}
                  onChange={(e) => setTemplateData({ ...templateData, documentTitle: e.target.value })}
                  placeholder="e.g., Professional Quotation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline (Optional)</Label>
                <Input
                  id="tagline"
                  value={templateData.tagline}
                  onChange={(e) => setTemplateData({ ...templateData, tagline: e.target.value })}
                  placeholder="e.g., Quality products, exceptional service"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Company Logo</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your logo from Business Settings
                  </p>
                </div>
                <Switch
                  checked={templateData.showLogo}
                  onCheckedChange={(checked) => setTemplateData({ ...templateData, showLogo: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Client Information to Display</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showClientCompany">Company Name</Label>
                    <Switch
                      id="showClientCompany"
                      checked={templateData.showClientCompany}
                      onCheckedChange={(checked) => setTemplateData({ ...templateData, showClientCompany: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showClientEmail">Email Address</Label>
                    <Switch
                      id="showClientEmail"
                      checked={templateData.showClientEmail}
                      onCheckedChange={(checked) => setTemplateData({ ...templateData, showClientEmail: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showClientPhone">Phone Number</Label>
                    <Switch
                      id="showClientPhone"
                      checked={templateData.showClientPhone}
                      onCheckedChange={(checked) => setTemplateData({ ...templateData, showClientPhone: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showClientAddress">Address</Label>
                    <Switch
                      id="showClientAddress"
                      checked={templateData.showClientAddress}
                      onCheckedChange={(checked) => setTemplateData({ ...templateData, showClientAddress: checked })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quote Items Display</CardTitle>
              <CardDescription>
                Configure how products and services appear in quotes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Product Images</Label>
                  <p className="text-sm text-muted-foreground">
                    Include fabric/material images in quotes
                  </p>
                </div>
                <Switch
                  checked={templateData.showImages}
                  onCheckedChange={(checked) => setTemplateData({ ...templateData, showImages: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Detailed Breakdown</Label>
                  <p className="text-sm text-muted-foreground">
                    Show fabric, lining, manufacturing costs separately
                  </p>
                </div>
                <Switch
                  checked={templateData.showDetailedBreakdown}
                  onCheckedChange={(checked) => setTemplateData({ ...templateData, showDetailedBreakdown: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Layout Style</Label>
                <p className="text-sm text-muted-foreground">
                  Choose how items are organized
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={templateData.itemsLayout === "simple" ? "default" : "outline"}
                    onClick={() => setTemplateData({ ...templateData, itemsLayout: "simple" })}
                    className="h-auto py-3"
                  >
                    <div className="text-center">
                      <div className="font-semibold">Simple</div>
                      <div className="text-xs">Name + Price</div>
                    </div>
                  </Button>
                  <Button
                    variant={templateData.itemsLayout === "detailed" ? "default" : "outline"}
                    onClick={() => setTemplateData({ ...templateData, itemsLayout: "detailed" })}
                    className="h-auto py-3"
                  >
                    <div className="text-center">
                      <div className="font-semibold">Detailed</div>
                      <div className="text-xs">Full Breakdown</div>
                    </div>
                  </Button>
                  <Button
                    variant={templateData.itemsLayout === "premium" ? "default" : "outline"}
                    onClick={() => setTemplateData({ ...templateData, itemsLayout: "premium" })}
                    className="h-auto py-3"
                  >
                    <div className="text-center">
                      <div className="font-semibold">Premium</div>
                      <div className="text-xs">Images + Details</div>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer & Terms</CardTitle>
              <CardDescription>
                Add terms, conditions, and signature sections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={templateData.termsAndConditions}
                  onChange={(e) => setTemplateData({ ...templateData, termsAndConditions: e.target.value })}
                  rows={10}
                  placeholder="Enter your terms and conditions..."
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Signature Section</Label>
                  <p className="text-sm text-muted-foreground">
                    Include a signature line in the quote
                  </p>
                </div>
                <Switch
                  checked={templateData.showSignature}
                  onCheckedChange={(checked) => setTemplateData({ ...templateData, showSignature: checked })}
                />
              </div>

              {templateData.showSignature && (
                <div className="space-y-2">
                  <Label htmlFor="signatureLabel">Signature Label</Label>
                  <Input
                    id="signatureLabel"
                    value={templateData.signatureLabel}
                    onChange={(e) => setTemplateData({ ...templateData, signatureLabel: e.target.value })}
                    placeholder="e.g., Authorized Signature"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="styling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
              <CardDescription>
                Control what information appears on your quotes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Display Totals</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showSubtotal">Subtotal</Label>
                    <Switch
                      id="showSubtotal"
                      checked={templateData.showSubtotal}
                      onCheckedChange={(checked) => setTemplateData({ ...templateData, showSubtotal: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showTax">Tax Amount</Label>
                    <Switch
                      id="showTax"
                      checked={templateData.showTax}
                      onCheckedChange={(checked) => setTemplateData({ ...templateData, showTax: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showTotal">Total</Label>
                    <Switch
                      id="showTotal"
                      checked={templateData.showTotal}
                      onCheckedChange={(checked) => setTemplateData({ ...templateData, showTotal: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <Label>Discount Display</Label>
                <p className="text-sm text-muted-foreground">
                  Control which discount information appears on quotes (shown in red)
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showDiscountType">Discount Type</Label>
                      <p className="text-xs text-muted-foreground">
                        Show "Percentage" or "Fixed Amount"
                      </p>
                    </div>
                    <Switch
                      id="showDiscountType"
                      checked={templateData.showDiscountType}
                      onCheckedChange={(checked) => setTemplateData({ ...templateData, showDiscountType: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showDiscountAppliedTo">Applied To</Label>
                      <p className="text-xs text-muted-foreground">
                        Show "All Items", "Fabrics Only", or "Specific Items"
                      </p>
                    </div>
                    <Switch
                      id="showDiscountAppliedTo"
                      checked={templateData.showDiscountAppliedTo}
                      onCheckedChange={(checked) => setTemplateData({ ...templateData, showDiscountAppliedTo: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showDiscountAmount">Discount Amount</Label>
                      <p className="text-xs text-muted-foreground">
                        Show the calculated discount value
                      </p>
                    </div>
                    <Switch
                      id="showDiscountAmount"
                      checked={templateData.showDiscountAmount}
                      onCheckedChange={(checked) => setTemplateData({ ...templateData, showDiscountAmount: checked })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="printing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Printing Configuration</CardTitle>
              <CardDescription>
                Set up how your quotes print and export to PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Perfect Printing Guide
                </h4>
                <div className="space-y-3 text-sm text-blue-900">
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[120px]">Paper Size:</span>
                    <span>A4 (210mm × 297mm)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[120px]">Orientation:</span>
                    <span>Portrait</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[120px]">Margins:</span>
                    <span>Top/Bottom: 15mm, Left/Right: 10mm</span>
                  </div>
                  <Separator className="bg-blue-300" />
                  <div>
                    <span className="font-semibold block mb-2">✅ Before Printing:</span>
                    <ul className="space-y-1 ml-4">
                      <li>• Enable "Print backgrounds" in browser print settings</li>
                      <li>• Set scaling to 100%</li>
                      <li>• Choose "All pages" to print complete quote</li>
                      <li>• Product images will print in full color</li>
                      <li>• Gradient headers and styling preserved</li>
                    </ul>
                  </div>
                  <Separator className="bg-blue-300" />
                  <div>
                    <span className="font-semibold block mb-2">💡 Pro Tips:</span>
                    <ul className="space-y-1 ml-4">
                      <li>• Use PDF download for digital sharing</li>
                      <li>• Print preview shows exact layout</li>
                      <li>• All customizations apply to both PDF and print</li>
                      <li>• Itemized breakdowns display beautifully</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                <h5 className="font-semibold text-amber-900 mb-2">📋 Quote Customization</h5>
                <p className="text-sm text-amber-800">
                  Use the <strong>Header</strong>, <strong>Items</strong>, <strong>Footer</strong>, and <strong>Display</strong> tabs above to customize what appears on your quotes. All changes apply automatically to both screen view and printing.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setShowPreview(true)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Document
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Template Settings"}
        </Button>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>
              Quote Preview - {templateData.orientation === 'portrait' ? 'Portrait' : 'Landscape'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center bg-muted p-6">
            <div 
              style={{
                transform: templateData.orientation === 'landscape' ? 'scale(0.6)' : 'scale(0.7)',
                transformOrigin: 'top center'
              }}
            >
              <PrintableQuote 
                blocks={[
                  {
                    type: 'document-settings',
                    content: {
                      orientation: templateData.orientation,
                      marginTop: templateData.marginTop,
                      marginRight: templateData.marginRight,
                      marginBottom: templateData.marginBottom,
                      marginLeft: templateData.marginLeft,
                      imageSize: templateData.imageSize,
                      imagePosition: templateData.imagePosition
                    }
                  },
                  {
                    type: 'document-header',
                    content: {
                      showLogo: templateData.showLogo,
                      documentTitle: templateData.documentTitle,
                      tagline: templateData.tagline
                    }
                  },
                  {
                    type: 'products',
                    content: {
                      showImages: templateData.showImages,
                      showDetailedBreakdown: templateData.showDetailedBreakdown
                    }
                  }
                ]}
                projectData={{
                  project: { name: 'Sample Project', job_number: 'QT-2024-001' },
                  client: { name: 'John Smith', email: 'john@example.com', phone: '(555) 123-4567' },
                  items: [
                    {
                      id: '1',
                      name: 'Roman Blind',
                      room: 'Living Room',
                      total_cost: 450,
                      image_url: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9',
                      children: [
                        { name: 'Fabric', total_cost: 280 },
                        { name: 'Labor', total_cost: 120 },
                        { name: 'Hardware', total_cost: 50 }
                      ]
                    }
                  ],
                  subtotal: 450,
                  taxAmount: 36,
                  total: 486,
                  currency: 'GBP'
                }}
                isPrintMode={true}
                showDetailedBreakdown={templateData.showDetailedBreakdown}
                showImages={templateData.showImages}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
