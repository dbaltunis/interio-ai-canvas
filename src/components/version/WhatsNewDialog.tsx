import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WhatsNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReleaseNotes {
  summary: string;
  highlights?: string[];
  newFeatures?: Array<{
    title: string;
    description: string;
  }>;
  improvements?: Array<{
    title: string;
    description: string;
  }>;
  knownIssues?: string[];
}

interface AppVersion {
  id: string;
  version: string;
  version_type: string;
  release_date: string;
  release_notes: ReleaseNotes;
}

export const WhatsNewDialog = ({ open, onOpenChange }: WhatsNewDialogProps) => {
  const [version, setVersion] = useState<AppVersion | null>(null);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    if (open) {
      loadCurrentVersion();
    }
  }, [open]);

  const loadCurrentVersion = async () => {
    try {
      const { data, error } = await supabase
        .from("app_versions")
        .select("*")
        .eq("is_current", true)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      
      // Parse the JSONB release_notes field
      if (data) {
        const parsedVersion: AppVersion = {
          id: data.id,
          version: data.version,
          version_type: data.version_type,
          release_date: data.release_date,
          release_notes: data.release_notes as unknown as ReleaseNotes,
        };
        setVersion(parsedVersion);

        // Check if user has viewed this version
        const { data: viewData } = await supabase
          .from("user_version_views")
          .select("*")
          .eq("version_id", data.id)
          .single();

        setHasViewed(!!viewData);
      }
    } catch (error) {
      console.error("Error loading version:", error);
    }
  };

  const markAsViewed = async () => {
    if (!version) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("user_version_views").insert({
        user_id: user.id,
        version_id: version.id,
      });

      setHasViewed(true);
    } catch (error) {
      console.error("Error marking version as viewed:", error);
    }
  };

  const handleClose = () => {
    if (!hasViewed) {
      markAsViewed();
    }
    onOpenChange(false);
  };

  if (!version) return null;

  const notes = version.release_notes;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-sm font-mono">
            {version.version} — {new Date(version.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 text-[9px] leading-tight font-mono pr-4">
            {/* Summary */}
            <div className="pb-2 border-b border-border/50">
              <p className="text-muted-foreground">{notes.summary}</p>
            </div>

            {/* New Features */}
            {notes.newFeatures && notes.newFeatures.length > 0 && (
              <div>
                <h3 className="font-semibold mb-1.5 text-foreground">NEW</h3>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  {notes.newFeatures.map((feature, index) => (
                    <li key={index}>
                      <span className="font-medium text-foreground">{feature.title}:</span> {feature.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements/Fixes */}
            {notes.improvements && notes.improvements.length > 0 && (
              <div>
                <h3 className="font-semibold mb-1.5 text-foreground">FIXED</h3>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  {notes.improvements.map((improvement, index) => (
                    <li key={index}>
                      <span className="font-medium text-foreground">{improvement.title}:</span> {improvement.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Known Issues */}
            {notes.knownIssues && notes.knownIssues.length > 0 && (
              <div>
                <h3 className="font-semibold mb-1.5 text-foreground">KNOWN ISSUES</h3>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  {notes.knownIssues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-3 border-t">
          <Button size="sm" variant="ghost" onClick={handleClose} className="text-xs">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
