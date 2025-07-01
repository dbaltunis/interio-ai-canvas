
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SelectedCategoriesInfoProps {
  windowCoveringId: string;
}

export const SelectedCategoriesInfo = ({ windowCoveringId }: SelectedCategoriesInfoProps) => {
  const { data: selectedCategories, isLoading } = useQuery({
    queryKey: ['window-covering-selected-categories', windowCoveringId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('window_covering_option_assignments')
        .select(`
          category_id,
          window_covering_option_categories!inner (
            name,
            description
          )
        `)
        .eq('window_covering_id', windowCoveringId);

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return <Badge variant="outline">Loading...</Badge>;
  }

  if (!selectedCategories || selectedCategories.length === 0) {
    return <Badge variant="secondary">No categories selected</Badge>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      <Badge variant="default" className="text-xs">
        {selectedCategories.length} categories
      </Badge>
      {selectedCategories.slice(0, 3).map((assignment: any) => (
        <Badge key={assignment.category_id} variant="outline" className="text-xs">
          {assignment.window_covering_option_categories.name}
        </Badge>
      ))}
      {selectedCategories.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{selectedCategories.length - 3} more
        </Badge>
      )}
    </div>
  );
};
