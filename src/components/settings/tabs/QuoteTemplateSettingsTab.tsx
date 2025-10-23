import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { FileText, Image as ImageIcon, Settings, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const QuoteTemplateSettingsTab = () => {
  const { toast } = useToast();
  const { data: businessSettings } = useBusinessSettings();
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Build template blocks structure
      const blocks = [
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
            showTotal: templateData.showTotal
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

      <Tabs defaultValue="header" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
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
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Template Settings"}
        </Button>
      </div>
    </div>
  );
};
