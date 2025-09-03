import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Receipt, 
  ClipboardList, 
  Ruler, 
  BookOpen, 
  Palette,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'business' | 'marketing';
  templates: {
    id: string;
    name: string;
    description: string;
    preview?: string;
  }[];
}

interface DocumentTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (documentType: string, templateId: string) => void;
}

const documentTypes: DocumentType[] = [
  {
    id: 'quote',
    name: 'Quote',
    description: 'Professional quotations for clients',
    icon: FileText,
    category: 'business',
    templates: [
      {
        id: 'modern-quote',
        name: 'Modern Quote',
        description: 'Clean, professional layout with subtle branding'
      },
      {
        id: 'detailed-quote',
        name: 'Detailed Quote',
        description: 'Comprehensive breakdown with room-by-room pricing'
      },
      {
        id: 'luxury-quote',
        name: 'Luxury Quote',
        description: 'Premium design for high-end clients'
      }
    ]
  },
  {
    id: 'invoice',
    name: 'Invoice',
    description: 'Professional invoices and billing documents',
    icon: Receipt,
    category: 'business',
    templates: [
      {
        id: 'standard-invoice',
        name: 'Standard Invoice',
        description: 'Clean, straightforward invoice layout'
      },
      {
        id: 'branded-invoice',
        name: 'Branded Invoice',
        description: 'Invoice with enhanced branding elements'
      }
    ]
  },
  {
    id: 'work-order',
    name: 'Work Order',
    description: 'Installation and work instructions',
    icon: ClipboardList,
    category: 'business',
    templates: [
      {
        id: 'installer-workorder',
        name: 'Installer Work Order',
        description: 'Detailed instructions for installation teams'
      },
      {
        id: 'fitter-workorder',
        name: 'Fitter Work Order',
        description: 'Specialized fitting instructions and measurements'
      }
    ]
  },
  {
    id: 'measurement',
    name: 'Measurement Sheet',
    description: 'Measurement recording and verification',
    icon: Ruler,
    category: 'business',
    templates: [
      {
        id: 'standard-measurement',
        name: 'Standard Measurement',
        description: 'Room-by-room measurement documentation'
      }
    ]
  },
  {
    id: 'brochure',
    name: 'Product Brochure',
    description: 'Beautiful marketing materials and catalogs',
    icon: BookOpen,
    category: 'marketing',
    templates: [
      {
        id: 'product-showcase',
        name: 'Product Showcase',
        description: 'Stunning visual catalog with product galleries'
      },
      {
        id: 'company-brochure',
        name: 'Company Brochure',
        description: 'Professional company presentation'
      },
      {
        id: 'ebook-template',
        name: 'Digital eBook',
        description: 'Multi-page digital catalog for email sharing'
      }
    ]
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Project showcases and case studies',
    icon: Palette,
    category: 'marketing',
    templates: [
      {
        id: 'project-portfolio',
        name: 'Project Portfolio',
        description: 'Before/after project showcases'
      }
    ]
  }
];

export const DocumentTypeSelector = ({ isOpen, onClose, onSelectTemplate }: DocumentTypeSelectorProps) => {
  const businessTypes = documentTypes.filter(type => type.category === 'business');
  const marketingTypes = documentTypes.filter(type => type.category === 'marketing');

  const handleTemplateSelect = (documentTypeId: string, templateId: string) => {
    console.log('Selected template:', { documentTypeId, templateId });
    onSelectTemplate(documentTypeId, templateId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Choose Your Document Type
          </DialogTitle>
          <p className="text-muted-foreground">
            Select a document type and template to get started with professional designs
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Business Documents */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Business Documents</h3>
              <Badge variant="secondary">Essential</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businessTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card key={type.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{type.name}</CardTitle>
                          <CardDescription className="text-sm">{type.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {type.templates.map((template) => (
                          <Button
                            key={template.id}
                            variant="outline"
                            className="w-full justify-between h-auto p-3 text-left hover:bg-primary/5"
                            onClick={() => handleTemplateSelect(type.id, template.id)}
                          >
                            <div>
                              <div className="font-medium text-sm">{template.name}</div>
                              <div className="text-xs text-muted-foreground">{template.description}</div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Marketing Materials */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-accent-foreground" />
              <h3 className="text-lg font-semibold">Marketing Materials</h3>
              <Badge variant="outline" className="border-accent text-accent-foreground">Premium</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketingTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card key={type.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-accent/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                          <IconComponent className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{type.name}</CardTitle>
                          <CardDescription className="text-sm">{type.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {type.templates.map((template) => (
                          <Button
                            key={template.id}
                            variant="outline"
                            className="w-full justify-between h-auto p-3 text-left hover:bg-accent/5"
                            onClick={() => handleTemplateSelect(type.id, template.id)}
                          >
                            <div>
                              <div className="font-medium text-sm">{template.name}</div>
                              <div className="text-xs text-muted-foreground">{template.description}</div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};