import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentBlock } from './DocumentBuilderTab';
import { Settings, Paintbrush, Image as ImageIcon } from 'lucide-react';

interface PropertiesPanelProps {
  selectedBlock: DocumentBlock | null;
  onBlockUpdate: (blockId: string, updates: Partial<DocumentBlock>) => void;
}

export const PropertiesPanel = ({ selectedBlock, onBlockUpdate }: PropertiesPanelProps) => {
  if (!selectedBlock) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <div className="p-3 bg-muted/20 rounded-full inline-block mb-3">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Select a block to edit its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Properties</h3>
        <p className="text-xs text-muted-foreground mt-1 capitalize">
          {selectedBlock.type} Block
        </p>
      </div>

      {/* Properties Tabs */}
      <ScrollArea className="flex-1">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mx-4 my-3">
            <TabsTrigger value="general" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              General
            </TabsTrigger>
            <TabsTrigger value="style" className="text-xs">
              <Paintbrush className="h-3 w-3 mr-1" />
              Style
            </TabsTrigger>
            <TabsTrigger value="image" className="text-xs">
              <ImageIcon className="h-3 w-3 mr-1" />
              Image
            </TabsTrigger>
          </TabsList>

          <div className="px-4 pb-4">
            <TabsContent value="general" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label className="text-xs">Block Name</Label>
                <Input 
                  placeholder="Enter block name..."
                  defaultValue={selectedBlock.type}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Visible</Label>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Padding</Label>
                <Slider defaultValue={[16]} max={100} step={4} className="py-2" />
                <div className="text-xs text-muted-foreground text-right">16px</div>
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label className="text-xs">Background Color</Label>
                <div className="flex gap-2">
                  <Input type="color" defaultValue="#ffffff" className="h-8 w-12 p-1" />
                  <Input defaultValue="#ffffff" className="h-8 flex-1 text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Text Color</Label>
                <div className="flex gap-2">
                  <Input type="color" defaultValue="#000000" className="h-8 w-12 p-1" />
                  <Input defaultValue="#000000" className="h-8 flex-1 text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Border Radius</Label>
                <Slider defaultValue={[4]} max={32} step={2} className="py-2" />
                <div className="text-xs text-muted-foreground text-right">4px</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Border</Label>
                  <Switch />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label className="text-xs">Image Width</Label>
                <Slider defaultValue={[200]} max={800} step={10} className="py-2" />
                <div className="text-xs text-muted-foreground text-right">200px</div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Image Height</Label>
                <Slider defaultValue={[200]} max={800} step={10} className="py-2" />
                <div className="text-xs text-muted-foreground text-right">200px</div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Position</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['Left', 'Center', 'Right'].map(pos => (
                    <button
                      key={pos}
                      className="px-3 py-1.5 text-xs border border-border rounded hover:bg-accent transition-colors"
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Images Per Row</Label>
                <Input type="number" min={1} max={5} defaultValue={1} className="h-8 text-sm" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Product Images</Label>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Fabric Images</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </ScrollArea>
    </div>
  );
};
