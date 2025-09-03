import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Type, 
  Image, 
  Table, 
  PenTool, 
  FileText, 
  Calculator, 
  CreditCard,
  MapPin,
  Users,
  Calendar,
  Star,
  Palette,
  Shapes,
  Layout,
  ShoppingCart,
  DollarSign,
  ScrollText,
  Target,
  Minus,
  Space
} from "lucide-react";

interface ComponentLibraryProps {
  onAddBlock: (type: string) => void;
}

const componentCategories = [
  {
    name: "Text Elements",
    icon: Type,
    components: [
      { type: 'text', name: 'Text Block', icon: Type, description: 'Add formatted text' },
      { type: 'header', name: 'Company Header', icon: FileText, description: 'Company info & logo' },
      { type: 'client-info', name: 'Client Details', icon: Users, description: 'Client information' },
    ]
  },
  {
    name: "Visual Elements",
    icon: Image,
    components: [
      { type: 'image', name: 'Image', icon: Image, description: 'Add images or graphics' },
      { type: 'products', name: 'Product Gallery', icon: Layout, description: 'Visual product showcase' },
    ]
  },
  {
    name: "Data & Tables",
    icon: Table,
    components: [
      { type: 'line-items', name: 'Line Items Table', icon: ShoppingCart, description: 'Professional itemized list with totals' },
      { type: 'products', name: 'Products Table', icon: Table, description: 'Product showcase table' },
      { type: 'totals', name: 'Price Summary', icon: Calculator, description: 'Subtotal, tax, total' },
    ]
  },
  {
    name: "Business Content",
    icon: FileText,
    components: [
      { type: 'terms-conditions', name: 'Terms & Conditions', icon: ScrollText, description: 'Legal terms and policies' },
      { type: 'payment-info', name: 'Payment Information', icon: DollarSign, description: 'Payment methods and schedule' },
      { type: 'project-scope', name: 'Project Scope', icon: Target, description: 'What\'s included and excluded' },
    ]
  },
  {
    name: "Interactive",
    icon: PenTool,
    components: [
      { type: 'signature', name: 'Signature', icon: PenTool, description: 'Digital signature field' },
      { type: 'payment', name: 'Payment Button', icon: CreditCard, description: 'Payment processing' },
    ]
  },
  {
    name: "Layout",
    icon: Shapes,
    components: [
      { type: 'spacer', name: 'Spacer', icon: Shapes, description: 'Add vertical space' },
      { type: 'divider', name: 'Divider', icon: Shapes, description: 'Section separator' },
      { type: 'footer', name: 'Footer', icon: FileText, description: 'Template footer' },
    ]
  }
];

const popularComponents = [
  { type: 'line-items', name: 'Line Items Table', badge: 'New' },
  { type: 'terms-conditions', name: 'Terms & Conditions', badge: 'Essential' },
  { type: 'payment-info', name: 'Payment Information', badge: 'Popular' },
  { type: 'signature', name: 'Digital Signature', badge: 'Pro' }
];

export const ComponentLibrary = ({ onAddBlock }: ComponentLibraryProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Palette className="h-5 w-5 text-blue-600" />
          Component Library
        </h3>
        <p className="text-sm text-gray-600 mt-1">Drag or click to add elements</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Popular Components */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-yellow-500" />
              <h4 className="text-sm font-medium text-gray-900">Popular</h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {popularComponents.map((component) => (
                <Button
                  key={`popular-${component.type}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddBlock(component.type)}
                  className="justify-start h-auto p-3 hover:bg-blue-50 hover:border-blue-200 border border-transparent"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium">{component.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {component.badge}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Component Categories */}
          {componentCategories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center gap-2 mb-3">
                <category.icon className="h-4 w-4 text-gray-600" />
                <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
              </div>
              <div className="space-y-1">
                {category.components.map((component) => (
                  <Button
                    key={`${category.name}-${component.type}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddBlock(component.type)}
                    className="w-full justify-start h-auto p-3 hover:bg-blue-50 hover:border-blue-200 border border-transparent"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <component.icon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {component.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {component.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};