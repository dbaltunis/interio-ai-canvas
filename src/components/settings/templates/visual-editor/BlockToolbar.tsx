
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Type, Image, FileText, PenTool, CreditCard, Upload, Ruler, Wrench, Building2, Banknote } from "lucide-react";
import { getAvailableBlocks } from "@/utils/documentTypeConfig";

interface BlockToolbarProps {
  onAddBlock: (type: string) => void;
  documentType?: string;
}

// All possible block types with their metadata
const ALL_BLOCK_TYPES = [
  {
    type: 'document-header',
    label: 'Document Header',
    icon: Image,
    description: 'Customizable header with logo, title & metadata'
  },
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
    label: 'Client Signature',
    icon: PenTool,
    description: 'Add client signature and date fields'
  },
  {
    type: 'payment',
    label: 'Pay Now Button',
    icon: CreditCard,
    description: 'Add payment button with options'
  },
  {
    type: 'footer',
    label: 'Footer',
    icon: FileText,
    description: 'Add footer with T&C from settings'
  },
  // Invoice-specific blocks
  {
    type: 'payment-details',
    label: 'Payment Details',
    icon: Banknote,
    description: 'Bank account details and payment instructions'
  },
  {
    type: 'registration-footer',
    label: 'Registration Footer',
    icon: Building2,
    description: 'Company registration and tax numbers'
  },
  // Work order-specific blocks
  {
    type: 'installation-details',
    label: 'Installation Details',
    icon: Wrench,
    description: 'Installation date, time, and team info'
  },
  {
    type: 'measurements',
    label: 'Measurements',
    icon: Ruler,
    description: 'Detailed measurements table'
  },
  {
    type: 'installer-signoff',
    label: 'Installer Sign-off',
    icon: PenTool,
    description: 'Installer completion signature'
  }
];

export const BlockToolbar = ({ onAddBlock, documentType = 'quote' }: BlockToolbarProps) => {
  // Get available blocks for this document type
  const availableBlockTypes = getAvailableBlocks(documentType);
  
  // Filter block types to only show relevant ones
  const blockTypes = ALL_BLOCK_TYPES.filter(block => 
    availableBlockTypes.includes(block.type)
  );

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
