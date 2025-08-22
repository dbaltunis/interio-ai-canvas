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
import { CalendarDays, User, Edit, Save, X, Search, Mail, MapPin, Package, FileText, DollarSign } from "lucide-react";
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

  // Get current active quote value or latest quote
  const getCurrentQuoteDisplay = () => {
    if (quotes.length === 0) return "No quotes";
    
    // Find the most recent quote or active quote
    const latestQuote = quotes.reduce((latest, quote) => {
      if (!latest) return quote;
      return new Date(quote.created_at) > new Date(latest.created_at) ? quote : latest;
    }, null);
    
    if (!latestQuote || !latestQuote.total_amount) return "No quote value";
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
    
    // Fall back to treatments
    const roomTreatments = treatments.filter(t => t.room_id === roomId);
    return roomTreatments.map(t => ({
      name: t.treatment_type || 'Treatment',
      price: t.total_price || 0,
      quantity: 1,
      source: 'treatment'
    }));
  };

  // Get total count of products/services
  const getTotalProductsCount = () => {
    if (quoteItems.length > 0) return quoteItems.length;
    return treatments.length;
  };
  
  return (
    <div className="space-y-6">
      {/* Project Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Rooms */}
            <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg border border-primary/20 dark:border-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-primary">{rooms.length}</span>
                  <p className="text-sm text-primary/80">Rooms</p>
                </div>
                <Package className="h-8 w-8 text-primary/60" />
              </div>
            </div>
            
            {/* Products & Services */}
            <div className="bg-accent/20 dark:bg-accent/10 p-4 rounded-lg border border-accent/30 dark:border-accent/20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-accent-foreground">{getTotalProductsCount()}</span>
                  <p className="text-sm text-accent-foreground/80">Products & Services</p>
                </div>
                <FileText className="h-8 w-8 text-accent-foreground/60" />
              </div>
            </div>
            
            {/* Current Quote Value */}
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {getCurrentQuoteDisplay()}
                  </span>
                  <p className="text-sm text-green-700 dark:text-green-300">Current Quote</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>
          
          {/* Room Breakdown with Products */}
          {rooms.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Room Breakdown</h4>
              <div className="space-y-2">
                {rooms.length > 0 ? (
                  rooms.slice(0, 3).map((room) => {
                    const roomProducts = getRoomProducts(room.id);
                    const roomTotal = roomProducts.reduce((sum, p) => sum + p.price, 0);
                    return (
                      <div key={room.id} className="p-3 bg-muted/30 dark:bg-muted/20 rounded border border-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{room.name}</span>
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {roomTotal > 0 ? formatCurrency(roomTotal) : "No pricing"}
                          </span>
                        </div>
                        {roomProducts.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {roomProducts.map((product, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {product.name}
                                {product.quantity > 1 && ` (${product.quantity})`}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No products/services added</p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // Show quote items even if no rooms (fallback case)
                  quoteItems.length > 0 && (
                    <div className="p-3 bg-muted/30 dark:bg-muted/20 rounded border border-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Quote Items</span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {getCurrentQuoteDisplay()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {quoteItems.slice(0, 5).map((item, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {item.name}
                            {item.quantity > 1 && ` (${item.quantity})`}
                          </Badge>
                        ))}
                        {quoteItems.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{quoteItems.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                )}
                {rooms.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{rooms.length - 3} more rooms
                  </div>
                )}
                
                {/* Show helpful message if quote total exists but no items */}
                {getCurrentQuoteDisplay() !== "No quotes" && getTotalProductsCount() === 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-800 dark:text-yellow-300">
                      <strong>Note:</strong> Quote total exists ({getCurrentQuoteDisplay()}) but no individual line items are configured. 
                      Consider adding specific products/services to provide detailed breakdowns for clients.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compact Project Timeline Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Project Timeline</span>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Timeline
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={updateProject.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProject.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
          
          {/* Compact Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div>
              <Label htmlFor="start_date" className="text-xs text-muted-foreground">Start Date</Label>
              {isEditing ? (
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateFormData("start_date", e.target.value)}
                  className="mt-1 h-8"
                />
              ) : (
                <div className="mt-1 text-sm font-medium">
                  {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : "Not set"}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="due_date" className="text-xs text-muted-foreground">Due Date</Label>
              {isEditing ? (
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => updateFormData("due_date", e.target.value)}
                  className="mt-1 h-8"
                />
              ) : (
                <div className="mt-1 text-sm font-medium">
                  {formData.due_date ? new Date(formData.due_date).toLocaleDateString() : "Not set"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Client Information Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {selectedClient ? (
            <div className="space-y-3">
              {/* Main Client Info */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="bg-primary/10 p-2 rounded-full shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h3 className="font-semibold text-base">
                        {getClientDisplayName(selectedClient)}
                      </h3>
                      {selectedClient.client_type === 'B2B' && selectedClient.name && selectedClient.company_name && (
                        <p className="text-sm text-muted-foreground">
                          Contact: {selectedClient.name}
                        </p>
                      )}
                    </div>
                    
                    {/* Contact Details - Compact Grid */}
                    <div className="space-y-1">
                      {selectedClient.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{selectedClient.email}</span>
                        </div>
                      )}
                      {selectedClient.phone && (
                        <div className="flex items-center gap-2">
                          <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm">{selectedClient.phone}</span>
                        </div>
                      )}
                      {(selectedClient.address || selectedClient.city || selectedClient.state) && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="text-sm">
                            {selectedClient.address && <div>{selectedClient.address}</div>}
                            {(selectedClient.city || selectedClient.state) && (
                              <div>{selectedClient.city}{selectedClient.city && selectedClient.state && ', '}{selectedClient.state}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Client Type Badge */}
                    <Badge variant="outline" className="text-xs w-fit">
                      {selectedClient.client_type || 'B2C'}
                    </Badge>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowClientSearch(true)}
                    className="flex-1 sm:flex-none"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Change
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      updateFormData("client_id", null);
                      updateProject.mutateAsync({
                        id: project.id,
                        client_id: null,
                      }).then(() => {
                        project.client_id = null;
                        toast({
                          title: "Success",
                          description: "Client removed from project",
                        });
                      });
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
              <User className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No client assigned to this project</p>
              <Button 
                onClick={() => setShowClientSearch(true)}
              >
                <Search className="h-4 w-4 mr-2" />
                Search or Create Client
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Quotes Section with New Quote Button */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Project Quotes
            </CardTitle>
            <NewQuoteButton projectId={project.id} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage quotes for this project. Each quote can have different versions and pricing options for your client's consideration.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <CompactQuotesSection 
            quotes={quotes}
            onSelectQuote={setSelectedQuote}
            onOpenNotes={(quote) => { setSelectedQuote(quote); setNotesOpen(true); }}
          />
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
