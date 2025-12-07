import { useState } from "react";
import { LifeBuoy, BookOpen, FileText, Lightbulb, Sparkles, Bug, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { WhatsNewDialog } from "@/components/version/WhatsNewDialog";

type FeedbackType = "bug" | "feature" | "improvement";

interface BugReportDialogProps {
  className?: string;
  /** If true, hides the floating trigger button (for use when triggered externally) */
  hideTrigger?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Controlled open change handler */
  onOpenChange?: (open: boolean) => void;
}

export const BugReportDialog = ({ 
  className, 
  hideTrigger = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange 
}: BugReportDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [actualBehavior, setActualBehavior] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [images, setImages] = useState<string[]>([]);
  
  const { toast } = useToast();
  const location = useLocation();
  
  // Support controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;
  
  // Hide on onboarding pages
  const isOnboardingPage = location.pathname.includes('onboarding');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    
    setUploading(true);
    const files = Array.from(event.target.files);
    const uploadedUrls: string[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload images",
          variant: "destructive",
        });
        return;
      }

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('bug-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('bug-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setImages([...images, ...uploadedUrls]);

      toast({
        title: "Images uploaded",
        description: `${files.length} image(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    try {
      const fileName = imageUrl.split('/bug-images/')[1];
      if (fileName) {
        await supabase.storage.from('bug-images').remove([fileName]);
      }

      setImages(images.filter(url => url !== imageUrl));

      toast({
        title: "Image deleted",
        description: "Image removed successfully.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete image.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to report a bug",
          variant: "destructive",
        });
        return;
      }

      // Capture browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        screenResolution: {
          width: window.screen.width,
          height: window.screen.height,
        },
      };

      const { error } = await supabase.from("bug_reports").insert({
        user_id: user.id,
        title,
        description,
        steps_to_reproduce: stepsToReproduce || null,
        expected_behavior: expectedBehavior || null,
        actual_behavior: actualBehavior || null,
        priority,
        route: location.pathname,
        user_agent: navigator.userAgent,
        browser_info: browserInfo,
        app_version: "v2.3.2",
        images: images.length > 0 ? images : null,
      });

      if (error) throw error;

      toast({
        title: "Bug reported successfully",
        description: "Thank you for helping us improve! We'll review your report soon.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setStepsToReproduce("");
      setExpectedBehavior("");
      setActualBehavior("");
      setPriority("medium");
      setImages([]);
      setShowFeedbackForm(false);
      setFeedbackType("bug");
      setOpen(false);
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const version = "v2.3.1";

  // Floating button hidden - support is accessed via user profile slider
  const showFloatingButton = false;

  const feedbackTypeConfig = {
    bug: {
      title: "Report a Bug",
      description: "Report issues, errors, or unexpected behavior",
      icon: Bug,
      color: "bg-destructive/10 text-destructive",
      submitText: "Submit Bug Report",
    },
    feature: {
      title: "Request a Feature",
      description: "Suggest a new feature or capability",
      icon: Sparkles,
      color: "bg-primary/10 text-primary",
      submitText: "Submit Feature Request",
    },
    improvement: {
      title: "Suggest Improvement",
      description: "Share ideas to improve existing features",
      icon: Lightbulb,
      color: "bg-warning/10 text-warning",
      submitText: "Submit Suggestion",
    },
  };

  const handleSelectFeedbackType = (type: FeedbackType) => {
    setFeedbackType(type);
    setShowFeedbackForm(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setShowFeedbackForm(false);
          setFeedbackType("bug");
        }
      }}>
        {showFloatingButton && (
          <DialogTrigger asChild>
            <div className={`fixed bottom-20 md:bottom-6 right-6 z-40 ${className}`}>
              <Button
                className="h-auto px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex flex-col items-center gap-0.5 bg-primary text-primary-foreground hover:bg-primary/90"
                title="Help & Support"
              >
                <LifeBuoy className="h-5 w-5" />
                <span className="text-[10px] font-normal opacity-90">
                  {version}
                </span>
              </Button>
            </div>
          </DialogTrigger>
        )}

        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {!showFeedbackForm ? (
            <>
              <DialogHeader>
                <DialogTitle>Help & Feedback</DialogTitle>
                <DialogDescription>
                  How can we help you today?
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-3 mt-6">
                {/* Documentation */}
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => window.open('/documentation', '_blank')}
                >
                  <CardHeader className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">Documentation</CardTitle>
                        <CardDescription className="text-sm">
                          Guides and tutorials
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Report Bug */}
                <Card 
                  className="cursor-pointer hover:border-destructive transition-colors"
                  onClick={() => handleSelectFeedbackType("bug")}
                >
                  <CardHeader className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-destructive/10">
                        <Bug className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">Report a Bug</CardTitle>
                        <CardDescription className="text-sm">
                          Something not working? Let us know
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Request Feature */}
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectFeedbackType("feature")}
                >
                  <CardHeader className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">Request a Feature</CardTitle>
                        <CardDescription className="text-sm">
                          Suggest new functionality
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Suggest Improvement */}
                <Card 
                  className="cursor-pointer hover:border-warning transition-colors"
                  onClick={() => handleSelectFeedbackType("improvement")}
                >
                  <CardHeader className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-warning/10">
                        <Lightbulb className="h-5 w-5 text-warning" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">Suggest Improvement</CardTitle>
                        <CardDescription className="text-sm">
                          Ideas to make things better
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setShowWhatsNew(true)}
                >
                  View What's New ({version})
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = feedbackTypeConfig[feedbackType].icon;
                    return <Icon className="h-5 w-5" />;
                  })()}
                  {feedbackTypeConfig[feedbackType].title}
                </DialogTitle>
                <DialogDescription>
                  {feedbackType === "bug" 
                    ? "Help us fix issues by providing details"
                    : feedbackType === "feature"
                    ? "Describe the feature you'd like to see"
                    : "Share your improvement ideas"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      feedbackType === "bug" 
                        ? "Brief description of the issue"
                        : feedbackType === "feature"
                        ? "Name your feature idea"
                        : "What would you improve?"
                    }
                    required
                  />
                </div>

                {feedbackType === "bug" && (
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                        <SelectItem value="medium">Medium - Affects functionality</SelectItem>
                        <SelectItem value="high">High - Major issue</SelectItem>
                        <SelectItem value="critical">Critical - Blocking work</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      feedbackType === "bug"
                        ? "What happened? What were you trying to do?"
                        : feedbackType === "feature"
                        ? "Describe what this feature would do and why it would be useful"
                        : "Describe your improvement idea and how it would help"
                    }
                    rows={4}
                    required
                  />
                </div>

                {feedbackType === "bug" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="steps">Steps to Reproduce (Optional)</Label>
                      <Textarea
                        id="steps"
                        value={stepsToReproduce}
                        onChange={(e) => setStepsToReproduce(e.target.value)}
                        placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expected">Expected Behavior</Label>
                        <Textarea
                          id="expected"
                          value={expectedBehavior}
                          onChange={(e) => setExpectedBehavior(e.target.value)}
                          placeholder="What should happen?"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="actual">Actual Behavior</Label>
                        <Textarea
                          id="actual"
                          value={actualBehavior}
                          onChange={(e) => setActualBehavior(e.target.value)}
                          placeholder="What actually happened?"
                          rows={2}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="images">Screenshots (Optional)</Label>
                  <div className="space-y-3">
                    {images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {images.map((url, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={url} 
                              alt={`Screenshot ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleImageDelete(url)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploading || isSubmitting}
                        className="cursor-pointer text-sm"
                      />
                      {uploading && (
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowFeedbackForm(false)}>
                    Back
                  </Button>
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : feedbackTypeConfig[feedbackType].submitText}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
      <WhatsNewDialog open={showWhatsNew} onOpenChange={setShowWhatsNew} />
    </>
  );
};
