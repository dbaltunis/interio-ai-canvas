import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, FileText, Briefcase, Sparkles, Layout } from "lucide-react";

interface QuoteTemplateSelectorProps {
  onSelectTemplate: (blocks: any[]) => void;
}

const quickTemplates = [
  {
    id: 'simple',
    name: 'Simple Quote',
    icon: FileText,
    description: 'Basic quote with essentials',
    blocks: [] // Would contain the actual block configuration
  },
  {
    id: 'detailed',
    name: 'Detailed Professional',
    icon: Briefcase,
    description: 'Full breakdown with itemization',
    blocks: []
  },
  {
    id: 'brochure',
    name: 'Marketing Brochure',
    icon: Sparkles,
    description: 'Rich visual presentation',
    blocks: []
  }
];

export const QuoteTemplateSelector = ({ onSelectTemplate }: QuoteTemplateSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Layout className="h-4 w-4" />
          Quick Templates
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Choose Template Style</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {quickTemplates.map((template) => (
          <DropdownMenuItem 
            key={template.id}
            onClick={() => onSelectTemplate(template.blocks)}
            className="flex items-start gap-3 p-3 cursor-pointer"
          >
            <template.icon className="h-4 w-4 mt-0.5 text-blue-600" />
            <div>
              <div className="font-medium text-sm">{template.name}</div>
              <div className="text-xs text-gray-600">{template.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onSelectTemplate([])}>
          <Layout className="h-4 w-4 mr-2" />
          Blank Template
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};