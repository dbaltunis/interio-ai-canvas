import React, { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Eye, Settings } from "lucide-react";
import { TemplateStylingControls } from "./TemplateStylingControls";
import { supabase } from "@/integrations/supabase/client";

interface SimpleQuoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  template?: any;
  onSave: (template: any) => void;
}

interface QuoteBlockSettings {
  showCompanyHeader: boolean;
  showLogo: boolean;
  showClientInfo: boolean;
  showQuoteItems: boolean;
  itemsLayout: 'simple' | 'detailed';
  showTotals: boolean;
  showFooter: boolean;
  customIntroText: string;
  customFooterText: string;
  paymentTerms: string;
}

const defaultBlockSettings: QuoteBlockSettings = {
  showCompanyHeader: true,
  showLogo: true,
  showClientInfo: true,
  showQuoteItems: true,
  itemsLayout: 'simple',
  showTotals: true,
  showFooter: true,
  customIntroText: '',
  customFooterText: 'Thank you for choosing our services!',
  paymentTerms: 'Payment terms: Net 30 days. Quote valid for 30 days.'
};

export const SimpleQuoteEditor = ({ isOpen, onClose, template, onSave }: SimpleQuoteEditorProps) => {
  const [templateName, setTemplateName] = useState(template?.name || "New Quote Template");
  const [blockSettings, setBlockSettings] = useState<QuoteBlockSettings>(
    template?.blockSettings || defaultBlockSettings
  );
  const [templateStyling, setTemplateStyling] = useState(template?.styling || {});
  const [activeTab, setActiveTab] = useState<'blocks' | 'styling' | 'preview'>('blocks');
  const [isSaving, setIsSaving] = useState(false);

  const updateBlockSetting = useCallback((key: keyof QuoteBlockSettings, value: any) => {
    setBlockSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const templateData = {
        name: templateName,
        description: `Simple quote template`,
        template_type: 'simple',
        blockSettings,
        styling: templateStyling,
        user_id: user.id
      };

      if (template?.id) {
        // Update existing template - use quote_templates table for now
        const { error } = await supabase
          .from('quote_templates')
          .update(templateData)
          .eq('id', template.id);
        
        if (error) throw error;
        alert('Template updated successfully!');
      } else {
        // Create new template - use quote_templates table for now
        const { error } = await supabase
          .from('quote_templates')
          .insert([templateData]);
        
        if (error) throw error;
        alert('Template saved successfully!');
      }

      onSave(templateData);
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      alert(`Failed to save template: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [templateName, blockSettings, templateStyling, template, onSave, onClose]);

  const renderBlocksTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="company-header">Company Header</Label>
            <Switch
              id="company-header"
              checked={blockSettings.showCompanyHeader}
              onCheckedChange={(checked) => updateBlockSetting('showCompanyHeader', checked)}
            />
          </div>
          
          {blockSettings.showCompanyHeader && (
            <div className="ml-4 pt-2 border-l-2 border-gray-100 pl-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-logo">Show Company Logo</Label>
                <Switch
                  id="show-logo"
                  checked={blockSettings.showLogo}
                  onCheckedChange={(checked) => updateBlockSetting('showLogo', checked)}
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="client-info">Client Information</Label>
            <Switch
              id="client-info"
              checked={blockSettings.showClientInfo}
              onCheckedChange={(checked) => updateBlockSetting('showClientInfo', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="quote-items">Quote Items Table</Label>
              <Switch
                id="quote-items"
                checked={blockSettings.showQuoteItems}
                onCheckedChange={(checked) => updateBlockSetting('showQuoteItems', checked)}
              />
            </div>
            
            {blockSettings.showQuoteItems && (
              <div className="ml-4 pt-2 border-l-2 border-gray-100 pl-4">
                <Label>Table Layout</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={blockSettings.itemsLayout === 'simple' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateBlockSetting('itemsLayout', 'simple')}
                  >
                    Simple
                  </Button>
                  <Button
                    variant={blockSettings.itemsLayout === 'detailed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateBlockSetting('itemsLayout', 'detailed')}
                  >
                    Detailed
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="totals">Totals Section</Label>
            <Switch
              id="totals"
              checked={blockSettings.showTotals}
              onCheckedChange={(checked) => updateBlockSetting('showTotals', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="footer">Footer</Label>
            <Switch
              id="footer"
              checked={blockSettings.showFooter}
              onCheckedChange={(checked) => updateBlockSetting('showFooter', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="intro-text">Introduction Text (optional)</Label>
            <Textarea
              id="intro-text"
              placeholder="Enter custom introduction text..."
              value={blockSettings.customIntroText}
              onChange={(e) => updateBlockSetting('customIntroText', e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="footer-text">Footer Message</Label>
            <Textarea
              id="footer-text"
              placeholder="Thank you message..."
              value={blockSettings.customFooterText}
              onChange={(e) => updateBlockSetting('customFooterText', e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="payment-terms">Payment Terms</Label>
            <Textarea
              id="payment-terms"
              placeholder="Payment terms and conditions..."
              value={blockSettings.paymentTerms}
              onChange={(e) => updateBlockSetting('paymentTerms', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStylingTab = () => (
    <TemplateStylingControls
      data={templateStyling}
      onChange={setTemplateStyling}
    />
  );

  const renderPreviewTab = () => (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="bg-white p-8 shadow-sm border rounded max-w-4xl mx-auto">
        <div className="text-center text-gray-500 py-12">
          <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Live Preview</h3>
          <p className="text-sm">Preview will show your template with sample data</p>
          <Button variant="outline" className="mt-4">
            Generate Preview
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Simple Quote Editor
              </DialogTitle>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                className="w-64 h-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex h-full overflow-hidden">
          <div className="w-80 border-r bg-background">
            <div className="p-4 space-y-2">
              <Button
                variant={activeTab === 'blocks' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('blocks')}
              >
                Document Blocks
              </Button>
              <Button
                variant={activeTab === 'styling' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('styling')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Styling
              </Button>
              <Button
                variant={activeTab === 'preview' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('preview')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'blocks' && renderBlocksTab()}
            {activeTab === 'styling' && renderStylingTab()}
            {activeTab === 'preview' && renderPreviewTab()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};