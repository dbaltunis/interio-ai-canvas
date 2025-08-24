
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Plus, Eye, EyeOff, Palette, FileText } from "lucide-react";
import { StreamlinedEditor } from "./visual-editor/StreamlinedEditor";

interface VisualQuoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  template?: any;
  onSave: (template: any) => void;
}

const defaultBlocks = [
  {
    id: 'header',
    type: 'header',
    content: {
      showLogo: true,
      logoPosition: 'left',
      companyName: '{{company_name}}',
      companyAddress: '{{company_address}}',
      companyPhone: '{{company_phone}}',
      companyEmail: '{{company_email}}',
      customFields: [],
      style: { primaryColor: '#415e6b', textColor: '#575656' }
    },
    editable: true
  },
  {
    id: 'client-info',
    type: 'client-info',
    content: {
      title: 'Bill To:',
      showClientName: true,
      showClientEmail: true,
      showClientAddress: true,
      showClientPhone: true
    },
    editable: true
  },
  {
    id: 'intro-text',
    type: 'text',
    content: {
      text: 'Thank you for choosing our services. Please review the quote details below.',
      style: 'intro'
    },
    editable: true
  },
  {
    id: 'products-table',
    type: 'products',
    content: {
      layout: 'detailed',
      showProduct: true,
      showDescription: false,
      showQuantity: true,
      showUnitPrice: true,
      showTotal: true,
      showTax: false,
      tableStyle: 'bordered'
    },
    editable: true
  },
  {
    id: 'totals',
    type: 'totals',
    content: {
      showSubtotal: true,
      showTax: true,
      showTotal: true
    },
    editable: true
  },
  {
    id: 'terms',
    type: 'text',
    content: {
      text: 'Payment terms: Net 30 days. Quote valid for 30 days.',
      style: 'terms'
    },
    editable: true
  },
  {
    id: 'footer',
    type: 'footer',
    content: {
      text: 'Thank you for your business!',
      includeTerms: true
    },
    editable: true
  },
  {
    id: 'signature',
    type: 'signature',
    content: {
      showSignature: true,
      signatureLabel: 'Authorized Signature',
      showDate: true,
      dateLabel: 'Date',
      enableDigitalSignature: false
    },
    editable: true
  }
];

export const VisualQuoteEditor = ({ isOpen, onClose, template, onSave }: VisualQuoteEditorProps) => {
  const [templateName, setTemplateName] = useState(template?.name || "New Quote Template");
  const [blocks, setBlocks] = useState(template?.blocks || defaultBlocks);


  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    setIsSaving(true);
    try {
      // Try to get session first as it's more reliable
      const { data: { session } } = await supabase.auth.getSession();
      
      let userId = null;
      if (session?.user) {
        userId = session.user.id;
      } else {
        // Fallback to getUser
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('Please log in to save templates');
        }
        userId = user.id;
      }

      const templateData = {
        name: templateName,
        description: `Template with ${blocks.length} blocks`,
        template_style: 'detailed',
        blocks,
        user_id: userId
      };

      console.log('Saving template with blocks:', blocks.length, blocks.map(b => ({ id: b.id, type: b.type })));

      if (template?.id) {
        // Update existing template
        const { error } = await supabase
          .from('quote_templates')
          .update(templateData)
          .eq('id', template.id);
        
        if (error) throw error;
        alert('Template updated successfully!');
      } else {
        // Create new template
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
  }, [templateName, blocks, template, onSave, onClose]);

  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] h-[98vh] overflow-hidden p-0">
        {/* Header */}
        <div className="bg-background border-b px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-lg sm:text-xl font-semibold">
                Visual Quote Editor
              </DialogTitle>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                className="w-48 sm:w-64 h-8 sm:h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center gap-2 text-xs sm:text-sm"
                size="sm"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-full overflow-hidden">
          <StreamlinedEditor
            blocks={blocks}
            onBlocksChange={setBlocks}
            onSave={handleSave}
            templateName={templateName}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

function getDefaultContentForType(type: string) {
  switch (type) {
    case 'text':
      return { text: 'Enter your text here...', style: 'normal' };
    case 'image':
      return { src: '', alt: '', width: '100%', alignment: 'center' };
    case 'table':
      return { 
        rows: 3, 
        cols: 3, 
        headers: ['Column 1', 'Column 2', 'Column 3'],
        data: [
          ['Row 1, Col 1', 'Row 1, Col 2', 'Row 1, Col 3'],
          ['Row 2, Col 1', 'Row 2, Col 2', 'Row 2, Col 3']
        ]
      };
    case 'shape':
      return { 
        shapeType: 'rectangle', 
        width: '100px', 
        height: '100px', 
        fillColor: '#e2e8f0', 
        borderColor: '#64748b',
        borderWidth: '1px'
      };
    case 'products':
      return {
        layout: 'detailed',
        showProduct: true,
        showDescription: false,
        showQuantity: true,
        showUnitPrice: true,
        showTotal: true,
        showTax: false,
        tableStyle: 'bordered'
      };
    case 'signature':
      return {
        showSignature: true,
        signatureLabel: 'Authorized Signature',
        showDate: true,
        dateLabel: 'Date',
        enableDigitalSignature: false
      };
    case 'payment':
      return {
        paymentType: 'full',
        currency: '$',
        amount: '0.00',
        buttonText: 'Pay Now',
        description: 'Secure payment processing',
        showInstallments: false,
        securityText: '🔒 Secure SSL encrypted payment'
      };
    case 'footer':
      return {
        text: 'Thank you for your business!',
        includeTerms: true
      };
    case 'spacer':
      return {
        height: '40px',
        backgroundColor: 'transparent'
      };
    case 'divider':
      return {
        style: 'solid',
        color: '#e2e8f0',
        thickness: '1px',
        margin: '20px 0'
      };
    default:
      return {};
  }
}
