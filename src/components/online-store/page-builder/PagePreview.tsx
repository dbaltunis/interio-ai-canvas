import { Star, Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

interface PagePreviewProps {
  sections: Array<{
    id: string;
    type: string;
    content: any;
  }>;
}

export const PagePreview = ({ sections }: PagePreviewProps) => {
  return (
    <div className="space-y-12 bg-background">
      {sections.map((section) => (
        <div key={section.id}>
          {renderSection(section.type, section.content)}
        </div>
      ))}
    </div>
  );
};

const renderSection = (type: string, content: any) => {
  switch (type) {
    case 'hero':
      return (
        <div className="relative h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
          {content.imageUrl && (
            <img src={content.imageUrl} alt={content.title} className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end">
            <div className="p-12">
              <h1 className="text-6xl font-bold mb-4">{content.title || 'Hero Title'}</h1>
              <p className="text-2xl text-muted-foreground">{content.subtitle || 'Subtitle'}</p>
            </div>
          </div>
        </div>
      );

    case 'features':
      return (
        <div className="grid md:grid-cols-3 gap-8 p-8">
          {(content.items || []).map((item: any, index: number) => (
            <div key={index} className="p-6 rounded-xl bg-card border">
              <Check className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      );

    case 'gallery':
      return (
        <div className="grid md:grid-cols-3 gap-4 p-8">
          {(content.images || []).map((url: string, index: number) => (
            <div key={index} className="aspect-square rounded-2xl overflow-hidden bg-muted">
              <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      );

    case 'specifications':
      return (
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6">Specifications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(content.specs || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between p-4 border-b">
                <span className="font-medium">{key}</span>
                <span className="text-muted-foreground">{value as string}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'testimonials':
      return (
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-8 text-center">What Our Customers Say</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {(content.reviews || []).map((review: any, index: number) => (
              <div key={index} className="p-6 rounded-xl bg-card border">
                <div className="flex gap-1 mb-3">
                  {[...Array(review.rating || 5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-lg mb-4">"{review.text}"</p>
                <p className="font-semibold">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'faq':
      return (
        <div className="p-8 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            {(content.questions || []).map((item: any, index: number) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );

    case 'cta':
      return (
        <div className="p-12 text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl">
          <h2 className="text-4xl font-bold mb-6">{content.title}</h2>
          <Button size="lg" asChild>
            <a href={content.buttonLink || '#'}>
              {content.buttonText || 'Get Started'}
            </a>
          </Button>
        </div>
      );

    case 'richText':
      return (
        <div 
          className="p-8 prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: content.content || '' }}
        />
      );

    default:
      return null;
  }
};
