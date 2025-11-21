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
          <DialogTitle className="text-lg font-semibold">
            What's New in {version.version}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {new Date(version.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 text-sm pr-4">
            {/* Summary */}
            <div className="pb-4 border-b border-border/30">
              <p className="text-foreground/80 leading-relaxed">{notes.summary}</p>
            </div>

            {/* New Features */}
            {notes.newFeatures && notes.newFeatures.length > 0 && (
              <div>
                <h3 className="text-base font-semibold mb-3 text-foreground flex items-center gap-2">
                  <span className="text-success">✦</span> New Features
                </h3>
                <ul className="space-y-3">
                  {notes.newFeatures.map((feature, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-success mt-1.5 flex-shrink-0">•</span>
                      <div>
                        <span className="font-medium text-foreground">{feature.title}</span>
                        <p className="text-muted-foreground mt-0.5">{feature.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements/Fixes */}
            {notes.improvements && notes.improvements.length > 0 && (
              <div>
                <h3 className="text-base font-semibold mb-3 text-foreground flex items-center gap-2">
                  <span className="text-primary">✦</span> Improvements
                </h3>
                <ul className="space-y-3">
                  {notes.improvements.map((improvement, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                      <div>
                        <span className="font-medium text-foreground">{improvement.title}</span>
                        <p className="text-muted-foreground mt-0.5">{improvement.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Known Issues */}
            {notes.knownIssues && notes.knownIssues.length > 0 && (
              <div>
                <h3 className="text-base font-semibold mb-3 text-foreground flex items-center gap-2">
                  <span className="text-warning">⚠</span> Known Issues
                </h3>
                <ul className="space-y-2">
                  {notes.knownIssues.map((issue, index) => (
                    <li key={index} className="flex gap-2 text-muted-foreground">
                      <span className="mt-1.5 flex-shrink-0">•</span>
                      <span>{issue}</span>
                    </li>
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
