import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentBlock } from './DocumentBuilderTab';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBlock, TextBlock, ImageBlock, ProductImageBlock, TableBlock } from './blocks';

interface DocumentCanvasProps {
  blocks: DocumentBlock[];
  selectedBlockId?: string;
  onBlockSelect: (block: DocumentBlock | null) => void;
  onBlockUpdate: (blockId: string, updates: Partial<DocumentBlock>) => void;
  onBlockDelete: (blockId: string) => void;
}

export const DocumentCanvas = ({
  blocks,
  selectedBlockId,
  onBlockSelect,
  onBlockDelete
}: DocumentCanvasProps) => {
  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        {/* Document Paper */}
        <div className="max-w-[210mm] mx-auto bg-white shadow-lg rounded-lg overflow-hidden min-h-[297mm] p-12">
          {blocks.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <div className="p-4 bg-muted/20 rounded-full inline-block mb-4">
                  <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Empty Document</h3>
                <p className="text-sm text-gray-500">Select a template or add blocks to get started</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {blocks.map(block => (
                <div
                  key={block.id}
                  onClick={() => onBlockSelect(block)}
                  className={`group relative p-4 rounded border-2 transition-all cursor-pointer ${
                    selectedBlockId === block.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/10'
                  }`}
                >
                  {/* Drag Handle */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-1 bg-white border border-border rounded shadow-sm cursor-move">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBlockDelete(block.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Block Content */}
                  <div className="text-gray-900">
                    <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      {block.type.replace('-', ' ')}
                    </div>
                    <div className="text-sm">
                      {block.type === 'header' && <HeaderBlock block={block} />}
                      {block.type === 'text' && <TextBlock block={block} />}
                      {block.type === 'image' && <ImageBlock block={block} />}
                      {block.type === 'product-image' && <ProductImageBlock block={block} />}
                      {block.type === 'table' && <TableBlock block={block} />}
                      {!['header', 'text', 'image', 'product-image', 'table'].includes(block.type) && (
                        <p className="text-muted-foreground">Block type: {block.type}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};
