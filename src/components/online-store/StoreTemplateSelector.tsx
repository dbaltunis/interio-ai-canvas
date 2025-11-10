import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Building2, Palette, Briefcase, Camera, Eye, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { StoreTemplate } from "@/types/online-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface StoreTemplateSelectorProps {
  onSelectTemplate: (template: StoreTemplate) => void;
}

const categoryIcons = {
  modern: Sparkles,
  classic: Building2,
  bold: Palette,
  professional: Briefcase,
  portfolio: Camera,
};

export const StoreTemplateSelector = ({ onSelectTemplate }: StoreTemplateSelectorProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<StoreTemplate | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

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

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-40 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Store Template</h2>
        <p className="text-muted-foreground">
          Select a design that matches your brand. You can customize everything later.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template) => {
          const Icon = categoryIcons[template.category];
          const isSelected = selectedId === template.id;

          return (
            <Card
              key={template.id}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedId(template.id)}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}

              <CardHeader className="space-y-3 p-0">
                <div className="relative h-48 rounded-t-lg overflow-hidden group">
                  {template.preview_image_url || template.preview_images?.[0] ? (
                    <img
                      src={template.preview_image_url || template.preview_images?.[0]}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${template.template_config.colors.primary}, ${template.template_config.colors.secondary})`,
                      }}
                    >
                      <Icon className="h-12 w-12 text-white/80" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(template);
                        setPreviewImageIndex(0);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                  
                  <CardDescription className="text-sm min-h-[40px]">
                    {template.description}
                  </CardDescription>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {Object.entries(template.template_config.colors)
                        .slice(0, 4)
                        .map(([key, color]) => (
                          <div
                            key={key}
                            className="h-6 w-6 rounded-full border-2 border-border"
                            style={{ backgroundColor: color }}
                            title={key}
                          />
                        ))}
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={!selectedId}
          onClick={() => {
            const selected = templates?.find((t) => t.id === selectedId);
            if (selected) onSelectTemplate(selected);
          }}
        >
          Continue with Selected Template
        </Button>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {previewTemplate?.name}
              {previewTemplate?.is_default && (
                <Badge variant="secondary">Popular</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {previewTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image Preview with Carousel */}
            <div className="relative">
              {previewTemplate && (
                <>
                  {previewTemplate.preview_images && previewTemplate.preview_images.length > 0 ? (
                    <>
                      <div className="relative h-[400px] rounded-lg overflow-hidden bg-muted">
                        <img
                          src={previewTemplate.preview_images[previewImageIndex]}
                          alt={`${previewTemplate.name} preview ${previewImageIndex + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {previewTemplate.preview_images.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur"
                            onClick={() =>
                              setPreviewImageIndex((prev) =>
                                prev === 0 ? previewTemplate.preview_images!.length - 1 : prev - 1
                              )
                            }
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur"
                            onClick={() =>
                              setPreviewImageIndex((prev) =>
                                prev === previewTemplate.preview_images!.length - 1 ? 0 : prev + 1
                              )
                            }
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          
                          <div className="flex justify-center gap-2 mt-4">
                            {previewTemplate.preview_images.map((_, idx) => (
                              <button
                                key={idx}
                                className={`h-2 rounded-full transition-all ${
                                  idx === previewImageIndex
                                    ? 'w-8 bg-primary'
                                    : 'w-2 bg-muted-foreground/30'
                                }`}
                                onClick={() => setPreviewImageIndex(idx)}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : previewTemplate.preview_image_url ? (
                    <div className="h-[400px] rounded-lg overflow-hidden bg-muted">
                      <img
                        src={previewTemplate.preview_image_url}
                        alt={previewTemplate.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      className="h-[400px] rounded-lg flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${previewTemplate.template_config.colors.primary}, ${previewTemplate.template_config.colors.secondary})`,
                      }}
                    >
                      {categoryIcons[previewTemplate.category] && 
                        (() => {
                          const Icon = categoryIcons[previewTemplate.category];
                          return <Icon className="h-24 w-24 text-white/60" />;
                        })()
                      }
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Color Palette */}
            {previewTemplate && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Color Palette</h4>
                <div className="flex gap-3">
                  {Object.entries(previewTemplate.template_config.colors).map(([key, color]) => (
                    <div key={key} className="flex flex-col items-center gap-2">
                      <div
                        className="h-12 w-12 rounded-lg border-2 border-border shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-muted-foreground capitalize">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between gap-3">
              <div>
                {previewTemplate?.demo_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(previewTemplate.demo_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live Demo
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    if (previewTemplate) {
                      setSelectedId(previewTemplate.id);
                      onSelectTemplate(previewTemplate);
                    }
                  }}
                >
                  Select This Template
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
