import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Settings } from "lucide-react";
import { useState } from "react";
import { SectionEditor } from "./SectionEditor";

interface SortableSectionProps {
  section: {
    id: string;
    type: string;
    content: any;
  };
  onUpdate: (id: string, content: any) => void;
  onRemove: (id: string) => void;
}

export const SortableSection = ({ section, onUpdate, onRemove }: SortableSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: section.id 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSectionLabel = (type: string) => {
    const labels: Record<string, string> = {
      hero: 'Hero Section',
      features: 'Features Grid',
      gallery: 'Image Gallery',
      specifications: 'Specifications',
      testimonials: 'Customer Reviews',
      faq: 'FAQ Section',
      cta: 'Call to Action',
      richText: 'Rich Content'
    };
    return labels[type] || type;
  };

  return (
    <Card ref={setNodeRef} style={style} className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">{getSectionLabel(section.type)}</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(section.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <SectionEditor
            type={section.type}
            content={section.content}
            onChange={(content) => onUpdate(section.id, content)}
          />
        ) : (
          <div className="p-6 bg-muted/30 rounded-lg border-2 border-dashed">
            <p className="text-sm text-muted-foreground text-center">
              Click <Settings className="h-3 w-3 inline" /> to edit content
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
