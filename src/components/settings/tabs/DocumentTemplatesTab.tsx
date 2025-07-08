
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Edit, Copy, Download, Upload } from "lucide-react";
import { useState } from "react";

export const DocumentTemplatesTab = () => {
  const [templates] = useState([
    { id: 1, name: "Standard Quote", type: "Quote", status: "Active", lastModified: "2024-01-15" },
    { id: 2, name: "Premium Quote", type: "Quote", status: "Active", lastModified: "2024-01-10" },
    { id: 3, name: "Installation Invoice", type: "Invoice", status: "Active", lastModified: "2024-01-08" },
    { id: 4, name: "Work Order - Curtains", type: "Work Order", status: "Draft", lastModified: "2024-01-05" },
    { id: 5, name: "Fitting Instructions", type: "Instructions", status: "Active", lastModified: "2024-01-03" },
  ]);

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
            Manage templates for quotes, invoices, work orders, and instructions
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
              <Button size="sm">
                <FileText className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
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
                  
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" title="Preview">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Edit">
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

      {/* Document Styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Document Styling</CardTitle>
            <CardDescription>
              Configure the visual appearance of your documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 bg-blue-600 rounded border" />
                <Input value="#3B82F6" className="flex-1" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select defaultValue="inter">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="arial">Arial</SelectItem>
                  <SelectItem value="times">Times New Roman</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Logo Position</Label>
              <Select defaultValue="top-left">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-center">Top Center</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default Content</CardTitle>
            <CardDescription>
              Set default text for different document sections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Quote Terms & Conditions</Label>
              <Textarea 
                placeholder="Enter default terms and conditions for quotes..."
                className="min-h-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Installation Instructions Footer</Label>
              <Textarea 
                placeholder="Enter default footer text for installation instructions..."
                className="min-h-20"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Textarea 
                placeholder="Enter default payment terms..."
                className="min-h-20"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
