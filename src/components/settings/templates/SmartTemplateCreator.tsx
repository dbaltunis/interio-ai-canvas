import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FileText, DollarSign, Building, Palette, Wand2, Zap } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProjectData } from "@/hooks/useProjectData";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { DynamicTemplateGenerator } from './DynamicTemplateGenerator';
import { TemplateStyleCustomizer } from './TemplateStyleCustomizer';

interface SmartTemplateCreatorProps {
  onTemplateCreated: (template: any) => void;
  projectId?: string;
}

export const SmartTemplateCreator: React.FC<SmartTemplateCreatorProps> = ({ 
  onTemplateCreated, 
  projectId 
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [templateName, setTemplateName] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('presets');
  const [customStyle, setCustomStyle] = useState({});
  const { data: projectData } = useProjectData(projectId || '');
  const { data: businessSettings } = useBusinessSettings();

  const templatePresets = [
    {
      id: 'luxury-quote',
      name: 'Luxury Interior Design Quote',
      description: 'Premium template for high-end residential projects',
      icon: <Sparkles className="h-5 w-5" />,
      color: 'from-purple-500 to-pink-500',
      prompt: 'Create a luxury interior design quote template with elegant typography, premium color scheme, and sophisticated layout that conveys exclusivity and high-end service.',
      blocks: [
        { type: 'header', content: { style: { backgroundColor: '#7c3aed', textColor: '#ffffff' }, showLogo: true } },
        { type: 'text', content: { text: 'EXCLUSIVE INTERIOR DESIGN PROPOSAL', style: { fontSize: '24px', textAlign: 'center', fontWeight: 'bold' } } },
        { type: 'client-info', content: { title: 'Prepared For:', showClientName: true, showClientEmail: true, showClientAddress: true } },
        { type: 'products', content: { title: 'Premium Services', layout: 'visual', showTotal: true } },
        { type: 'totals', content: { style: { borderColor: '#7c3aed', backgroundColor: '#faf5ff' } } },
        { type: 'signature', content: { signatureLabel: 'Executive Approval', enableDigitalSignature: true } }
      ]
    },
    {
      id: 'professional-quote',
      name: 'Professional Business Quote',
      description: 'Clean, corporate template for commercial projects',
      icon: <Building className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
      prompt: 'Create a professional business quote template with clean lines, corporate colors, and structured layout suitable for commercial interior design projects.',
      blocks: [
        { type: 'header', content: { style: { backgroundColor: '#1e40af', textColor: '#ffffff' }, showLogo: true } },
        { type: 'client-info', content: { title: 'Project Details', showCompany: true, showClientName: true, showClientEmail: true } },
        { type: 'products', content: { title: 'Professional Services', layout: 'detailed', showRoom: true, showDescription: true } },
        { type: 'totals', content: { style: { borderColor: '#1e40af', backgroundColor: '#eff6ff' } } },
        { type: 'text', content: { text: 'Terms & Conditions: Payment due within 30 days. All materials guaranteed for 12 months.' } },
        { type: 'signature', content: { signatureLabel: 'Authorized Signature' } }
      ]
    },
    {
      id: 'curtain-specialist',
      name: 'Window Treatment Specialist',
      description: 'Specialized template for curtain and blind services',
      icon: <FileText className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
      prompt: 'Create a specialized template for window treatment services, featuring fabric swatches, measurement details, and installation timelines.',
      blocks: [
        { type: 'header', content: { style: { backgroundColor: '#059669', textColor: '#ffffff' }, showLogo: true } },
        { type: 'text', content: { text: 'CUSTOM WINDOW TREATMENTS', style: { fontSize: '20px', textAlign: 'center', color: '#059669' } } },
        { type: 'client-info', content: { title: 'Installation Address:', showClientAddress: true, showClientPhone: true } },
        { type: 'products', content: { title: 'Window Treatment Solutions', layout: 'itemized', showRoom: true, showQuantity: true } },
        { type: 'totals', content: { style: { borderColor: '#059669', backgroundColor: '#f0fdf4' } } },
        { type: 'signature', content: { signatureLabel: 'Client Approval' } }
      ]
    },
    {
      id: 'ai-generated',
      name: 'AI-Generated Custom Template',
      description: 'Let AI create a completely custom template based on your specific needs',
      icon: <Wand2 className="h-5 w-5" />,
      color: 'from-violet-500 to-purple-500',
      prompt: '',
      blocks: []
    }
  ];

  const generateTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (!selectedPreset) {
      toast.error('Please select a template type');
      return;
    }

    setIsGenerating(true);

    try {
      const preset = templatePresets.find(p => p.id === selectedPreset);
      
      if (selectedPreset === 'ai-generated') {
        if (!customPrompt.trim()) {
          toast.error('Please describe what kind of template you want to create');
          setIsGenerating(false);
          return;
        }

        // Call AI Design Assistant to generate custom template
        const { data, error } = await supabase.functions.invoke('ai-design-assistant', {
          body: {
            prompt: customPrompt,
            documentType: 'quote',
            currentStyle: {},
            projectData: {
              company: projectData?.businessSettings?.companyName || 'Your Company',
              industry: 'Interior Design & Window Treatments'
            }
          }
        });

        if (error) throw error;

        // Create AI-generated template structure
        const { data: { user } } = await supabase.auth.getUser();
        
        const aiTemplate = {
          user_id: user?.id || '',
          name: templateName,
          description: `AI-generated template: ${customPrompt.slice(0, 50)}...`,
          template_style: 'ai-generated',
          blocks: data.blocks || generateBasicBlocks(data),
          active: true
        };

        const { error: saveError } = await supabase
          .from('quote_templates')
          .insert(aiTemplate);

        if (saveError) throw saveError;

        toast.success('AI template created successfully!');
        onTemplateCreated(aiTemplate);
      } else {
        // Use preset template
        const { data: { user } } = await supabase.auth.getUser();
        
        const presetTemplate = {
          user_id: user?.id || '',
          name: templateName,
          description: preset?.description || 'Professional template',
          template_style: selectedPreset.replace('-', '_'),
          blocks: preset?.blocks || [],
          active: true
        };

        const { error: saveError } = await supabase
          .from('quote_templates')
          .insert(presetTemplate);

        if (saveError) throw saveError;

        toast.success('Template created successfully!');
        onTemplateCreated(presetTemplate);
      }

      // Reset form
      setTemplateName('');
      setCustomPrompt('');
      setSelectedPreset('');

    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBasicBlocks = (aiData: any) => {
    const colors = aiData.colors || { primary: '#1e40af', background: '#ffffff' };
    
    return [
      {
        type: 'header',
        content: {
          style: { backgroundColor: colors.primary, textColor: '#ffffff' },
          showLogo: true,
          companyName: '{{company_name}}',
          companyEmail: '{{company_email}}',
          companyPhone: '{{company_phone}}'
        }
      },
      {
        type: 'client-info',
        content: {
          title: 'Prepared For:',
          showClientName: true,
          showClientEmail: true,
          showClientAddress: true
        }
      },
      {
        type: 'products',
        content: {
          title: 'Services & Products',
          layout: 'detailed',
          showTotal: true,
          showQuantity: true,
          showUnitPrice: true
        }
      },
      {
        type: 'totals',
        content: {
          style: { borderColor: colors.primary, backgroundColor: colors.background },
          showSubtotal: true,
          showTax: true,
          showTotal: true
        }
      },
      {
        type: 'signature',
        content: {
          showSignature: true,
          showDate: true,
          signatureLabel: 'Authorized Signature'
        }
      }
    ];
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Template Creation Studio</h2>
        <p className="text-muted-foreground">
          Create professional, dynamic templates that reflect your brand and wow your clients
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="presets" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Quick Presets
          </TabsTrigger>
          <TabsTrigger value="smart" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Smart Generator
          </TabsTrigger>
          <TabsTrigger value="customize" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Custom Style
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templatePresets.map((preset) => (
          <Card 
            key={preset.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedPreset === preset.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedPreset(preset.id)}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${preset.color} text-white`}>
                  {preset.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{preset.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {preset.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {selectedPreset === preset.id && (
              <CardContent>
                <Badge variant="secondary" className="w-full justify-center">
                  Selected
                </Badge>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {selectedPreset && (
        <Card>
          <CardHeader>
            <CardTitle>Template Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Template Name</label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name..."
                className="mt-1"
              />
            </div>

            {selectedPreset === 'ai-generated' && (
              <div>
                <label className="text-sm font-medium">Describe Your Template</label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe what kind of template you want. For example: 'Create a modern invoice template for a boutique curtain shop with elegant colors and clean layout for luxury residential clients...'"
                  className="mt-1 min-h-[100px]"
                />
              </div>
            )}

            <Button 
              onClick={generateTemplate}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  {selectedPreset === 'ai-generated' ? 'AI is creating your template...' : 'Creating template...'}
                </>
              ) : (
                <>
                  {selectedPreset === 'ai-generated' ? (
                    <Wand2 className="mr-2 h-4 w-4" />
                  ) : (
                    <Palette className="mr-2 h-4 w-4" />
                  )}
                  Create Template
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="smart">
          <DynamicTemplateGenerator 
            onTemplateGenerated={onTemplateCreated}
            businessData={businessSettings}
            projectData={projectData}
          />
        </TabsContent>

        <TabsContent value="customize">
          <Card>
            <CardHeader>
              <CardTitle>Custom Style Editor</CardTitle>
              <CardDescription>
                Fine-tune every aspect of your template design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateStyleCustomizer 
                templateStyle={customStyle}
                onStyleChange={setCustomStyle}
              />
              
              <div className="mt-6 pt-6 border-t">
                <Button 
                  onClick={() => {
                    const styledTemplate = {
                      id: `custom-${Date.now()}`,
                      name: 'Custom Styled Template',
                      description: 'Custom template with personalized styling',
                      type: 'enhanced',
                      blocks: templatePresets[0].blocks, // Use first preset as base
                      style: customStyle,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    };
                    onTemplateCreated(styledTemplate);
                    toast.success('Custom template created!');
                  }}
                  className="w-full"
                  size="lg"
                >
                  Create Custom Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};