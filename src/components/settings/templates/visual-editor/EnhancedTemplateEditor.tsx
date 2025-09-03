import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StreamlinedEditor } from './StreamlinedEditor';
import { CanvasEditor } from './CanvasEditor';
import { LivePreview } from './LivePreview';
import '@/styles/template-editor.css';
import { useProjectData } from '@/hooks/useProjectData';
import { 
  Palette,
  Type,
  Image as ImageIcon,
  Layout,
  Eye,
  Save,
  Download,
  Share2,
  Layers,
  Settings,
  Paintbrush2
} from "lucide-react";
import { toast } from "sonner";

interface EnhancedTemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  template?: any;
  onSave: (templateData: any) => void;
  projectId?: string;
}

export const EnhancedTemplateEditor = ({ 
  isOpen, 
  onClose, 
  template, 
  onSave,
  projectId 
}: EnhancedTemplateEditorProps) => {
  const [templateName, setTemplateName] = useState(template?.name || '');
  const [blocks, setBlocks] = useState(template?.blocks || []);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'blocks' | 'canvas' | 'preview'>('blocks');
  const [canvasData, setCanvasData] = useState<string>('');
  
  const { data: projectData } = useProjectData(projectId);

  const handleSave = () => {
    const templateData = {
      name: templateName,
      blocks,
      canvasData,
      template_style: 'enhanced',
      active: true
    };
    
    onSave(templateData);
    toast("Template saved successfully!");
  };

  const handleBlocksChange = (newBlocks: any[]) => {
    setBlocks(newBlocks);
  };

  const handleCanvasSave = (data: string) => {
    setCanvasData(data);
    toast("Canvas design saved!");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'blocks':
        return (
          <StreamlinedEditor
            blocks={blocks}
            onBlocksChange={handleBlocksChange}
            onSave={handleSave}
            templateName={templateName}
          />
        );
      
      case 'canvas':
        return (
          <CanvasEditor
            onSave={handleCanvasSave}
            initialData={canvasData}
            width={800}
            height={1000}
          />
        );
      
      case 'preview':
        return (
          <LivePreview
            blocks={blocks}
            projectData={projectData}
            isEditable={false}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Enhanced Template Editor</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Template Name Input */}
        <div className="px-6 pb-4">
          <Input
            placeholder="Template name..."
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="text-lg font-medium"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b">
          <Button
            variant={activeTab === 'blocks' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('blocks')}
            className="flex items-center gap-2"
          >
            <Layers className="h-4 w-4" />
            Document Blocks
          </Button>
          <Button
            variant={activeTab === 'canvas' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('canvas')}
            className="flex items-center gap-2"
          >
            <Paintbrush2 className="h-4 w-4" />
            Canvas Design
          </Button>
          <Button
            variant={activeTab === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('preview')}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Live Preview
          </Button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {renderTabContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};