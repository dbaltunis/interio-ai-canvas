
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Type, Image, FileText, PenTool, Calculator, User, CreditCard, Upload } from "lucide-react";

interface BlockToolbarProps {
  onAddBlock: (type: string) => void;
}

export const BlockToolbar = ({ onAddBlock }: BlockToolbarProps) => {
  const blockTypes = [
    {
      type: 'text',
      label: 'Text Block',
      icon: Type,
      description: 'Add custom text, paragraphs, or terms'
    },
    {
      type: 'image',
      label: 'Image Upload',
      icon: Upload,
      description: 'Upload and position images'
    },
    {
      type: 'products',
      label: 'Product Table',
      icon: FileText,
      description: 'Display quote items in a table'
    },
    {
      type: 'signature',
      label: 'Signature',
      icon: PenTool,
      description: 'Add signature and date fields'
    },
    {
      type: 'payment',
      label: 'Pay Now Button',
      icon: CreditCard,
      description: 'Add payment button with options'
    }
  ];

  return (
    <div className="flex items-center justify-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Block
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="center">
          <div className="grid gap-2">
            <h4 className="font-medium leading-none mb-2">Add New Block</h4>
            {blockTypes.map((blockType) => (
              <Button
                key={blockType.type}
                variant="ghost"
                onClick={() => onAddBlock(blockType.type)}
                className="flex items-start gap-3 h-auto p-3 text-left"
              >
                <blockType.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{blockType.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {blockType.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
