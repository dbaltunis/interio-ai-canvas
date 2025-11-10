import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Save, Eye, Plus } from "lucide-react";
import { SectionLibrary } from "./SectionLibrary";
import { SortableSection } from "./SortableSection";
import { PagePreview } from "./PagePreview";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PageSection {
  id: string;
  type: string;
  content: any;
}

interface ProductPageBuilderProps {
  productId: string;
  storeId: string;
  initialSections?: PageSection[];
  onClose: () => void;
}

export const ProductPageBuilder = ({ productId, storeId, initialSections = [], onClose }: ProductPageBuilderProps) => {
  const [sections, setSections] = useState<PageSection[]>(initialSections.length > 0 ? initialSections : []);
  const [showPreview, setShowPreview] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const savePage = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('store_product_visibility')
        .update({ 
          page_structure: sections as any
        })
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-product-catalog', storeId] });
      toast.success("Product page saved successfully!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to save product page");
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addSection = (type: string) => {
    const newSection: PageSection = {
      id: `section-${Date.now()}-${Math.random()}`,
      type,
      content: getDefaultContent(type)
    };
    setSections([...sections, newSection]);
    setShowLibrary(false);
  };

  const updateSection = (id: string, content: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, content } : s));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const getDefaultContent = (type: string) => {
    const defaults: Record<string, any> = {
      hero: { title: "Premium Window Treatment", subtitle: "Custom made to perfection", imageUrl: "" },
      features: { items: [
        { icon: "Check", title: "Premium Quality", description: "Made from the finest materials" },
        { icon: "Ruler", title: "Custom Measurements", description: "Perfectly fitted to your windows" },
        { icon: "Truck", title: "Free Delivery", description: "Delivered and installed" }
      ]},
      gallery: { images: [], layout: "grid" },
      specifications: { specs: { Material: "100% Premium Fabric", Width: "Custom", Drop: "Custom" }},
      testimonials: { reviews: [
        { name: "Sarah Johnson", rating: 5, text: "Absolutely beautiful curtains!", image: "" }
      ]},
      faq: { questions: [
        { question: "How long does delivery take?", answer: "2-3 weeks for custom orders" }
      ]},
      cta: { title: "Ready to Transform Your Space?", buttonText: "Get Started", buttonLink: "#calculator" },
      richText: { content: "<h2>About This Product</h2><p>Discover the perfect window treatment solution...</p>" }
    };
    return defaults[type] || {};
  };

  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="container py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Preview Mode</h2>
            <Button onClick={() => setShowPreview(false)} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Exit Preview
            </Button>
          </div>
          <PagePreview sections={sections} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h2 className="text-2xl font-bold">Product Page Builder</h2>
            <p className="text-sm text-muted-foreground">Drag and drop sections to create your custom page</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={() => savePage.mutate()} disabled={savePage.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {savePage.isPending ? 'Saving...' : 'Save & Publish'}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Section Library */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Add Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <SectionLibrary onAddSection={addSection} />
              </CardContent>
            </Card>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-3">
            {sections.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Plus className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Start Building</h3>
                  <p className="text-muted-foreground mb-4">
                    Add sections from the library to create your custom product page
                  </p>
                  <Button onClick={() => addSection('hero')}>
                    Add Hero Section
                  </Button>
                </div>
              </Card>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {sections.map((section) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        onUpdate={updateSection}
                        onRemove={removeSection}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
