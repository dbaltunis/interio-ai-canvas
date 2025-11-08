import { useState } from 'react';
import { TemplateLibrary } from './TemplateLibrary';
import { DocumentCanvas } from './DocumentCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { DocumentToolbar } from './DocumentToolbar';
import { FileText } from 'lucide-react';

export interface DocumentBlock {
  id: string;
  type: string;
  content: any;
  styles: any;
  settings: any;
}

export interface DocumentTemplate {
  id?: string;
  name: string;
  document_type: string;
  blocks: DocumentBlock[];
  image_settings?: any;
  layout_settings?: any;
}

export const DocumentBuilderTab = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<DocumentBlock | null>(null);
  const [blocks, setBlocks] = useState<DocumentBlock[]>([]);

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setBlocks(template.blocks || []);
    setSelectedBlock(null);
  };

  const handleBlockSelect = (block: DocumentBlock | null) => {
    setSelectedBlock(block);
  };

  const handleBlockUpdate = (blockId: string, updates: Partial<DocumentBlock>) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  };

  const handleAddBlock = (blockType: string) => {
    const newBlock: DocumentBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      content: {},
      styles: {},
      settings: {}
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Beta Badge */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            Document Builder
            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium">
              Beta
            </span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Create professional quotations, invoices, work orders, and all business documents with full customization
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <DocumentToolbar 
        selectedTemplate={selectedTemplate}
        onAddBlock={handleAddBlock}
        blocks={blocks}
        onSave={() => {/* TODO: Implement save */}}
      />

      {/* Three-Panel Layout */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-300px)] min-h-[600px]">
        {/* Left Panel - Template Library */}
        <div className="col-span-3 border border-border rounded-lg bg-card overflow-hidden flex flex-col">
          <TemplateLibrary 
            onTemplateSelect={handleTemplateSelect}
            selectedTemplateId={selectedTemplate?.id}
          />
        </div>

        {/* Center Panel - Canvas */}
        <div className="col-span-6 border border-border rounded-lg bg-background overflow-auto">
          <DocumentCanvas 
            blocks={blocks}
            selectedBlockId={selectedBlock?.id}
            onBlockSelect={handleBlockSelect}
            onBlockUpdate={handleBlockUpdate}
            onBlockDelete={handleDeleteBlock}
          />
        </div>

        {/* Right Panel - Properties */}
        <div className="col-span-3 border border-border rounded-lg bg-card overflow-hidden flex flex-col">
          <PropertiesPanel 
            selectedBlock={selectedBlock}
            onBlockUpdate={handleBlockUpdate}
          />
        </div>
      </div>
    </div>
  );
};
