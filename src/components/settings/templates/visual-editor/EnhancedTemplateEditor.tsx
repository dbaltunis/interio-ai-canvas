import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StreamlinedEditor } from './StreamlinedEditor';
import { EnhancedCanvasEditor } from './EnhancedCanvasEditor';
import { LivePreview } from './LivePreview';
import { AdvancedExportSystem } from './AdvancedExportSystem';
import { RealTimeCollaboration } from './RealTimeCollaboration';
import { FunctionalLayoutTools } from './FunctionalLayoutTools';
import { AIDesignAssistant } from './AIDesignAssistant';
import '@/styles/template-editor.css';
import { useProjectData } from '@/hooks/useProjectData';
import { supabase } from "@/integrations/supabase/client";
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
  Paintbrush2,
  Users,
  Grid3x3,
  Wand2
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
  const [activeTab, setActiveTab] = useState<'blocks' | 'canvas' | 'preview' | 'export' | 'collaborate' | 'layout' | 'ai-assistant'>('blocks');
  const [canvasData, setCanvasData] = useState<string>('');
  const templateRef = useRef<HTMLDivElement>(null);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  
  const { data: projectData } = useProjectData(projectId);

  // Mock current user for collaboration
  const currentUser = {
    id: 'current-user',
    name: 'You',
    email: 'you@company.com',
    role: 'owner' as const,
    status: 'online' as const,
    lastSeen: 'now'
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      let userId = null;
      if (session?.user) {
        userId = session.user.id;
      } else {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('Please log in to save templates');
        }
        userId = user.id;
      }

      const templateData = {
        name: templateName,
        description: `Enhanced template with ${blocks.length} blocks`,
        template_style: 'enhanced',
        blocks,
        canvas_data: canvasData,
        user_id: userId,
        active: true
      };

      console.log('Saving enhanced template with blocks:', blocks.length, blocks.map(b => ({ id: b.id, type: b.type })));

      if (template?.id) {
        // Update existing template
        const { error } = await supabase
          .from('quote_templates')
          .update(templateData)
          .eq('id', template.id);
        
        if (error) throw error;
        toast.success('Enhanced template updated successfully!');
      } else {
        // Create new template
        const { error } = await supabase
          .from('quote_templates')
          .insert([templateData]);
        
        if (error) throw error;
        toast.success('Enhanced template saved successfully!');
      }

      onSave(templateData);
      onClose();
    } catch (error) {
      console.error('Error saving enhanced template:', error);
      toast.error(`Failed to save template: ${error.message}`);
    }
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
          <EnhancedCanvasEditor
            onSave={handleCanvasSave}
            initialData={canvasData}
            width={800}
            height={600}
          />
        );
      
      case 'preview':
        return (
          <div ref={templateRef}>
            <LivePreview
              blocks={blocks}
              projectData={projectData}
              isEditable={false}
            />
          </div>
        );

      case 'export':
        return (
          <AdvancedExportSystem
            templateRef={templateRef}
            templateData={{ name: templateName, blocks, canvasData }}
            onExport={(format, options) => {
              console.log('Exporting:', format, options);
            }}
          />
        );

      case 'collaborate':
        return (
          <RealTimeCollaboration
            templateId={template?.id || 'new'}
            currentUser={currentUser}
            onCollaboratorChange={(collaborators) => {
              console.log('Collaborators updated:', collaborators);
            }}
            onCommentAdd={(comment) => {
              console.log('Comment added:', comment);
            }}
          />
        );

      case 'layout':
        return (
          <FunctionalLayoutTools
            selectedElements={selectedElements}
            onElementUpdate={(elements) => {
              setSelectedElements(elements);
              console.log('Elements updated:', elements);
            }}
            onAlignment={(type) => {
              console.log('Alignment:', type);
            }}
            onDistribution={(type) => {
              console.log('Distribution:', type);
            }}
            onGrouping={(action) => {
              console.log('Grouping:', action);
            }}
          />
        );

      case 'ai-assistant':
        return (
          <AIDesignAssistant
            onApplyDesign={(designData) => {
              if (designData.blocks) {
                setBlocks(designData.blocks);
              }
              console.log('AI Design applied:', designData);
            }}
            currentBlocks={blocks}
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
        <div className="flex items-center gap-1 px-6 border-b overflow-x-auto">
          <Button
            variant={activeTab === 'blocks' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('blocks')}
            className="flex items-center gap-2"
          >
            <Layers className="h-4 w-4" />
            Blocks
          </Button>
          <Button
            variant={activeTab === 'canvas' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('canvas')}
            className="flex items-center gap-2"
          >
            <Paintbrush2 className="h-4 w-4" />
            Canvas
          </Button>
          <Button
            variant={activeTab === 'layout' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('layout')}
            className="flex items-center gap-2"
          >
            <Grid3x3 className="h-4 w-4" />
            Layout
          </Button>
          <Button
            variant={activeTab === 'collaborate' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('collaborate')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Collaborate
          </Button>
          <Button
            variant={activeTab === 'export' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('export')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant={activeTab === 'ai-assistant' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('ai-assistant')}
            className="flex items-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            AI Assistant
          </Button>
          <Button
            variant={activeTab === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('preview')}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
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