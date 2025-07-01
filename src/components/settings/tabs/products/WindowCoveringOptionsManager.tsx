
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useWindowCoveringCategories } from "@/hooks/useWindowCoveringCategories";
import { EmptyOptionsState } from "./options-manager/EmptyOptionsState";
import { OptionsHierarchyDisplay } from "./options-manager/OptionsHierarchyDisplay";
import type { WindowCovering } from "@/hooks/useWindowCoverings";

interface WindowCoveringOptionsManagerProps {
  windowCovering: WindowCovering;
  onBack: () => void;
}

export const WindowCoveringOptionsManager = ({ windowCovering, onBack }: WindowCoveringOptionsManagerProps) => {
  const { categories, isLoading } = useWindowCoveringCategories();

  if (isLoading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Window Coverings
        </Button>
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">
            Manage Options: {windowCovering.name}
          </h3>
          <p className="text-sm text-brand-neutral">
            Configure hierarchical options for this window covering
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <EmptyOptionsState onBack={onBack} />
      ) : (
        <OptionsHierarchyDisplay categories={categories} />
      )}
    </div>
  );
};
