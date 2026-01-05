
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Type, Image, FileText, PenTool, CreditCard, Upload, Ruler, Wrench, Building2, Banknote, User, Calculator, Space } from "lucide-react";
import { getAvailableBlocks } from "@/utils/documentTypeConfig";
import { cn } from "@/lib/utils";

interface BlockToolbarProps {
  onAddBlock: (type: string) => void;
  documentType?: string;
}

// All possible block types with their metadata
const ALL_BLOCK_TYPES = [
  // ===== UNIVERSAL BLOCKS =====
  {
    type: 'document-header',
    label: 'Document Header',
    icon: Image,
    description: 'Logo, company details, document title & metadata',
    badge: null,
    badgeColor: null
  },
  {
    type: 'client-info',
    label: 'Client Details',
    icon: User,
    description: '"Bill To" section with client name, address, email',
    badge: null,
    badgeColor: null
  },
  {
    type: 'text',
    label: 'Text Block',
    icon: Type,
    description: 'Custom text, paragraphs, or notes',
    badge: null,
    badgeColor: null
  },
  {
    type: 'image',
    label: 'Image Upload',
    icon: Upload,
    description: 'Upload and position images',
    badge: null,
    badgeColor: null
  },
  {
    type: 'products',
    label: 'Line Items Table',
    icon: FileText,
    description: 'Products, services, and pricing table',
    badge: null,
    badgeColor: null
  },
  {
    type: 'totals',
    label: 'Totals Section',
    icon: Calculator,
    description: 'Subtotal, tax, and total amount',
    badge: null,
    badgeColor: null
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: Space,
    description: 'Add vertical spacing between sections',
    badge: null,
    badgeColor: null
  },
  {
    type: 'footer',
    label: 'Document Footer',
    icon: FileText,
    description: 'Footer with T&C and contact info',
    badge: null,
    badgeColor: null
  },
  
  // ===== QUOTE/PROPOSAL BLOCKS =====
  {
    type: 'terms-conditions',
    label: 'Terms & Conditions',
    icon: FileText,
    description: 'Legal terms and acceptance conditions',
    badge: 'Quote',
    badgeColor: 'blue'
  },
  {
    type: 'signature',
    label: 'Client Signature',
    icon: PenTool,
    description: 'Acceptance signature and date',
    badge: 'Quote',
    badgeColor: 'blue'
  },
  {
    type: 'payment',
    label: 'Pay Now Button',
    icon: CreditCard,
    description: 'Online payment link/button',
    badge: 'Quote',
    badgeColor: 'blue'
  },
  
  // ===== INVOICE BLOCKS =====
  {
    type: 'payment-details',
    label: 'Bank/Payment Details',
    icon: Banknote,
    description: 'Bank account & payment instructions',
    badge: 'Invoice',
    badgeColor: 'green'
  },
  {
    type: 'registration-footer',
    label: 'Business Registration',
    icon: Building2,
    description: 'ABN/VAT/Tax registration (country-specific)',
    badge: 'Invoice',
    badgeColor: 'green'
  },
  
  // ===== WORK ORDER BLOCKS =====
  {
    type: 'installation-details',
    label: 'Installation Details',
    icon: Wrench,
    description: 'Install date, time, and team info',
    badge: 'Work Order',
    badgeColor: 'amber'
  },
  {
    type: 'measurements',
    label: 'Measurements Table',
    icon: Ruler,
    description: 'Detailed measurements for installers',
    badge: 'Work Order',
    badgeColor: 'amber'
  },
  {
    type: 'installer-signoff',
    label: 'Installer Sign-off',
    icon: PenTool,
    description: 'Completion confirmation signature',
    badge: 'Work Order',
    badgeColor: 'amber'
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
                className="flex items-start gap-3 h-auto p-3 text-left w-full"
              >
                <blockType.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{blockType.label}</span>
                    {blockType.badge && (
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded",
                        blockType.badgeColor === 'blue' && "bg-blue-100 text-blue-700",
                        blockType.badgeColor === 'green' && "bg-green-100 text-green-700",
                        blockType.badgeColor === 'amber' && "bg-amber-100 text-amber-700"
                      )}>
                        {blockType.badge}
                      </span>
                    )}
                  </div>
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
