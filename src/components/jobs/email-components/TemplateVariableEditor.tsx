
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Edit3, Save } from "lucide-react";

interface TemplateVariable {
  key: string;
  label: string;
  value: string;
  placeholder: string;
}

interface TemplateVariableEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    name: string;
    subject: string;
    content: string;
    variables?: string[];
  } | null;
  onApplyTemplate: (template: any, variables: Record<string, string>) => void;
}

export const TemplateVariableEditor = ({ 
  open, 
  onOpenChange, 
  template, 
  onApplyTemplate 
}: TemplateVariableEditorProps) => {
  const [variables, setVariables] = useState<Record<string, string>>({});

  // Common template variables with smart defaults
  const templateVariableDefaults: Record<string, TemplateVariable> = {
    'client_name': {
      key: 'client_name',
      label: 'Client Name',
      value: '',
      placeholder: 'Enter client name'
    },
    'company_name': {
      key: 'company_name',
      label: 'Company Name',
      value: '',
      placeholder: 'Enter company name'
    },
    'project_name': {
      key: 'project_name',
      label: 'Project Name',
      value: '',
      placeholder: 'Enter project name'
    },
    'installation_date': {
      key: 'installation_date',
      label: 'Installation Date',
      value: new Date().toLocaleDateString(),
      placeholder: 'Select installation date'
    },
    'installation_time': {
      key: 'installation_time',
      label: 'Installation Time',
      value: '9:00 AM',
      placeholder: 'Enter time'
    },
    'installer_name': {
      key: 'installer_name',
      label: 'Installer Name',
      value: '',
      placeholder: 'Enter installer name'
    },
    'quote_number': {
      key: 'quote_number',
      label: 'Quote Number',
      value: '',
      placeholder: 'Enter quote number'
    },
    'total_amount': {
      key: 'total_amount',
      label: 'Total Amount',
      value: '$0.00',
      placeholder: 'Enter amount'
    },
    'contact_phone': {
      key: 'contact_phone',
      label: 'Contact Phone',
      value: '',
      placeholder: 'Enter phone number'
    },
    'contact_email': {
      key: 'contact_email',
      label: 'Contact Email',
      value: '',
      placeholder: 'Enter email address'
    }
  };

  useEffect(() => {
    if (template && open) {
      // Extract variables from template content
      const content = template.content || '';
      const foundVariables = content.match(/\{\{([^}]+)\}\}/g) || [];
      const variableKeys = foundVariables.map(v => v.replace(/[{}]/g, ''));
      
      const initialVariables: Record<string, string> = {};
      variableKeys.forEach(key => {
        const cleanKey = key.trim();
        initialVariables[cleanKey] = templateVariableDefaults[cleanKey]?.value || '';
      });
      
      setVariables(initialVariables);
    }
  }, [template, open]);

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyTemplate = () => {
    if (!template) return;

    // Replace variables in content
    let processedContent = template.content;
    let processedSubject = template.subject;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
    });

    onApplyTemplate({
      ...template,
      subject: processedSubject,
      content: processedContent
    }, variables);
    
    onOpenChange(false);
  };

  if (!template) return null;

  const variableKeys = Object.keys(variables);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <div>
              <DialogTitle>Customize Template Variables</DialogTitle>
              <DialogDescription>
                Fill in the template variables for "{template.name}"
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Template: {template.name}</h4>
            <p className="text-sm text-gray-600 mb-3">
              This template contains {variableKeys.length} variable{variableKeys.length !== 1 ? 's' : ''} that need to be filled in.
            </p>
            <div className="flex flex-wrap gap-2">
              {variableKeys.map(key => (
                <Badge key={key} variant="outline" className="text-xs">
                  {`{{${key}}}`}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Variable Editor */}
          {variableKeys.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Template Variables
              </h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                {variableKeys.map(key => {
                  const variableInfo = templateVariableDefaults[key];
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>
                        {variableInfo?.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                      <Input
                        id={key}
                        value={variables[key] || ''}
                        onChange={(e) => handleVariableChange(key, e.target.value)}
                        placeholder={variableInfo?.placeholder || `Enter ${key}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>This template doesn't contain any variables to customize.</p>
            </div>
          )}

          {/* Preview Section */}
          <div className="space-y-3">
            <h4 className="font-medium">Preview</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium">Subject:</span>
                  <div className="mt-1 p-2 bg-white rounded border text-sm">
                    {template.subject.replace(/\{\{([^}]+)\}\}/g, (match, key) => 
                      variables[key.trim()] || match
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Content Preview:</span>
                  <div className="mt-1 p-2 bg-white rounded border text-sm max-h-32 overflow-y-auto">
                    {template.content.substring(0, 200).replace(/\{\{([^}]+)\}\}/g, (match, key) => 
                      variables[key.trim()] || match
                    )}
                    {template.content.length > 200 && '...'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyTemplate} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Apply Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
