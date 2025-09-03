import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Layout,
  Palette,
  Type,
  Eye,
  EyeOff,
  Wand2,
  Download,
  Share2,
  Save,
  Zap,
  Crown,
  Grid3x3,
  MousePointer2,
  Move,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { ModernEditor } from './ModernEditor';
import { LivePreview } from './LivePreview';
import { AIDesignAssistant } from './AIDesignAssistant';

interface EnhancedVisualEditorProps {
  isOpen: boolean;
  onClose: () => void;
  template?: any;
  onSave: (templateData: any) => void;
  projectId?: string;
}

export const EnhancedVisualEditor = ({ 
  isOpen, 
  onClose, 
  template, 
  onSave, 
  projectId 
}: EnhancedVisualEditorProps) => {
  const [templateName, setTemplateName] = useState(template?.name || 'New Template');
  const [blocks, setBlocks] = useState(template?.blocks || []);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'preview' | 'ai' | 'export'>('design');
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = async () => {
    try {
      const templateData = {
        name: templateName,
        blocks: blocks,
        type: 'enhanced',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await onSave(templateData);
      toast.success('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleApplyDesign = (designData: any) => {
    if (designData.blocks) {
      setBlocks(designData.blocks);
    }
    toast.success('Design applied successfully!');
  };

  const handleExport = () => {
    const exportData = {
      name: templateName,
      blocks: blocks,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${templateName.replace(/\s+/g, '_')}_template.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Template exported successfully!');
  };

  const handleShare = () => {
    // Generate shareable link or copy template data
    navigator.clipboard.writeText(JSON.stringify({ name: templateName, blocks }));
    toast.success('Template data copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 md:inset-8 bg-background rounded-lg shadow-xl border flex flex-col overflow-hidden">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
              <Layout className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Enhanced Template Editor</h2>
              <p className="text-sm text-gray-600">Professional document design made simple</p>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        {/* Template Name Input */}
        <div className="p-4 border-b bg-gray-50">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="text-lg font-medium bg-transparent border-none outline-none w-full"
            placeholder="Template Name"
          />
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="border-b bg-white">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12 bg-gray-100 p-1 m-2 rounded-lg">
              <TabsTrigger value="design" className="flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Design
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Enhanced Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'design' && (
            <div className="h-full flex">
              <div className="w-1/3 border-r">
                <ModernEditor
                  blocks={blocks}
                  onBlocksChange={setBlocks}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={setSelectedBlockId}
                  showPreview={showPreview}
                  onTogglePreview={() => setShowPreview(!showPreview)}
                />
              </div>
              <div className="flex-1 bg-gray-100">
                <div className="h-full overflow-auto p-8">
                  <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                    <LivePreview 
                      blocks={blocks} 
                      projectData={null}
                      isEditable={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="h-full bg-gray-100 overflow-auto p-8">
              <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <LivePreview 
                  blocks={blocks} 
                  projectData={null}
                  isEditable={false}
                />
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <AIDesignAssistant
              onApplyDesign={handleApplyDesign}
              currentBlocks={blocks}
            />
          )}

          {activeTab === 'export' && (
            <div className="h-full p-8">
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2">Export Your Template</h3>
                  <p className="text-gray-600">Choose your preferred export format</p>
                </div>

                <div className="grid gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleExport}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Download className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">JSON Template</h4>
                          <p className="text-sm text-gray-600">Export as JSON for backup or sharing</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Share2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Share Link</h4>
                          <p className="text-sm text-gray-600">Generate a shareable link for collaboration</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <MousePointer2 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">HTML Preview</h4>
                          <p className="text-sm text-gray-600">Export as static HTML document</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};