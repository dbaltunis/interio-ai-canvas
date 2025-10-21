import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/useClients";
import { useUpdateProject } from "@/hooks/useProjects";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, User, Edit, Save, X, Search, Mail, MapPin, Package, FileText, DollarSign, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ClientSearchStep } from "@/components/job-creation/steps/ClientSearchStep";
import { ProductsToOrderSection } from "@/components/jobs/ProductsToOrderSection";
import { ProjectNotesCard } from "../ProjectNotesCard";
import { CompactQuotesSection } from "../quotation/CompactQuotesSection";
import { NewQuoteButton } from "../NewQuoteButton";
import { useQuotes } from "@/hooks/useQuotes";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useTreatments } from "@/hooks/useTreatments";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currency";

interface ProjectDetailsTabProps {
  project: any;
  onUpdate?: (projectData: any) => Promise<void>;
}

export const ProjectDetailsTab = ({ project, onUpdate }: ProjectDetailsTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name || "",
    description: project.description || "",
    priority: project.priority || "medium",
    client_id: project.client_id || null,
    start_date: project.start_date || "",
    due_date: project.due_date || "",
  });

  const { data: clients, refetch: refetchClients } = useClients();
  const { data: jobStatuses = [] } = useJobStatuses();
  const { data: quotes = [] } = useQuotes(project.id);
  const { data: rooms = [] } = useRooms(project.id);
  const { data: surfaces = [] } = useSurfaces(project.id);
  const { data: treatments = [] } = useTreatments(project.id);
  
  // Fetch quote items for the latest quote
  const { data: quoteItems = [] } = useQuery({
    queryKey: ["quote-items", project.id],
    queryFn: async () => {
      if (quotes.length === 0) return [];
      
      const latestQuote = quotes.reduce((latest, quote) => {
        if (!latest) return quote;
        return new Date(quote.created_at) > new Date(latest.created_at) ? quote : latest;
      }, null);
      
      if (!latestQuote) return [];
      
      const { data, error } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", latestQuote.id)
        .order("sort_order", { ascending: true });
      
      if (error) {
        console.error("Error fetching quote items:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: quotes.length > 0,
  });
  const updateProject = useUpdateProject();
  const { toast } = useToast();
  
  const selectedClient = clients?.find(c => c.id === formData.client_id);

  const handleSave = async () => {
    try {
      console.log("Saving project details...", formData);
      
      const updateData = {
        id: project.id,
        name: formData.name,
        description: formData.description,
        priority: formData.priority,
        client_id: formData.client_id,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
      };

      console.log("Sending update with data:", updateData);
      const updatedProject = await updateProject.mutateAsync(updateData);

      console.log("Project updated successfully:", updatedProject);
      
      // Force refresh of clients data to ensure we have the latest
      await refetchClients();
      
      // Update the project object directly to reflect changes immediately
      Object.assign(project, {
        ...formData,
        updated_at: new Date().toISOString()
      });
      
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Project updated successfully",
      });

      // Call the optional onUpdate callback if provided
      if (onUpdate) {
        try {
          await onUpdate(updatedProject);
        } catch (error) {
          console.log("Optional onUpdate callback failed:", error);
          // Don't throw here since the main update succeeded
        }
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: project.name || "",
      description: project.description || "",
      priority: project.priority || "medium",
      client_id: project.client_id || null,
      start_date: project.start_date || "",
      due_date: project.due_date || "",
    });
    setIsEditing(false);
  };

  const updateFormData = (field: string, value: any) => {
    console.log("Updating form field:", field, "with value:", value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientSelection = (clientId: string) => {
    console.log("Client selected from search:", clientId);
    updateFormData("client_id", clientId);
    setShowClientSearch(false);
    
    // Immediately save the client selection
    const updateData = {
      id: project.id,
      client_id: clientId,
    };
    
    updateProject.mutateAsync(updateData).then(() => {
      // Update the project object immediately
      project.client_id = clientId;
      toast({
        title: "Success",
        description: "Client assigned to project",
      });
    }).catch((error) => {
      console.error("Failed to assign client:", error);
      toast({
        title: "Error",
        description: "Failed to assign client. Please try again.",
        variant: "destructive",
      });
    });
  };

  const getStatusColor = (statusName: string) => {
    const statusDetails = jobStatuses.find(
      s => s.name.toLowerCase() === statusName.toLowerCase()
    );
    
    if (statusDetails) {
      const colorMap: Record<string, string> = {
        'gray': 'bg-gray-100 text-gray-800 border-gray-200',
        'blue': 'bg-blue-100 text-blue-800 border-blue-200', 
        'green': 'bg-green-100 text-green-800 border-green-200',
        'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'orange': 'bg-orange-100 text-orange-800 border-orange-200',
        'red': 'bg-red-100 text-red-800 border-red-200',
        'purple': 'bg-primary/10 text-primary border-primary/20',
      };
      return colorMap[statusDetails.color] || 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getClientDisplayName = (client: any) => {
    if (!client) return null;
    
    if (client.client_type === 'B2B' && client.company_name) {
      return client.company_name;
    }
    
    return client.name;
  };

  // Get current active quote value or latest quote, fallback to client deal value
  const getCurrentQuoteDisplay = () => {
    if (quotes.length === 0) {
      // Fallback to client deal value if available
      if (selectedClient?.deal_value && selectedClient.deal_value > 0) {
        return formatCurrency(selectedClient.deal_value) + " (Est.)";
      }
      return "No quote";
    }
    
    // Find the most recent quote or active quote
    const latestQuote = quotes.reduce((latest, quote) => {
      if (!latest) return quote;
      return new Date(quote.created_at) > new Date(latest.created_at) ? quote : latest;
    }, null);
    
    if (!latestQuote || !latestQuote.total_amount) {
      // Fallback to client deal value
      if (selectedClient?.deal_value && selectedClient.deal_value > 0) {
        return formatCurrency(selectedClient.deal_value) + " (Est.)";
      }
      return "No quote value";
    }
    return formatCurrency(latestQuote.total_amount);
  };

  // Get products/services for a room
  const getRoomProducts = (roomId: string) => {
    // First try to get from quote items grouped by room
    const roomQuoteItems = quoteItems.filter(item => {
      // Check if the item has room information in product_details
      const productDetails = typeof item.product_details === 'object' && item.product_details !== null 
        ? item.product_details as any 
        : null;
      return productDetails?.room_id === roomId;
    });
    
    if (roomQuoteItems.length > 0) {
      return roomQuoteItems.map(item => ({
        name: item.name,
        price: item.total_price || 0,
        quantity: item.quantity || 1,
        source: 'quote'
      }));
    }
    
    // Priority 2: Use treatments (ensure consistent data structure and avoid duplicates)
    const roomTreatments = treatments.filter(t => t.room_id === roomId);
    console.log("Using treatments for room:", roomId, roomTreatments);
    
    // Group by window_id to avoid duplicates and use the latest treatment per window
    const treatmentsByWindow = roomTreatments.reduce((acc, t) => {
      if (!acc[t.window_id] || new Date(t.created_at) > new Date(acc[t.window_id].created_at)) {
        acc[t.window_id] = t;
      }
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(treatmentsByWindow).map(t => {
      // Parse pricing from different possible sources
      let price = 0;
      if (t.total_price) {
        price = Number(t.total_price);
      } else if (t.unit_price && t.quantity) {
        price = Number(t.unit_price) * Number(t.quantity);
      }
      
      return {
        name: t.product_name || t.treatment_type || 'Treatment',
        price,
        quantity: Number(t.quantity || 1),
        source: 'treatment'
      };
    });
  };

  // Get total count of products/services
  const getTotalProductsCount = () => {
    if (quoteItems.length > 0) return quoteItems.length;
    return treatments.length;
  };
  
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground">Client & Project Overview</h2>
        <p className="text-sm text-muted-foreground">Manage client assignment and project essentials</p>
      </div>

      {/* Compact Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Client Status - Primary Focus */}
        <div className="sm:col-span-2 bg-primary/5 p-4 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground mb-1">Client</p>
              {selectedClient ? (
                <>
                  <span className="text-lg font-semibold truncate block">{getClientDisplayName(selectedClient)}</span>
                  {selectedClient.email && (
                    <p className="text-xs text-muted-foreground truncate">{selectedClient.email}</p>
                  )}
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No client assigned</span>
              )}
            </div>
            <User className="h-8 w-8 text-primary/60 shrink-0 ml-2" />
          </div>
        </div>
        
        {/* Rooms Count */}
        <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
          <p className="text-xs text-muted-foreground mb-1">Rooms</p>
          <span className="text-2xl font-bold">{rooms.length}</span>
        </div>
        
        {/* Quote Value */}
        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-xs text-muted-foreground mb-1">Quote</p>
          <span className="text-lg font-semibold text-green-600 dark:text-green-400">{getCurrentQuoteDisplay()}</span>
        </div>
      </div>

      {/* Timeline - Compact Single Row with Date Pickers */}
      <div className="p-3 bg-muted/30 rounded-lg border border-muted/50">
        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Timeline:</span>
            
            {/* Start Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2 font-medium hover:bg-accent",
                    !project.start_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {project.start_date ? format(new Date(project.start_date), "PPP") : 'Set start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={project.start_date ? new Date(project.start_date) : undefined}
                  onSelect={async (date) => {
                    if (date) {
                      const dateStr = format(date, "yyyy-MM-dd");
                      try {
                        await updateProject.mutateAsync({
                          id: project.id,
                          start_date: dateStr,
                        });
                        project.start_date = dateStr;
                        setFormData(prev => ({ ...prev, start_date: dateStr }));
                        toast({
                          title: "Success",
                          description: "Start date updated",
                        });
                      } catch (error) {
                        console.error("Failed to update start date:", error);
                        toast({
                          title: "Error",
                          description: "Failed to update start date",
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <span className="text-muted-foreground">→</span>
            
            {/* Due Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2 font-medium hover:bg-accent",
                    !project.due_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {project.due_date ? format(new Date(project.due_date), "PPP") : 'Set due date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={project.due_date ? new Date(project.due_date) : undefined}
                  onSelect={async (date) => {
                    if (date) {
                      const dateStr = format(date, "yyyy-MM-dd");
                      try {
                        await updateProject.mutateAsync({
                          id: project.id,
                          due_date: dateStr,
                        });
                        project.due_date = dateStr;
                        setFormData(prev => ({ ...prev, due_date: dateStr }));
                        toast({
                          title: "Success",
                          description: "Due date updated",
                        });
                      } catch (error) {
                        console.error("Failed to update due date:", error);
                        toast({
                          title: "Error",
                          description: "Failed to update due date",
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Client Assignment - Primary Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Client Assignment
            </CardTitle>
            {selectedClient && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowClientSearch(true)}
              >
                <Search className="h-3 w-3 mr-1" />
                Change Client
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedClient ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {getClientDisplayName(selectedClient)}
                </p>
                {selectedClient.client_type === 'B2B' && selectedClient.name && (
                  <p className="text-xs text-muted-foreground">Contact: {selectedClient.name}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {selectedClient.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs truncate">{selectedClient.email}</span>
                  </div>
                )}
                {selectedClient.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs">📞</span>
                    <span className="text-xs">{selectedClient.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <User className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No client assigned to this project</p>
              <Button onClick={() => setShowClientSearch(true)}>
                <Search className="h-4 w-4 mr-2" />
                Assign Client
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simplified Quotes Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Project Quotation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-sm text-muted-foreground">Current Quote Value</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {getCurrentQuoteDisplay()}
            </p>
            {quotes.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'} created
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <NewQuoteButton projectId={project.id} />
          </div>
        </CardContent>
      </Card>

      {/* Project Notes */}
      <ProjectNotesCard projectId={project.id} />

      {/* Products to Order Section */}
      <ProductsToOrderSection 
        projectId={project.id}
        jobNumber={project.job_number}
        clientName={getClientDisplayName(selectedClient)}
      />

      {/* Client Search Modal */}
      {showClientSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Search or Create Client</h2>
              <Button variant="outline" onClick={() => setShowClientSearch(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ClientSearchStep 
              formData={{ client_id: formData.client_id }}
              updateFormData={(field, value) => {
                if (field === "client_id") {
                  handleClientSelection(value);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
