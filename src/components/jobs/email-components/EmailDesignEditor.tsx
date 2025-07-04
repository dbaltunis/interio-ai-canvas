
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
  Save
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          return `<p style="margin: 16px 0; line-height: 1.5; white-space: pre-wrap;">${block.content.text}</p>`;
        case 'image':
          return block.content.src ? 
            `<img src="${block.content.src}" alt="${block.content.alt}" style="width: ${block.content.width}; max-width: 100%; height: auto; margin: 16px 0;" />` : 
            '';
        case 'columns':
          return `
            <table style="width: 100%; margin: 16px 0;">
              <tr>
                ${block.content.columns.map((col: any) => 
                  `<td style="width: ${100/block.content.columns.length}%; padding: 8px; vertical-align: top;">${col.text}</td>`
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

  const renderBlockEditor = (block: EmailBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <Textarea
            value={block.content.text}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            placeholder="Enter your text here..."
            className="min-h-[120px]"
          />
        );
      case 'image':
        return (
          <div className="space-y-2">
            <Input
              placeholder="Image URL"
              value={block.content.src}
              onChange={(e) => updateBlock(block.id, { ...block.content, src: e.target.value })}
            />
            <Input
              placeholder="Alt text"
              value={block.content.alt}
              onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })}
            />
            <Input
              placeholder="Width (e.g., 100%, 300px)"
              value={block.content.width}
              onChange={(e) => updateBlock(block.id, { ...block.content, width: e.target.value })}
            />
          </div>
        );
      case 'columns':
        return (
          <div className="space-y-2">
            {block.content.columns.map((col: any, index: number) => (
              <Textarea
                key={index}
                placeholder={`Column ${index + 1} content`}
                value={col.text}
                onChange={(e) => {
                  const newColumns = [...block.content.columns];
                  newColumns[index] = { text: e.target.value };
                  updateBlock(block.id, { columns: newColumns });
                }}
                className="min-h-[80px]"
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newColumns = [...block.content.columns, { text: `Column ${block.content.columns.length + 1} content` }];
                updateBlock(block.id, { columns: newColumns });
              }}
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Design Editor</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'design' | 'preview')}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          <TabsContent value="design" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Sidebar with modules */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm mb-3">ADD MODULES</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addBlock('text')}
                  >
                    <Type className="h-4 w-4 mr-2" />
                    Text
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addBlock('image')}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Image
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addBlock('columns')}
                  >
                    <Columns className="h-4 w-4 mr-2" />
                    Columns
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addBlock('divider')}
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Divider
                  </Button>
                </div>
              </div>

              {/* Main editor area */}
              <div className="lg:col-span-3 space-y-4">
                {blocks.map((block) => (
                  <Card key={block.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium capitalize">
                          {block.type}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBlock(block.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                      {renderBlockEditor(block)}
                    </CardContent>
                  </Card>
                ))}

                {blocks.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-gray-500">
                      <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Drag modules here or click the buttons to add content</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardContent className="p-6">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: generateHTML() }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
