import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ImageIcon, 
  Grid3x3, 
  FileText, 
  Star, 
  HelpCircle, 
  Megaphone,
  List,
  Type
} from "lucide-react";

interface SectionLibraryProps {
  onAddSection: (type: string) => void;
}

const sections = [
  {
    type: 'hero',
    label: 'Hero Section',
    description: 'Large header with image and title',
    icon: ImageIcon,
    badge: 'Popular'
  },
  {
    type: 'features',
    label: 'Features Grid',
    description: '3-column benefits showcase',
    icon: Grid3x3,
    badge: 'Essential'
  },
  {
    type: 'gallery',
    label: 'Image Gallery',
    description: 'Product photos showcase',
    icon: ImageIcon,
  },
  {
    type: 'specifications',
    label: 'Specifications',
    description: 'Technical details table',
    icon: List,
  },
  {
    type: 'testimonials',
    label: 'Customer Reviews',
    description: 'Testimonials and ratings',
    icon: Star,
    badge: 'Trust Builder'
  },
  {
    type: 'faq',
    label: 'FAQ Section',
    description: 'Common questions accordion',
    icon: HelpCircle,
  },
  {
    type: 'cta',
    label: 'Call to Action',
    description: 'Conversion-focused section',
    icon: Megaphone,
  },
  {
    type: 'richText',
    label: 'Rich Content',
    description: 'Custom text and formatting',
    icon: Type,
  },
];

export const SectionLibrary = ({ onAddSection }: SectionLibraryProps) => {
  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Button
              key={section.type}
              variant="outline"
              className="w-full justify-start h-auto py-3 text-left"
              onClick={() => onAddSection(section.type)}
            >
              <div className="flex items-start gap-3 w-full">
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{section.label}</span>
                    {section.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {section.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {section.description}
                  </p>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
