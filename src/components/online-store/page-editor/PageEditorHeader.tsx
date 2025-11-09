import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Eye, Sparkles } from "lucide-react";

interface PageEditorHeaderProps {
  onBack: () => void;
  onSave: () => void;
  onPreview: () => void;
  onOptimizeSEO: () => void;
  isSaving: boolean;
}

export const PageEditorHeader = ({ 
  onBack, 
  onSave, 
  onPreview, 
  onOptimizeSEO,
  isSaving 
}: PageEditorHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-b bg-background px-6 py-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Page Editor</h2>
          <p className="text-sm text-muted-foreground">Build SEO-optimized pages</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onOptimizeSEO}>
          <Sparkles className="h-4 w-4 mr-2" />
          AI SEO Optimize
        </Button>
        <Button variant="outline" onClick={onPreview}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save & Publish'}
        </Button>
      </div>
    </div>
  );
};
