import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Edit, Copy, Download, Upload, Plus } from "lucide-react";
import { useState } from "react";
import { VisualQuoteEditor } from "../templates/VisualQuoteEditor";

export const DocumentTemplatesTab = () => {
  const [templates, setTemplates] = useState([
    { id: 1, name: "Standard Quote", type: "Quote", status: "Active", lastModified: "2024-01-15" },
    { id: 2, name: "Premium Quote", type: "Quote", status: "Active", lastModified: "2024-01-10" },
    { id: 3, name: "Installation Invoice", type: "Invoice", status: "Active", lastModified: "2024-01-08" },
    { id: 4, name: "Work Order - Curtains", type: "Work Order", status: "Draft", lastModified: "2024-01-05" },
    { id: 5, name: "Fitting Instructions", type: "Instructions", status: "Active", lastModified: "2024-01-03" },
  ]);

  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowTemplateEditor(true);
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setShowTemplateEditor(true);
  };

  const handleSaveTemplate = (templateData: any) => {
    if (editingTemplate) {
      // Update existing template
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, ...templateData, lastModified: new Date().toISOString().split('T')[0] }
          : t
      ));
    } else {
      // Create new template
      const newTemplate = {
        id: templates.length + 1,
        name: templateData.name,
        type: "Quote",
        status: "Active",
        lastModified: new Date().toISOString().split('T')[0],
        ...templateData
      };
      setTemplates(prev => [...prev, newTemplate]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Templates
          </CardTitle>
          <CardDescription>
            Create beautiful quote templates with our visual drag-and-drop editor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="quote">Quotes</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                  <SelectItem value="work-order">Work Orders</SelectItem>
                  <SelectItem value="instructions">Instructions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button size="sm" onClick={handleCreateTemplate} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.type}</p>
                    </div>
                    <Badge variant={template.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                      {template.status}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-3">
                    Modified: {template.lastModified}
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" title="Preview">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Edit"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Duplicate">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <h4 className="font-medium text-blue-800">Create Template</h4>
                <p className="text-blue-700">Use our visual editor to design your quote layout</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <h4 className="font-medium text-blue-800">Drag & Drop</h4>
                <p className="text-blue-700">Add text, images, tables, and signature blocks</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <h4 className="font-medium text-blue-800">Generate Quotes</h4>
                <p className="text-blue-700">Use your templates to create professional quotes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Template Editor Modal */}
      <VisualQuoteEditor
        isOpen={showTemplateEditor}
        onClose={() => setShowTemplateEditor(false)}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
};
