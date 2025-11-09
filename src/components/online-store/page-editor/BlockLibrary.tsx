import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Image, 
  Layout, 
  MessageSquare, 
  Zap, 
  Type, 
  HelpCircle,
  Mail,
  Video
} from "lucide-react";

interface BlockLibraryProps {
  onAddBlock: (type: string) => void;
}

export const BlockLibrary = ({ onAddBlock }: BlockLibraryProps) => {
  const blocks = [
    {
      type: 'hero',
      label: 'Hero Section',
      description: 'Large header with CTA',
      icon: Image,
      seoValue: 'High',
    },
    {
      type: 'features',
      label: 'Features Grid',
      description: '3-column feature showcase',
      icon: Layout,
      seoValue: 'Medium',
    },
    {
      type: 'products',
      label: 'Product Showcase',
      description: 'Display your products',
      icon: Layout,
      seoValue: 'High',
    },
    {
      type: 'testimonials',
      label: 'Testimonials',
      description: 'Customer reviews',
      icon: MessageSquare,
      seoValue: 'Medium',
    },
    {
      type: 'cta',
      label: 'Call to Action',
      description: 'Conversion-focused section',
      icon: Zap,
      seoValue: 'Low',
    },
    {
      type: 'text',
      label: 'Text Content',
      description: 'Rich text section',
      icon: Type,
      seoValue: 'High',
    },
    {
      type: 'faq',
      label: 'FAQ Section',
      description: 'Q&A for customers',
      icon: HelpCircle,
      seoValue: 'Very High',
    },
    {
      type: 'contact',
      label: 'Contact Form',
      description: 'Lead capture form',
      icon: Mail,
      seoValue: 'Low',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Block Library</CardTitle>
        <CardDescription>Add sections to your page</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {blocks.map((block) => {
            const Icon = block.icon;
            return (
              <Button
                key={block.type}
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => onAddBlock(block.type)}
              >
                <div className="flex items-start gap-3 text-left w-full">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{block.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {block.description}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      block.seoValue === 'Very High' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' :
                      block.seoValue === 'High' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' :
                      block.seoValue === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {block.seoValue} SEO
                    </span>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
