import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Download, Edit, Save } from 'lucide-react';
import { LivePreview } from './visual-editor/LivePreview';
import { toast } from "sonner";

interface TemplatePreviewModalProps {
  template: any;
  projectData?: any;
  onClose: () => void;
  onEdit?: () => void;
  onSave?: () => void;
  showActions?: boolean;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  projectData,
  onClose,
  onEdit,
  onSave,
  showActions = true
}) => {
  const handlePrint = () => {
    window.print();
    toast.success('Printing preview...');
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${template.name || 'template'}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Template downloaded successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 md:inset-8 bg-background rounded-lg shadow-xl border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Template Preview</h2>
              <p className="text-sm text-gray-600">{template.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showActions && (
              <>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Download className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {onSave && (
                  <Button size="sm" onClick={onSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </Button>
                )}
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <Card className="bg-white shadow-lg">
              <CardContent className="p-0">
                <LivePreview 
                  blocks={template.blocks || []}
                  projectData={projectData}
                  isEditable={false}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {template.description || 'Custom template'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
            {showActions && onSave && (
              <Button onClick={onSave}>
                Save & Use Template
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};