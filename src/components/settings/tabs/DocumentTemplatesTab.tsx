import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Edit, Copy, Download, Upload, Plus, Sparkles, Layout, Briefcase } from "lucide-react";
import { useState } from "react";
import { VisualQuoteEditor } from "../templates/VisualQuoteEditor";

export const DocumentTemplatesTab = () => {
  const [templates, setTemplates] = useState([
    { 
      id: 1, 
      name: "Simple Quote", 
      type: "Quote", 
      style: "simple",
      status: "Active", 
      lastModified: "2024-01-15",
      description: "Clean, minimal design for basic quotes",
      preview: "Simple table layout with essential information"
    },
    { 
      id: 2, 
      name: "Detailed Professional", 
      type: "Quote", 
      style: "detailed",
      status: "Active", 
      lastModified: "2024-01-10",
      description: "Comprehensive breakdown with itemized costs",
      preview: "Full product breakdown with materials and labor"
    },
    { 
      id: 3, 
      name: "Marketing Brochure", 
      type: "Quote", 
      style: "brochure",
      status: "Active", 
      lastModified: "2024-01-08",
      description: "Beautiful brochure-style with images and rich content",
      preview: "Premium design with gradients, images, and payment integration"
    },
    { 
      id: 4, 
      name: "Installation Invoice", 
      type: "Invoice", 
      style: "detailed",
      status: "Active", 
      lastModified: "2024-01-05",
      description: "Professional invoice template",
      preview: "Detailed invoice with payment terms"
    }
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
            Create beautiful quotes with Simple, Detailed, or Brochure styles using our professional visual editor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Featured Template Styles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Simple Quote</h3>
                </div>
                <p className="text-sm text-blue-700 mb-4">Clean, minimal design perfect for straightforward quotes</p>
                <div className="bg-white rounded p-2 mb-3 shadow-sm">
                  <div className="space-y-1">
                    <div className="h-2 bg-blue-100 rounded w-3/4"></div>
                    <div className="h-1 bg-gray-200 rounded w-1/2"></div>
                    <div className="grid grid-cols-3 gap-1 my-2">
                      <div className="h-1 bg-green-100 rounded"></div>
                      <div className="h-1 bg-green-100 rounded"></div>
                      <div className="h-1 bg-green-100 rounded"></div>
                    </div>
                    <div className="h-1 bg-blue-200 rounded w-1/3 ml-auto"></div>
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={handleCreateTemplate}>
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Detailed Professional</h3>
                </div>
                <p className="text-sm text-green-700 mb-4">Comprehensive breakdown with itemized costs and materials</p>
                <div className="bg-white rounded p-2 mb-3 shadow-sm">
                  <div className="space-y-1">
                    <div className="h-2 bg-green-200 rounded w-full"></div>
                    <div className="space-y-0.5">
                      <div className="h-1 bg-gray-200 rounded w-full"></div>
                      <div className="h-1 bg-gray-100 rounded w-4/5 ml-4"></div>
                      <div className="h-1 bg-gray-100 rounded w-3/5 ml-4"></div>
                    </div>
                    <div className="h-1 bg-green-200 rounded w-2/5 ml-auto"></div>
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={handleCreateTemplate}>
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Marketing Brochure</h3>
                  <Badge className="text-xs bg-purple-600">Premium</Badge>
                </div>
                <p className="text-sm text-purple-700 mb-4">Beautiful brochure-style with gradients, images, and rich content</p>
                <div className="bg-white rounded p-2 mb-3 shadow-sm">
                  <div className="space-y-1">
                    <div className="h-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-full"></div>
                    <div className="h-1 bg-purple-100 rounded w-2/3 mx-auto"></div>
                    <div className="grid grid-cols-3 gap-1 my-1">
                      <div className="h-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded"></div>
                      <div className="h-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded"></div>
                      <div className="h-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded"></div>
                    </div>
                    <div className="h-1 bg-green-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={handleCreateTemplate}>
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center border-t pt-6">
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
                Create Custom
              </Button>
            </div>
          </div>

          {/* Existing Templates */}
          <div>
            <h3 className="font-medium mb-3">Your Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {template.style === 'simple' && <FileText className="h-4 w-4 text-blue-600" />}
                        {template.style === 'detailed' && <Briefcase className="h-4 w-4 text-green-600" />}
                        {template.style === 'brochure' && <Sparkles className="h-4 w-4 text-purple-600" />}
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.type}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={template.status === 'Active' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {template.status}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                    <p className="text-xs text-gray-500 mb-3">Modified: {template.lastModified}</p>
                    
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
                <h4 className="font-medium text-blue-800">Choose Your Style</h4>
                <p className="text-blue-700">Select from Simple, Detailed, or Brochure templates</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <h4 className="font-medium text-blue-800">Customize & Style</h4>
                <p className="text-blue-700">Add gradients, images, branding, and professional styling</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <h4 className="font-medium text-blue-800">Professional Results</h4>
                <p className="text-blue-700">Generate beautiful quotes that win more business</p>
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
