import { Button } from '@/components/ui/button';
import { 
  Save, 
  Eye, 
  Download, 
  Plus,
  Type,
  Image,
  Table,
  FileText,
  Undo,
  Redo
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DocumentTemplate, DocumentBlock } from './DocumentBuilderTab';

interface DocumentToolbarProps {
  selectedTemplate: DocumentTemplate | null;
  onAddBlock: (blockType: string) => void;
  blocks: DocumentBlock[];
  onSave: () => void;
}

const BLOCK_TYPES = [
  { id: 'header', label: 'Header', icon: FileText },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'table', label: 'Table', icon: Table },
];

export const DocumentToolbar = ({ 
  selectedTemplate, 
  onAddBlock,
  blocks,
  onSave 
}: DocumentToolbarProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
      {/* Left - Add Block */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Add Block
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {BLOCK_TYPES.map(blockType => {
              const Icon = blockType.icon;
              return (
                <DropdownMenuItem
                  key={blockType.id}
                  onClick={() => onAddBlock(blockType.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {blockType.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border" />

        <Button size="sm" variant="ghost" disabled>
          <Undo className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" disabled>
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Center - Template Name */}
      <div className="flex-1 text-center">
        <p className="text-sm font-medium text-foreground">
          {selectedTemplate?.name || 'No template selected'}
        </p>
        {blocks.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        <Button size="sm" onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
};
