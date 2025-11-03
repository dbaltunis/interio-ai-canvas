import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WhatsNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReleaseNotes {
  summary: string;
  highlights: string[];
  new_features: Array<{
    title: string;
    description: string;
    category: string;
  }>;
  improvements: Array<{
    title: string;
    description: string;
  }>;
  known_issues: string[];
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
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">What's New</DialogTitle>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="border-warning/50 text-warning">
              {version.version}
            </Badge>
            <Badge variant="secondary">
              {new Date(version.release_date).toLocaleDateString()}
            </Badge>
          </div>
          <DialogDescription className="text-base pt-2">
            {notes.summary}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Highlights */}
            {notes.highlights && notes.highlights.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Highlights
                </h3>
                <ul className="space-y-2">
                  {notes.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* New Features */}
            {notes.new_features && notes.new_features.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  New Features
                </h3>
                <div className="space-y-3">
                  {notes.new_features.map((feature, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium">{feature.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {feature.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {notes.improvements && notes.improvements.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Improvements</h3>
                <div className="space-y-2">
                  {notes.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-sm">{improvement.title}</span>
                        <p className="text-sm text-muted-foreground">{improvement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Known Issues */}
            {notes.known_issues && notes.known_issues.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Known Issues
                </h3>
                <ul className="space-y-2">
                  {notes.known_issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-warning mt-1 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={handleClose}>Got it!</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
