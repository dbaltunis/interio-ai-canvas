import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Eye, Sparkles, Building2, Palette, Briefcase, Camera, ExternalLink } from "lucide-react";
import { StoreTemplate } from "@/types/online-store";
import { Skeleton } from "@/components/ui/skeleton";

interface StoreTemplateGalleryProps {
  onSelectTemplate: (template: StoreTemplate) => void;
}

const categoryConfig = {
  all: { label: "All Templates", icon: Sparkles },
  modern: { label: "Modern", icon: Sparkles },
  classic: { label: "Classic", icon: Building2 },
  bold: { label: "Bold", icon: Palette },
  professional: { label: "Professional", icon: Briefcase },
  portfolio: { label: "Portfolio", icon: Camera },
};

export const StoreTemplateGallery = ({ onSelectTemplate }: StoreTemplateGalleryProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['store-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_templates')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data as any as StoreTemplate[];
    },
  });

  const filteredTemplates = templates?.filter(
    (t) => activeCategory === "all" || t.category === activeCategory
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <div className="p-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Choose Your Store Template</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Start with a professionally designed template. Customize colors, fonts, and layout to match your brand perfectly.
        </p>
      </div>

      {/* Category Filter */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 lg:grid-cols-6 h-auto gap-2 bg-muted/50 p-2">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-3"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Template Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTemplates?.map((template) => {
          const isSelected = selectedId === template.id;
          const isHovered = hoveredId === template.id;

          return (
            <Card
              key={template.id}
              className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
              style={{
                borderColor: isSelected ? 'hsl(var(--primary))' : undefined,
              }}
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Preview Image */}
              <div className="relative h-72 overflow-hidden bg-muted">
                {template.preview_images && template.preview_images.length > 0 ? (
                  <img
                    src={template.preview_images[0]}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : template.preview_image_url ? (
                  <img
                    src={template.preview_image_url}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${template.template_config.colors.primary}, ${template.template_config.colors.secondary})`,
                    }}
                  >
                    <Sparkles className="h-16 w-16 text-white/60" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div
                  className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center gap-3 transition-opacity duration-300"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    pointerEvents: isHovered ? 'auto' : 'none',
                  }}
                >
                  {template.demo_url && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(template.demo_url, '_blank');
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      View Live Demo
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(template.id);
                    }}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-4 w-4" />
                        Selected
                      </>
                    ) : (
                      'Select Template'
                    )}
                  </Button>
                </div>

                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                    <Check className="h-5 w-5" />
                  </div>
                )}

                {/* Popular Badge */}
                {template.is_default && (
                  <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground shadow-lg">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>

              {/* Template Info */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold tracking-tight">{template.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description || "A beautiful template for your online store"}
                  </p>
                </div>

                {/* Features */}
                {template.features && Object.keys(template.features).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(template.features).slice(0, 3).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {String(value)}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Color Palette */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">Colors:</span>
                  <div className="flex gap-1.5">
                    {Object.entries(template.template_config.colors)
                      .slice(0, 5)
                      .map(([key, color]) => (
                        <div
                          key={key}
                          className="h-7 w-7 rounded-full border-2 border-background shadow-sm"
                          style={{ backgroundColor: color }}
                          title={key}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates?.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-lg text-muted-foreground">No templates found in this category</p>
          <Button variant="outline" onClick={() => setActiveCategory("all")}>
            View All Templates
          </Button>
        </div>
      )}

      {/* Continue Button */}
      {selectedId && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
          <Button
            size="lg"
            className="shadow-2xl gap-2 px-8"
            onClick={() => {
              const selected = templates?.find((t) => t.id === selectedId);
              if (selected) onSelectTemplate(selected);
            }}
          >
            <Check className="h-5 w-5" />
            Continue with Selected Template
          </Button>
        </div>
      )}
    </div>
  );
};
