import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Percent, Save, X, TrendingDown, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface InlineMarkupOverrideProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  projectId: string;
  currentMarkup?: number | null;
  defaultMarkup?: number;
}

export const InlineMarkupOverride = ({
  isOpen,
  onClose,
  quoteId,
  projectId,
  currentMarkup,
  defaultMarkup = 0,
}: InlineMarkupOverrideProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(currentMarkup != null);
  const [markupValue, setMarkupValue] = useState<string>(
    currentMarkup != null ? String(currentMarkup) : String(defaultMarkup)
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEnabled(currentMarkup != null);
    setMarkupValue(currentMarkup != null ? String(currentMarkup) : String(defaultMarkup));
  }, [currentMarkup, defaultMarkup]);

  if (!isOpen) return null;

  const numericValue = parseFloat(markupValue) || 0;
  const isDiscount = numericValue < 0;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newValue = enabled ? numericValue : null;
      const { error } = await supabase
        .from('quotes')
        .update({ custom_markup_percentage: newValue } as any)
        .eq('id', quoteId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['quotes'] });
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'quote-versions'
      });

      toast({
        title: enabled ? "Custom Markup Applied" : "Custom Markup Removed",
        description: enabled
          ? `${numericValue >= 0 ? '+' : ''}${numericValue}% markup override applied to this job`
          : "Using global markup settings",
      });
      onClose();
    } catch (error: any) {
      console.error('Error saving markup override:', error);
      toast({
        title: "Error",
        description: "Failed to save markup override",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ custom_markup_percentage: null } as any)
        .eq('id', quoteId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['quotes'] });
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'quote-versions'
      });

      setEnabled(false);
      toast({
        title: "Custom Markup Removed",
        description: "Using global markup settings",
      });
      onClose();
    } catch (error: any) {
      console.error('Error removing markup override:', error);
      toast({
        title: "Error",
        description: "Failed to remove markup override",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Per-Job Markup Override
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Enable custom markup for this job</Label>
            <p className="text-xs text-muted-foreground">
              Overrides global markup. Use negative values for discount.
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="custom-markup" className="text-sm">
                Markup Percentage
              </Label>
              <div className="relative">
                <Input
                  id="custom-markup"
                  type="number"
                  min="-100"
                  max="500"
                  step="0.5"
                  value={markupValue}
                  onChange={(e) => setMarkupValue(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {isDiscount ? (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {Math.abs(numericValue)}% discount on cost
                </Badge>
              ) : numericValue > 0 ? (
                <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {numericValue}% markup on cost
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Selling at cost (0% markup)
                </Badge>
              )}
              {currentMarkup != null && (
                <span className="text-muted-foreground">
                  Previously: {currentMarkup}%
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          {currentMarkup != null && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={isSaving}
            >
              Remove Override
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {isSaving ? "Saving..." : "Apply"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
