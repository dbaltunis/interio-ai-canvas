import { useState } from "react";
import { Bug, BookOpen, FileText, List } from "lucide-react";
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

interface BugReportDialogProps {
  className?: string;
}

export const BugReportDialog = ({ className }: BugReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showBugForm, setShowBugForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [actualBehavior, setActualBehavior] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  
  const { toast } = useToast();
  const location = useLocation();

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
        app_version: "beta v0.1.1",
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
      setShowBugForm(false);
      setOpen(false);
    } catch (error: any) {
      console.error("Error submitting bug report:", error);
      toast({
        title: "Error",
        description: "Failed to submit bug report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const version = "beta v0.1.1";

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setShowBugForm(false);
      }}>
        <DialogTrigger asChild>
          <div className={`fixed bottom-20 md:bottom-6 right-6 z-40 ${className}`}>
            <Button
              variant="destructive"
              className="h-auto px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex flex-col items-center gap-0.5"
              title="Help & Support"
            >
              <Bug className="h-5 w-5" />
              <span className="text-[10px] font-normal opacity-80">
                {version}
              </span>
            </Button>
          </div>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {!showBugForm ? (
            <>
              <DialogHeader>
                <DialogTitle>Help & Support</DialogTitle>
                <DialogDescription>
                  Choose an option below to get help or report issues
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 mt-6">
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => window.open('https://docs.lovable.dev/', '_blank')}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">Developer Documentation</CardTitle>
                        <CardDescription className="mt-2">
                          Access comprehensive guides, API references, and tutorials
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setShowBugForm(true)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-destructive/10">
                        <FileText className="h-6 w-6 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">Record a Bug</CardTitle>
                        <CardDescription className="mt-2">
                          Report issues, errors, or unexpected behavior
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => {
                    setOpen(false);
                    window.location.href = '/?tab=bug-reports';
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        <List className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">View All Bugs</CardTitle>
                        <CardDescription className="mt-2">
                          See all reported bugs and their status
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Button
                  variant="outline"
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
                <DialogTitle>Report a Bug</DialogTitle>
                <DialogDescription>
                  Help us improve by reporting any issues you encounter. Your feedback is valuable!
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Bug Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of the bug"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="steps">Steps to Reproduce</Label>
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
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actual">Actual Behavior</Label>
                    <Textarea
                      id="actual"
                      value={actualBehavior}
                      onChange={(e) => setActualBehavior(e.target.value)}
                      placeholder="What actually happened?"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowBugForm(false)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Bug Report"}
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
