import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Wand2, Palette, FileText, DollarSign } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DynamicTemplateGeneratorProps {
  onTemplateGenerated: (template: any) => void;
  businessData?: any;
  projectData?: any;
}

export const DynamicTemplateGenerator: React.FC<DynamicTemplateGeneratorProps> = ({
  onTemplateGenerated,
  businessData,
  projectData
}) => {
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('quote');
  const [businessType, setBusinessType] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [designStyle, setDesignStyle] = useState('');
  const [customRequirements, setCustomRequirements] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const templateTypes = [
    { value: 'quote', label: 'Quote', description: 'For providing pricing estimates', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'invoice', label: 'Invoice', description: 'For billing completed work', icon: <FileText className="h-4 w-4" /> },
    { value: 'proposal', label: 'Proposal', description: 'For detailed project proposals', icon: <Palette className="h-4 w-4" /> },
    { value: 'work-order', label: 'Work Order', description: 'For installation instructions', icon: <Wand2 className="h-4 w-4" /> }
  ];

  const businessTypes = [
    'Interior Design Studio',
    'Window Treatment Specialist', 
    'Curtain & Blind Shop',
    'Custom Drapery Service',
    'Home Decor Consultant',
    'Commercial Interior Design',
    'Residential Design Service',
    'Fabric & Upholstery Shop'
  ];

  const targetAudiences = [
    'Luxury Residential Clients',
    'Budget-Conscious Homeowners', 
    'Commercial Businesses',
    'Property Developers',
    'Interior Designers',
    'Real Estate Agents',
    'Rental Property Owners',
    'New Home Builders'
  ];

  const designStyles = [
    'Modern & Minimalist',
    'Classic & Professional',
    'Elegant & Luxury',
    'Fun & Creative',
    'Bold & Colorful',
    'Clean & Corporate'
  ];

  const generateSmartTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (!templateType || !designStyle) {
      toast.error('Please select template type and design style');
      return;
    }

    setIsGenerating(true);

    try {
      // Create a comprehensive prompt for AI
      const prompt = `Create a ${templateType} template for a ${businessType || 'window treatment business'} targeting ${targetAudience || 'residential clients'} with ${designStyle} design style.

Business Context:
- Company: ${businessData?.company_name || 'Professional Window Treatments'}
- Industry: Window treatments, curtains, blinds, interior design
- Target: ${targetAudience}
- Style: ${designStyle}

Template Requirements:
- Document Type: ${templateType}
- Must include dynamic data fields using {{tokens}}
- Professional layout with proper branding
- Include all necessary sections for a ${templateType}
- Modern, responsive design
${customRequirements ? `- Additional: ${customRequirements}` : ''}

Please generate a template with appropriate blocks, styling, and content that reflects the business personality and target audience.`;

      const { data, error } = await supabase.functions.invoke('ai-design-assistant', {
        body: { 
          prompt,
          type: 'template-generation',
          context: {
            templateType,
            businessType,
            targetAudience, 
            designStyle,
            businessData,
            projectData
          }
        }
      });

      if (error) throw error;

      if (data.success && data.template) {
        const template = {
          id: `ai-${Date.now()}`,
          name: templateName,
          description: `AI-generated ${templateType} template for ${businessType}`,
          type: 'enhanced',
          blocks: data.template.blocks || generateFallbackTemplate(),
          style: data.template.style || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        onTemplateGenerated(template);
        toast.success('Smart template generated successfully!');
      } else {
        throw new Error('Failed to generate template with AI');
      }
    } catch (error) {
      console.error('Template generation error:', error);
      
      // Fallback to manual template generation
      const fallbackTemplate = generateFallbackTemplate();
      const template = {
        id: `fallback-${Date.now()}`,
        name: templateName,
        description: `${designStyle} ${templateType} template`,
        type: 'enhanced',
        blocks: fallbackTemplate,
        style: getStyleForDesign(designStyle),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      onTemplateGenerated(template);
      toast.success('Template created successfully!');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackTemplate = () => {
    const colorScheme = getColorScheme(designStyle);
    
    return [
      {
        id: 'header-1',
        type: 'header',
        content: {
          showLogo: true,
          logoPosition: 'left',
          companyName: '{{company_name}}',
          companyAddress: '{{company_address}}',
          companyPhone: '{{company_phone}}',
          companyEmail: '{{company_email}}',
          style: {
            backgroundColor: colorScheme.primary,
            textColor: '#ffffff'
          }
        }
      },
      {
        id: 'title-1',
        type: 'text',
        content: {
          text: templateType.toUpperCase(),
          style: {
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: colorScheme.primary,
            padding: '20px'
          }
        }
      },
      {
        id: 'client-info-1',
        type: 'client-info',
        content: {
          title: templateType === 'invoice' ? 'Bill To:' : 'Prepared For:',
          showCompany: true,
          showClientName: true,
          showClientEmail: true,
          showClientPhone: true,
          showClientAddress: true
        }
      },
      {
        id: 'products-1',
        type: 'products',
        content: {
          title: templateType === 'quote' ? 'Quoted Items' : 
                  templateType === 'invoice' ? 'Invoiced Items' :
                  templateType === 'proposal' ? 'Proposed Services' : 'Work Items',
          showDescription: true,
          showQuantity: true,
          showUnitPrice: true,
          showTotal: true
        }
      },
      {
        id: 'totals-1',
        type: 'totals',
        content: {
          showSubtotal: true,
          showTax: templateType !== 'proposal',
          showTotal: true,
          style: {
            backgroundColor: colorScheme.background,
            borderColor: colorScheme.primary
          }
        }
      },
      {
        id: 'signature-1',
        type: 'signature',
        content: {
          signatureLabel: templateType === 'quote' ? 'Client Approval' : 'Authorized Signature',
          dateLabel: 'Date',
          enableDigitalSignature: false
        }
      }
    ];
  };

  const getColorScheme = (style: string) => {
    const schemes = {
      'Modern & Minimalist': { primary: '#1f2937', background: '#f9fafb', accent: '#6b7280' },
      'Classic & Professional': { primary: '#1e40af', background: '#eff6ff', accent: '#3b82f6' },
      'Elegant & Luxury': { primary: '#7c3aed', background: '#faf5ff', accent: '#a855f7' },
      'Fun & Creative': { primary: '#ea580c', background: '#fff7ed', accent: '#fb923c' },
      'Bold & Colorful': { primary: '#dc2626', background: '#fef2f2', accent: '#ef4444' },
      'Clean & Corporate': { primary: '#059669', background: '#f0fdf4', accent: '#10b981' }
    };
    return schemes[style as keyof typeof schemes] || schemes['Classic & Professional'];
  };

  const getStyleForDesign = (style: string) => {
    return {
      colors: getColorScheme(style),
      typography: {
        fontFamily: style.includes('Elegant') ? 'Playfair Display, serif' : 'Inter, sans-serif',
        headerSize: style.includes('Bold') ? 36 : 32,
        bodySize: 16,
        lineHeight: 1.5
      },
      layout: {
        padding: style.includes('Minimalist') ? 24 : 32,
        sectionSpacing: 20,
        borderRadius: style.includes('Modern') ? 12 : 8,
        shadow: style.includes('Luxury') ? 'strong' : 'medium'
      },
      mood: style.split(' ')[0].toLowerCase()
    };
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Smart Template Generator
        </h2>
        <p className="text-muted-foreground">
          Create a custom template tailored to your business and design preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Template Name</label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Luxury Quote Template"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Template Type</label>
              <Select value={templateType} onValueChange={setTemplateType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templateTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Business Type</label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target Audience</label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Who are your clients?" />
                </SelectTrigger>
                <SelectContent>
                  {targetAudiences.map((audience) => (
                    <SelectItem key={audience} value={audience}>{audience}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Design Style</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {designStyles.map((style) => (
                  <Button
                    key={style}
                    variant={designStyle === style ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDesignStyle(style)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <div>
                      <div className="font-medium text-sm">{style}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium mb-2 block">Custom Requirements (Optional)</label>
            <Textarea
              value={customRequirements}
              onChange={(e) => setCustomRequirements(e.target.value)}
              placeholder="Any specific requirements? E.g., 'Include fabric swatches section', 'Add payment terms', 'Include installation timeline'..."
              className="min-h-[80px]"
            />
          </div>

          <Button 
            onClick={generateSmartTemplate}
            disabled={isGenerating || !templateName || !templateType || !designStyle}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Generating your template...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Smart Template
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};