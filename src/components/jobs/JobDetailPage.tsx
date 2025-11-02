import { useState, useMemo } from "react";
import { formatJobNumber } from "@/lib/format-job-number";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Package, FileText, Wrench, Mail, Calendar, Clock, MoreHorizontal, Copy, FileDown, Archive, Trash2, Workflow } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import { useToast } from "@/hooks/use-toast";
import { useProjects, useUpdateProject, useCreateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { ProjectDetailsTab } from "./tabs/ProjectDetailsTab";
import { RoomsTab } from "./tabs/RoomsTab";
import { QuotationTab } from "./tabs/QuotationTab";
import { ProjectMaterialsTab } from "./ProjectMaterialsTab";
import { WorkroomTab } from "./tabs/WorkroomTab";
import { EmailsTab } from "./tabs/EmailsTab";
import { CalendarTab } from "./tabs/CalendarTab";
import { JobStatusDropdown } from "./JobStatusDropdown";
import { JobSkeleton } from "./JobSkeleton";
import { JobNotFound } from "./JobNotFound";
import { useProjectMaterialsUsage } from "@/hooks/useProjectMaterialsUsage";
import { useTreatmentMaterialsStatus } from "@/hooks/useProjectMaterialsStatus";
import { generateQuotePDF } from "@/utils/generateQuotePDF";
import { supabase } from "@/integrations/supabase/client";
import { useJobDuplicates } from "@/hooks/useJobDuplicates";
import { DuplicateJobIndicator } from "./DuplicateJobIndicator";
import { DuplicateJobsSection } from "./DuplicateJobsSection";

interface JobDetailPageProps {
  jobId: string;
  onBack: () => void;
}

export const JobDetailPage = ({ jobId, onBack }: JobDetailPageProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const { data: projects } = useProjects();
  const { data: clients } = useClients();
  const updateProject = useUpdateProject();
  const createProject = useCreateProject();
  const { data: duplicates } = useJobDuplicates(jobId);
  
  // Fetch materials data for badge indicators
  const { data: treatmentMaterials = [] } = useProjectMaterialsUsage(jobId);
  const { data: materialStatusMap = {} } = useTreatmentMaterialsStatus(jobId);

  // Use defensive loading and state management
  const project = projects?.find(p => p.id === jobId);
  const client = project?.client_id ? clients?.find(c => c.id === project.client_id) : null;
  
  // Calculate unprocessed materials count
  const unprocessedMaterialsCount = useMemo(() => {
    return treatmentMaterials.filter(material => {
      const materialId = `${material.itemId}-${material.surfaceId}`;
      const status = materialStatusMap[materialId];
      return !status || status === 'not_processed';
    }).length;
  }, [treatmentMaterials, materialStatusMap]);
  
  // Show loading skeleton while data is being fetched
  if (!projects || projects.length === 0) {
    return <JobSkeleton />;
  }

  // Only show 404 if we've confirmed the project doesn't exist after loading
  if (!project) {
    return <JobNotFound onBack={onBack} />;
  }

  const handleUpdateProject = async (projectData: any) => {
    await updateProject.mutateAsync(projectData);
  };

  const handleDuplicateJob = async () => {
    try {
      if (!project) return;
      
      toast({
        title: "Duplicating job...",
        description: "Please wait while we create a complete copy of all data"
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      console.log('Starting duplication for project:', jobId);
      console.log('Original project data:', project);

      // Create a new project with ALL fields from the original (except IDs and timestamps)
      const newProject = await createProject.mutateAsync({
        name: `${project.name} (Copy)`,
        description: project.description || null,
        client_id: project.client_id || null,
        status_id: project.status_id || null,
        start_date: project.start_date || null,
        due_date: project.due_date || null,
        completion_date: null, // Reset completion date for new job
        priority: project.priority || null,
        funnel_stage: project.funnel_stage || null,
        source: project.source || null,
        parent_job_id: jobId, // Track this is a duplicate
      });

      console.log('New project created:', newProject);

      // STEP 1: Copy all quotes FIRST (rooms need quote_id)
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .eq('project_id', jobId);

      if (quotesError) {
        console.error('Error fetching quotes:', quotesError);
        throw quotesError;
      }

      console.log('Found quotes to copy:', quotes?.length || 0);

      const quoteIdMapping: Record<string, string> = {}; // Map old quote IDs to new ones
      let quoteItemsCopied = 0;
      let manualItemsCopied = 0;

      if (quotes && quotes.length > 0) {
        for (const quote of quotes) {
          const { id: oldQuoteId, project_id, created_at, updated_at, quote_number, ...quoteData } = quote;
          
          const { data: newQuote, error: quoteError } = await supabase
            .from('quotes')
            .insert({ 
              ...quoteData, 
              project_id: newProject.id,
              user_id: user.id,
              // Don't copy quote_number, let it auto-generate
            })
            .select()
            .single();

          if (quoteError) {
            console.error('Error creating quote:', quoteError);
            throw quoteError;
          }

          if (newQuote) {
            quoteIdMapping[oldQuoteId] = newQuote.id;
            console.log(`Created quote: ${newQuote.quote_number || newQuote.id}`);

            // Copy quote items
            const { data: quoteItems, error: quoteItemsError } = await supabase
              .from('quote_items')
              .select('*')
              .eq('quote_id', oldQuoteId);

            if (quoteItemsError) {
              console.error('Error fetching quote items:', quoteItemsError);
              throw quoteItemsError;
            }

            if (quoteItems && quoteItems.length > 0) {
              const itemsToInsert = quoteItems.map((item: any) => {
                const { id, quote_id, created_at, updated_at, ...itemData } = item;
                return { ...itemData, quote_id: newQuote.id };
              });
              
              const { error: insertItemsError } = await supabase
                .from('quote_items')
                .insert(itemsToInsert);

              if (insertItemsError) {
                console.error('Error inserting quote items:', insertItemsError);
                throw insertItemsError;
              }

              quoteItemsCopied += quoteItems.length;
              console.log(`Copied ${quoteItems.length} quote items`);
            }

            // Copy manual quote items
            const { data: manualItems, error: manualItemsError } = await supabase
              .from('manual_quote_items')
              .select('*')
              .eq('quote_id', oldQuoteId);

            if (manualItemsError) {
              console.error('Error fetching manual quote items:', manualItemsError);
              throw manualItemsError;
            }

            if (manualItems && manualItems.length > 0) {
              const manualItemsToInsert = manualItems.map((item: any) => {
                const { id, quote_id, created_at, updated_at, ...itemData } = item;
                return { ...itemData, quote_id: newQuote.id };
              });
              
              const { error: insertManualItemsError } = await supabase
                .from('manual_quote_items')
                .insert(manualItemsToInsert);

              if (insertManualItemsError) {
                console.error('Error inserting manual quote items:', insertManualItemsError);
                throw insertManualItemsError;
              }

              manualItemsCopied += manualItems.length;
              console.log(`Copied ${manualItems.length} manual quote items`);
            }
          }
        }
      }

      // STEP 2: Copy all rooms with surfaces and treatments (now that quotes exist)
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('project_id', jobId);

      if (roomsError) {
        console.error('Error fetching rooms:', roomsError);
        throw roomsError;
      }

      console.log('Found rooms to copy:', rooms?.length || 0);

      const roomIdMapping: Record<string, string> = {}; // Map old room IDs to new ones
      let surfacesCopied = 0;
      let treatmentsCopied = 0;

      if (rooms && rooms.length > 0) {
        for (const room of rooms) {
          const { id: oldRoomId, project_id: _, created_at: __, updated_at: ___, quote_id: oldQuoteId, ...roomData } = room;
          
          // Map the quote_id to the new quote
          const newQuoteId = oldQuoteId ? quoteIdMapping[oldQuoteId] : null;
          
          const { data: newRoom, error: roomError } = await supabase
            .from('rooms')
            .insert({ 
              ...roomData, 
              project_id: newProject.id, 
              quote_id: newQuoteId, // Use the mapped quote_id
              user_id: user.id 
            })
            .select()
            .single();

          if (roomError) {
            console.error('Error creating room:', roomError);
            throw roomError;
          }

          if (newRoom) {
            roomIdMapping[oldRoomId] = newRoom.id;
            console.log(`Created room: ${newRoom.name} (${oldRoomId} -> ${newRoom.id})`);

            // Copy surfaces for this room
            const { data: surfaces, error: surfacesError } = await supabase
              .from('surfaces')
              .select('*')
              .eq('room_id', oldRoomId);

            if (surfacesError) {
              console.error('Error fetching surfaces:', surfacesError);
              throw surfacesError;
            }

            if (surfaces && surfaces.length > 0) {
              const surfacesToInsert = surfaces.map((surface: any) => {
                const { id, room_id, project_id, created_at, updated_at, ...surfaceData } = surface;
                return { 
                  ...surfaceData, 
                  room_id: newRoom.id, 
                  project_id: newProject.id,
                  user_id: user.id 
                };
              });
              
              const { error: insertSurfacesError } = await supabase
                .from('surfaces')
                .insert(surfacesToInsert);

              if (insertSurfacesError) {
                console.error('Error inserting surfaces:', insertSurfacesError);
                throw insertSurfacesError;
              }

              surfacesCopied += surfaces.length;
              console.log(`Copied ${surfaces.length} surfaces for room ${newRoom.name}`);
            }

            // Copy treatments for this room
            const { data: treatments, error: treatmentsError } = await supabase
              .from('treatments')
              .select('*')
              .eq('room_id', oldRoomId);

            if (treatmentsError) {
              console.error('Error fetching treatments:', treatmentsError);
              throw treatmentsError;
            }

            if (treatments && treatments.length > 0) {
              const treatmentsToInsert = treatments.map((treatment: any) => {
                const { id, room_id, project_id, created_at, updated_at, ...treatmentData } = treatment;
                return { 
                  ...treatmentData, 
                  room_id: newRoom.id, 
                  project_id: newProject.id,
                  user_id: user.id
                };
              });
              
              const { error: insertTreatmentsError } = await supabase
                .from('treatments')
                .insert(treatmentsToInsert);

              if (insertTreatmentsError) {
                console.error('Error inserting treatments:', insertTreatmentsError);
                throw insertTreatmentsError;
              }

              treatmentsCopied += treatments.length;
              console.log(`Copied ${treatments.length} treatments for room ${newRoom.name}`);
            }
          }
        }
      }

      // STEP 3: Copy project notes
      const { data: notes, error: notesError } = await supabase
        .from('project_notes')
        .select('*')
        .eq('project_id', jobId);

      if (notesError) {
        console.error('Error fetching notes:', notesError);
        throw notesError;
      }

      console.log('Found notes to copy:', notes?.length || 0);

      if (notes && notes.length > 0) {
        const notesToInsert = notes.map((note: any) => {
          const { id, project_id, created_at, updated_at, ...noteData } = note;
          return { ...noteData, project_id: newProject.id, user_id: user.id };
        });
        
        const { error: insertNotesError } = await supabase
          .from('project_notes')
          .insert(notesToInsert);

        if (insertNotesError) {
          console.error('Error inserting notes:', insertNotesError);
          throw insertNotesError;
        }

        console.log(`Copied ${notes.length} notes`);
      }

      // Success summary
      const summary = [
        `Rooms: ${rooms?.length || 0}`,
        `Surfaces: ${surfacesCopied}`,
        `Treatments: ${treatmentsCopied}`,
        `Quotes: ${quotes?.length || 0}`,
        `Quote Items: ${quoteItemsCopied}`,
        `Manual Items: ${manualItemsCopied}`,
        `Notes: ${notes?.length || 0}`
      ].join(', ');

      console.log('Duplication complete:', summary);

      // Invalidate all relevant queries to refresh data
      const queryClient = (window as any).queryClient;
      if (queryClient) {
        await queryClient.invalidateQueries({ queryKey: ["rooms"] });
        await queryClient.invalidateQueries({ queryKey: ["surfaces"] });
        await queryClient.invalidateQueries({ queryKey: ["treatments"] });
        await queryClient.invalidateQueries({ queryKey: ["quotes"] });
        await queryClient.invalidateQueries({ queryKey: ["projects"] });
      }

      toast({
        title: "✓ Job Duplicated Successfully",
        description: `Copied: ${summary}. Opening new job...`
      });
      
      // Navigate to the new job instead of going back
      window.location.href = `/?tab=projects&jobId=${newProject.id}`;
    } catch (error) {
      console.error('Error duplicating job:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate job. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      const element = document.getElementById('quote-live-preview');
      if (!element) {
        toast({
          title: "Error",
          description: "Quote preview not available. Please switch to the Quote tab first.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Generating PDF...",
        description: "Please wait..."
      });

      const filename = `${project?.job_number || project?.name || 'job'}.pdf`;
      await generateQuotePDF(element, { filename });
      
      toast({
        title: "Success",
        description: "PDF exported successfully"
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleArchiveJob = async () => {
    try {
      if (!project) return;
      
      // Find "Completed" or "Archived" status
      const { data: archivedStatus } = await supabase
        .from("job_statuses")
        .select("id")
        .eq("user_id", project.user_id)
        .eq("category", "Project")
        .eq("is_active", true)
        .ilike("name", "%completed%")
        .order("slot_number", { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (archivedStatus) {
        await updateProject.mutateAsync({
          id: project.id,
          status_id: archivedStatus.id
        });

        toast({
          title: "Success",
          description: "Job archived successfully"
        });
        
        setShowArchiveDialog(false);
        onBack();
      } else {
        toast({
          title: "Info",
          description: "No 'Completed' status found. Create one in Settings to archive jobs.",
          variant: "default"
        });
        setShowArchiveDialog(false);
      }
    } catch (error) {
      console.error('Error archiving job:', error);
      toast({
        title: "Error",
        description: "Failed to archive job. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteJob = async () => {
    try {
      if (!project) return;
      
      setIsDeleting(true);

      // Delete associated rooms and treatments (cascade should handle this, but being explicit)
      const { data: rooms } = await supabase
        .from('rooms')
        .select('id')
        .eq('project_id', jobId);

      if (rooms && rooms.length > 0) {
        const roomIds = rooms.map(r => r.id);
        await supabase.from('treatments').delete().in('room_id', roomIds);
        await supabase.from('rooms').delete().in('id', roomIds);
      }

      // Delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job deleted successfully"
      });
      
      setShowDeleteDialog(false);
      onBack();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const allTabs = [
    { id: "details", label: "Client", mobileLabel: "Client", icon: User },
    { id: "rooms", label: "Rooms & Treatments", mobileLabel: "Rooms", icon: Package },
    { id: "quotation", label: "Quote", mobileLabel: "Quote", icon: FileText },
    { id: "workroom", label: "Workroom", mobileLabel: "Work", icon: Wrench },
    { id: "materials", label: "Materials", mobileLabel: "Materials", icon: Package },
    { id: "emails", label: "Emails", mobileLabel: "Emails", icon: Mail },
    { id: "calendar", label: "Calendar", mobileLabel: "Calendar", icon: Calendar },
  ];

  const mainTabs = allTabs.slice(0, 3);
  const moreTabs = allTabs.slice(3);

  return (
    <div className="h-screen bg-background w-full flex flex-col overflow-hidden">
      {/* Enhanced Header Section - Scrolls away */}
      <div className="bg-gradient-to-r from-card/95 to-card border-b border-border/50 shadow-sm backdrop-blur-sm">
        <div className="px-3 sm:px-6 py-4">
          {/* Single Row Layout */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left Side: Navigation + Client + Job Name */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Jobs</span>
              </Button>
              
              <Separator orientation="vertical" className="h-6 bg-border/60" />
              
              {client && (
                <span className="text-sm font-medium text-muted-foreground truncate">
                  {client.name}
                </span>
              )}
              
              <Separator orientation="vertical" className="h-6 bg-border/60 hidden sm:block" />
              
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate min-w-0 flex items-center gap-2">
                {project.name}
                {duplicates && (
                  <DuplicateJobIndicator 
                    isDuplicate={duplicates.isDuplicate}
                    duplicateCount={duplicates.children.length}
                  />
                )}
              </h1>
            </div>

            {/* Right Side: Status + Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <JobStatusDropdown
                currentStatusId={project.status_id}
                currentStatus={project.status}
                jobType="project"
                jobId={project.id}
                onStatusChange={(newStatus) => {
                  // Status updated via mutation
                }}
              />
              
              <ThreeDotMenu
                items={[
                  {
                    label: 'Duplicate Job',
                    icon: <Copy className="h-4 w-4" />,
                    onClick: handleDuplicateJob
                  },
                  {
                    label: 'Export to PDF',
                    icon: <FileDown className="h-4 w-4" />,
                    onClick: handleExportPDF
                  },
                  {
                    label: 'Workflows',
                    icon: <Workflow className="h-4 w-4" />,
                    onClick: () => {
                      toast({ title: "Workflows", description: "Feature coming soon" });
                    }
                  },
                  {
                    label: 'Archive Job',
                    icon: <Archive className="h-4 w-4" />,
                    onClick: () => setShowArchiveDialog(true),
                    variant: 'warning'
                  },
                  {
                    label: 'Delete Job',
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: () => setShowDeleteDialog(true),
                    variant: 'destructive'
                  }
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Content - Tabs stay sticky */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Standardized Tab Navigation - STICKY */}
          <div className="sticky top-0 z-20 bg-background border-b border-border/50 shadow-sm">
            <div className="px-2 sm:px-4 lg:px-6">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                {/* Desktop: Show all tabs */}
                {allTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const isMaterialsTab = tab.id === "materials";
                  
                  return (
                    <Button
                      key={tab.id}
                      variant="ghost"
                      onClick={() => setActiveTab(tab.id)}
                      className={`hidden lg:flex items-center gap-1.5 px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 rounded-none whitespace-nowrap shrink-0 ${
                        isActive
                          ? "border-primary text-foreground bg-primary/5 font-semibold"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      {isMaterialsTab && unprocessedMaterialsCount > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="ml-1 h-5 min-w-5 px-1.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-xs font-semibold"
                        >
                          {unprocessedMaterialsCount}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
                
                {/* Tablet/Mobile: Main tabs + More dropdown */}
                {mainTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      variant="ghost"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex lg:hidden items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 text-xs sm:text-sm font-medium border-b-2 rounded-none whitespace-nowrap shrink-0 ${
                        isActive
                          ? "border-primary text-foreground bg-primary/5 font-semibold"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.mobileLabel}</span>
                    </Button>
                  );
                })}
                
                {/* More dropdown - only on tablet/mobile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`flex lg:hidden items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 text-xs sm:text-sm font-medium border-b-2 rounded-none whitespace-nowrap shrink-0 ${
                        moreTabs.some(t => t.id === activeTab)
                          ? "border-primary text-foreground bg-primary/5 font-semibold"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/50"
                      }`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span>More</span>
                      {unprocessedMaterialsCount > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="ml-1 h-5 min-w-5 px-1.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-[10px] font-semibold"
                        >
                          {unprocessedMaterialsCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    {moreTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <DropdownMenuItem
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-3 cursor-pointer py-2.5 ${
                            isActive ? "bg-primary/10 text-foreground font-semibold" : ""
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                          {tab.id === "materials" && unprocessedMaterialsCount > 0 && (
                            <Badge 
                              variant="secondary" 
                              className="ml-auto h-5 min-w-5 px-1.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-xs font-semibold"
                            >
                              {unprocessedMaterialsCount}
                            </Badge>
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-background pb-24">
            <div className="p-2 sm:p-4">
              <TabsContent value="details" className="mt-0">
                <div className="space-y-4">
                  {/* Duplicate Jobs Section */}
                  {duplicates && (duplicates.parent || duplicates.children.length > 0 || duplicates.siblings.length > 0) && (
                    <DuplicateJobsSection
                      parent={duplicates.parent}
                      children={duplicates.children}
                      siblings={duplicates.siblings}
                      onJobClick={(newJobId) => {
                        // Navigate to the other job - handled by parent component
                        window.location.href = `/?jobId=${newJobId}`;
                      }}
                    />
                  )}
                  
                  <div className="modern-card p-3 sm:p-6">
                    <ProjectDetailsTab project={project} onUpdate={handleUpdateProject} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rooms" className="mt-0">
                <div className="modern-card p-6">
                  <RoomsTab projectId={jobId} />
                </div>
              </TabsContent>

              <TabsContent value="quotation" className="mt-0">
                <div className="modern-card p-2 sm:p-4 lg:p-6">
                  <QuotationTab projectId={jobId} />
                </div>
              </TabsContent>

              <TabsContent value="materials" className="mt-0">
                <div className="modern-card p-6">
                  <ProjectMaterialsTab projectId={jobId} />
                </div>
              </TabsContent>

              <TabsContent value="workroom" className="mt-0">
                <div className="modern-card p-6">
                  <WorkroomTab projectId={jobId} />
                </div>
              </TabsContent>

              <TabsContent value="emails" className="mt-0">
                <div className="modern-card p-3 sm:p-6">
                  <EmailsTab projectId={jobId} />
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                <div className="modern-card p-6">
                  <CalendarTab projectId={jobId} />
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This action cannot be undone. 
              All rooms, treatments, and associated data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJob}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this job? You can restore it later from the archived jobs list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveJob}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
