import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface SectionEditorProps {
  type: string;
  content: any;
  onChange: (content: any) => void;
}

export const SectionEditor = ({ type, content, onChange }: SectionEditorProps) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...content, [field]: value });
  };

  const updateArrayItem = (field: string, index: number, itemField: string, value: any) => {
    const items = [...(content[field] || [])];
    items[index] = { ...items[index], [itemField]: value };
    onChange({ ...content, [field]: items });
  };

  const addArrayItem = (field: string, defaultItem: any) => {
    const items = [...(content[field] || []), defaultItem];
    onChange({ ...content, [field]: items });
  };

  const removeArrayItem = (field: string, index: number) => {
    const items = (content[field] || []).filter((_: any, i: number) => i !== index);
    onChange({ ...content, [field]: items });
  };

  switch (type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={content.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Premium Window Treatment"
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input
              value={content.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Custom made to perfection"
            />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input
              value={content.imageUrl || ''}
              onChange={(e) => updateField('imageUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      );

    case 'features':
      return (
        <div className="space-y-4">
          <Label>Features</Label>
          {(content.items || []).map((item: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Feature {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeArrayItem('items', index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Input
                value={item.title || ''}
                onChange={(e) => updateArrayItem('items', index, 'title', e.target.value)}
                placeholder="Feature title"
              />
              <Textarea
                value={item.description || ''}
                onChange={(e) => updateArrayItem('items', index, 'description', e.target.value)}
                placeholder="Feature description"
                rows={2}
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('items', { title: '', description: '' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>
      );

    case 'gallery':
      return (
        <div className="space-y-4">
          <Label>Image URLs (one per line)</Label>
          <Textarea
            value={(content.images || []).join('\n')}
            onChange={(e) => updateField('images', e.target.value.split('\n').filter(Boolean))}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            rows={6}
          />
        </div>
      );

    case 'specifications':
      return (
        <div className="space-y-4">
          <Label>Specifications (Key: Value format)</Label>
          <Textarea
            value={Object.entries(content.specs || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}
            onChange={(e) => {
              const specs: Record<string, string> = {};
              e.target.value.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length) {
                  specs[key.trim()] = valueParts.join(':').trim();
                }
              });
              updateField('specs', specs);
            }}
            placeholder="Material: 100% Premium Fabric&#10;Width: Custom&#10;Drop: Custom"
            rows={8}
          />
        </div>
      );

    case 'testimonials':
      return (
        <div className="space-y-4">
          <Label>Customer Reviews</Label>
          {(content.reviews || []).map((review: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Review {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeArrayItem('reviews', index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Input
                value={review.name || ''}
                onChange={(e) => updateArrayItem('reviews', index, 'name', e.target.value)}
                placeholder="Customer name"
              />
              <Input
                type="number"
                min="1"
                max="5"
                value={review.rating || 5}
                onChange={(e) => updateArrayItem('reviews', index, 'rating', parseInt(e.target.value))}
                placeholder="Rating (1-5)"
              />
              <Textarea
                value={review.text || ''}
                onChange={(e) => updateArrayItem('reviews', index, 'text', e.target.value)}
                placeholder="Review text"
                rows={2}
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('reviews', { name: '', rating: 5, text: '' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </div>
      );

    case 'faq':
      return (
        <div className="space-y-4">
          <Label>FAQ Items</Label>
          {(content.questions || []).map((item: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Question {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeArrayItem('questions', index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Input
                value={item.question || ''}
                onChange={(e) => updateArrayItem('questions', index, 'question', e.target.value)}
                placeholder="Question"
              />
              <Textarea
                value={item.answer || ''}
                onChange={(e) => updateArrayItem('questions', index, 'answer', e.target.value)}
                placeholder="Answer"
                rows={2}
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('questions', { question: '', answer: '' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      );

    case 'cta':
      return (
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={content.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Ready to Transform Your Space?"
            />
          </div>
          <div>
            <Label>Button Text</Label>
            <Input
              value={content.buttonText || ''}
              onChange={(e) => updateField('buttonText', e.target.value)}
              placeholder="Get Started"
            />
          </div>
          <div>
            <Label>Button Link</Label>
            <Input
              value={content.buttonLink || ''}
              onChange={(e) => updateField('buttonLink', e.target.value)}
              placeholder="#calculator"
            />
          </div>
        </div>
      );

    case 'richText':
      return (
        <div className="space-y-4">
          <Label>Content (HTML supported)</Label>
          <Textarea
            value={content.content || ''}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder="<h2>About This Product</h2><p>Description...</p>"
            rows={10}
            className="font-mono text-sm"
          />
        </div>
      );

    default:
      return <p className="text-sm text-muted-foreground">Editor not available for this section type</p>;
  }
};
