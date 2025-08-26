
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Type, 
  Image as ImageIcon, 
  Columns, 
  Minus, 
  Code, 
  Plus,
  Eye,
  Save,
  Trash2,
  GripVertical
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface EmailDesignEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent?: string;
  onSave: (content: string) => void;
}

interface EmailBlock {
  id: string;
  type: 'text' | 'image' | 'columns' | 'divider';
  content: any;
}

export const EmailDesignEditor = ({ 
  open, 
  onOpenChange, 
  initialContent = "", 
  onSave 
}: EmailDesignEditorProps) => {
  const [blocks, setBlocks] = useState<EmailBlock[]>([
    {
      id: '1',
      type: 'text',
      content: { text: initialContent || 'Hello,\n\nThis is your email content.\n\nBest regards,' }
    }
  ]);
  const [activeTab, setActiveTab] = useState<'design' | 'preview'>('design');

  const addBlock = (type: EmailBlock['type']) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type)
    };
    setBlocks([...blocks, newBlock]);
  };

  const getDefaultContent = (type: EmailBlock['type']) => {
    switch (type) {
      case 'text':
        return { text: 'Enter your text here...' };
      case 'image':
        return { src: '', alt: 'Image', width: '100%' };
      case 'columns':
        return { 
          columns: [
            { text: 'Column 1 content' },
            { text: 'Column 2 content' }
          ]
        };
      case 'divider':
        return { style: 'solid', color: '#e5e5e5' };
      default:
        return {};
    }
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const generateHTML = () => {
    return blocks.map(block => {
      switch (block.type) {
        case 'text':
          return `<p style="margin: 16px 0; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; white-space: pre-wrap;">${block.content.text}</p>`;
        case 'image':
          return block.content.src ? 
            `<img src="${block.content.src}" alt="${block.content.alt}" style="width: ${block.content.width}; max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px;" />` : 
            '';
        case 'columns':
          return `
            <table style="width: 100%; margin: 16px 0; border-collapse: collapse;">
              <tr>
                ${block.content.columns.map((col: any) => 
                  `<td style="width: ${100/block.content.columns.length}%; padding: 12px; vertical-align: top; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${col.text}</td>`
                ).join('')}
              </tr>
            </table>
          `;
        case 'divider':
          return `<hr style="border: none; border-top: 1px ${block.content.style} ${block.content.color}; margin: 24px 0;" />`;
        default:
          return '';
      }
    }).join('');
  };

  const handleSave = () => {
    const htmlContent = generateHTML();
    onSave(htmlContent);
    onOpenChange(false);
  };

  const getBlockIcon = (type: EmailBlock['type']) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'columns': return <Columns className="h-4 w-4" />;
      case 'divider': return <Minus className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  const renderBlockEditor = (block: EmailBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <Textarea
            value={block.content.text}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            placeholder="Enter your text here..."
            className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        );
      case 'image':
        return (
          <div className="space-y-3">
            <Input
              placeholder="Image URL (e.g., https://example.com/image.jpg)"
              value={block.content.src}
              onChange={(e) => updateBlock(block.id, { ...block.content, src: e.target.value })}
              className="border-gray-200 focus:border-blue-500"
            />
            <Input
              placeholder="Alt text (for accessibility)"
              value={block.content.alt}
              onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })}
              className="border-gray-200 focus:border-blue-500"
            />
            <Input
              placeholder="Width (e.g., 100%, 300px)"
              value={block.content.width}
              onChange={(e) => updateBlock(block.id, { ...block.content, width: e.target.value })}
              className="border-gray-200 focus:border-blue-500"
            />
          </div>
        );
      case 'columns':
        return (
          <div className="space-y-3">
            {block.content.columns.map((col: any, index: number) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Column {index + 1}</label>
                <Textarea
                  placeholder={`Column ${index + 1} content`}
                  value={col.text}
                  onChange={(e) => {
                    const newColumns = [...block.content.columns];
                    newColumns[index] = { text: e.target.value };
                    updateBlock(block.id, { columns: newColumns });
                  }}
                  className="min-h-[80px] border-gray-200 focus:border-blue-500"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newColumns = [...block.content.columns, { text: `Column ${block.content.columns.length + 1} content` }];
                updateBlock(block.id, { columns: newColumns });
              }}
              className="w-full border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-800">Email Design Editor</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'design' | 'preview')} className="flex-1 flex flex-col">
          <div className="flex justify-between items-center py-4 border-b">
            <TabsList className="grid w-48 grid-cols-2">
              <TabsTrigger value="design" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Design
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-300">
                Cancel
              </Button>
              <Button onClick={handleSave} variant="brand">
                <Save className="h-4 w-4 mr-2" />
                Save Design
              </Button>
            </div>
          </div>

          <TabsContent value="design" className="flex-1 flex gap-6 overflow-hidden">
            {/* Sidebar with modules */}
            <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
              <h3 className="font-semibold text-sm mb-4 text-gray-700 uppercase tracking-wide">Content Blocks</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onClick={() => addBlock('text')}
                >
                  <Type className="h-4 w-4 mr-3 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-800">Text Block</div>
                    <div className="text-xs text-gray-500">Add paragraphs</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onClick={() => addBlock('image')}
                >
                  <ImageIcon className="h-4 w-4 mr-3 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-800">Image</div>
                    <div className="text-xs text-gray-500">Add pictures</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onClick={() => addBlock('columns')}
                >
                  <Columns className="h-4 w-4 mr-3 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-800">Columns</div>
                    <div className="text-xs text-gray-500">Side by side</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onClick={() => addBlock('divider')}
                >
                  <Minus className="h-4 w-4 mr-3 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-800">Divider</div>
                    <div className="text-xs text-gray-500">Separator line</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Main editor area */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="max-w-2xl mx-auto space-y-4">
                {blocks.map((block, index) => (
                  <Card key={block.id} className="relative group hover:shadow-md transition-shadow border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          {getBlockIcon(block.type)}
                          <Badge variant="secondary" className="text-xs capitalize bg-gray-100 text-gray-700">
                            {block.type}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBlock(block.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {renderBlockEditor(block)}
                    </CardContent>
                  </Card>
                ))}

                {blocks.length === 0 && (
                  <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="p-12 text-center text-gray-500">
                      <Code className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2 text-gray-700">Start Building Your Email</h3>
                      <p className="text-sm">Choose content blocks from the sidebar to create your email design</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-6">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: generateHTML() }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
