import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  GripVertical, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Image,
  Type,
  Layout,
  MessageSquare,
  Zap
} from "lucide-react";

interface BlockEditorProps {
  block: any;
  index: number;
  onUpdate: (index: number, content: any) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

export const BlockEditor = ({
  block,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: BlockEditorProps) => {
  const getBlockIcon = (type: string) => {
    const icons: Record<string, any> = {
      hero: Image,
      features: Layout,
      products: Layout,
      testimonials: MessageSquare,
      cta: Zap,
      text: Type,
      faq: MessageSquare,
    };
    const Icon = icons[type] || Layout;
    return <Icon className="h-4 w-4" />;
  };

  const updateContent = (key: string, value: any) => {
    onUpdate(index, { ...block.content, [key]: value });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1 pt-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 cursor-grab"
          >
            <GripVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-3">
          {/* Block Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getBlockIcon(block.type)}
              <span className="font-semibold capitalize">{block.type} Section</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onMoveUp(index)}
                disabled={isFirst}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onMoveDown(index)}
                disabled={isLast}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onRemove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Block Content Editor */}
          <div className="space-y-3">
            {block.type === 'hero' && (
              <>
                <div className="space-y-2">
                  <Label>Headline (H1 - SEO Critical)</Label>
                  <Input
                    value={block.content.headline || ''}
                    onChange={(e) => updateContent('headline', e.target.value)}
                    placeholder="Main headline - include primary keyword"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subheadline</Label>
                  <Textarea
                    value={block.content.subheadline || ''}
                    onChange={(e) => updateContent('subheadline', e.target.value)}
                    placeholder="Supporting text - answer what you do"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Button Text</Label>
                  <Input
                    value={block.content.ctaText || ''}
                    onChange={(e) => updateContent('ctaText', e.target.value)}
                    placeholder="e.g., Get Free Quote"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Background Image URL</Label>
                  <Input
                    value={block.content.imageUrl || ''}
                    onChange={(e) => updateContent('imageUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image Alt Text (SEO)</Label>
                  <Input
                    value={block.content.imageAlt || ''}
                    onChange={(e) => updateContent('imageAlt', e.target.value)}
                    placeholder="Descriptive alt text for accessibility"
                  />
                </div>
              </>
            )}

            {block.type === 'features' && (
              <>
                <div className="space-y-2">
                  <Label>Section Heading (H2)</Label>
                  <Input
                    value={block.content.heading || ''}
                    onChange={(e) => updateContent('heading', e.target.value)}
                    placeholder="Why Choose Us"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Features (JSON array)</Label>
                  <Textarea
                    value={block.content.features || ''}
                    onChange={(e) => updateContent('features', e.target.value)}
                    placeholder='[{"title":"Feature 1","description":"...","icon":"check"}]'
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: Array of objects with title, description, icon
                  </p>
                </div>
              </>
            )}

            {block.type === 'products' && (
              <>
                <div className="space-y-2">
                  <Label>Section Heading (H2)</Label>
                  <Input
                    value={block.content.heading || ''}
                    onChange={(e) => updateContent('heading', e.target.value)}
                    placeholder="Our Products"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Type</Label>
                  <select
                    value={block.content.displayType || 'featured'}
                    onChange={(e) => updateContent('displayType', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="featured">Featured Products</option>
                    <option value="all">All Products</option>
                    <option value="category">By Category</option>
                  </select>
                </div>
              </>
            )}

            {block.type === 'testimonials' && (
              <>
                <div className="space-y-2">
                  <Label>Section Heading (H2)</Label>
                  <Input
                    value={block.content.heading || ''}
                    onChange={(e) => updateContent('heading', e.target.value)}
                    placeholder="What Our Customers Say"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Testimonials (JSON array)</Label>
                  <Textarea
                    value={block.content.testimonials || ''}
                    onChange={(e) => updateContent('testimonials', e.target.value)}
                    placeholder='[{"name":"John Doe","text":"Great service!","rating":5}]'
                    rows={4}
                  />
                </div>
              </>
            )}

            {block.type === 'cta' && (
              <>
                <div className="space-y-2">
                  <Label>CTA Headline</Label>
                  <Input
                    value={block.content.headline || ''}
                    onChange={(e) => updateContent('headline', e.target.value)}
                    placeholder="Ready to get started?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Text</Label>
                  <Textarea
                    value={block.content.text || ''}
                    onChange={(e) => updateContent('text', e.target.value)}
                    placeholder="Supporting message"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={block.content.buttonText || ''}
                    onChange={(e) => updateContent('buttonText', e.target.value)}
                    placeholder="Contact Us Today"
                  />
                </div>
              </>
            )}

            {block.type === 'text' && (
              <>
                <div className="space-y-2">
                  <Label>Heading (H2 or H3)</Label>
                  <Input
                    value={block.content.heading || ''}
                    onChange={(e) => updateContent('heading', e.target.value)}
                    placeholder="Section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={block.content.text || ''}
                    onChange={(e) => updateContent('text', e.target.value)}
                    placeholder="Write your content here..."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use clear, conversational language. Include relevant keywords naturally.
                  </p>
                </div>
              </>
            )}

            {block.type === 'faq' && (
              <>
                <div className="space-y-2">
                  <Label>Section Heading</Label>
                  <Input
                    value={block.content.heading || ''}
                    onChange={(e) => updateContent('heading', e.target.value)}
                    placeholder="Frequently Asked Questions"
                  />
                </div>
                <div className="space-y-2">
                  <Label>FAQ Items (JSON array)</Label>
                  <Textarea
                    value={block.content.items || ''}
                    onChange={(e) => updateContent('items', e.target.value)}
                    placeholder='[{"question":"How much does it cost?","answer":"Pricing varies..."}]'
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Critical for AI search! Answer actual customer questions.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
