import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Building2, Palette, Briefcase, Camera } from "lucide-react";
import { StoreTemplate } from "@/types/online-store";
import { Skeleton } from "@/components/ui/skeleton";

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

  const { data: templates, isLoading } = useQuery({
    queryKey: ['store-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_templates')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data as StoreTemplate[];
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

              <CardHeader className="space-y-3">
                <div
                  className="h-40 rounded-md flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${template.template_config.colors.primary}, ${template.template_config.colors.secondary})`,
                  }}
                >
                  <Icon className="h-12 w-12 text-white/80" />
                </div>

                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {template.is_default && (
                    <Badge variant="secondary" className="text-xs">
                      Popular
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>

                <div className="mt-4 flex gap-2">
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
              </CardContent>
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
    </div>
  );
};
