import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Download, Mail, MoreVertical, Printer, FileCheck, Eye, Filter } from "lucide-react";
import { generateQuotePDF, generateQuotePDFBlob } from "@/utils/generateQuotePDF";
import { PrintableWorkOrder } from "@/components/jobs/workorder/PrintableWorkOrder";
import { WorkOrderPreviewModal } from "@/components/jobs/workorder/WorkOrderPreviewModal";
import { buildWorkOrderData, WorkOrderItem } from "@/utils/workOrderDataBinding";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ActionBar } from "@/components/ui/action-bar";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";

interface WorkOrderTabProps {
  projectId: string;
  quoteId?: string;
}

export const WorkOrderTab = ({ projectId, quoteId }: WorkOrderTabProps) => {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedTreatmentType, setSelectedTreatmentType] = useState<string>('all');
  
  const { data: projects } = useProjects();
  const { data: treatments } = useTreatments(projectId, quoteId);
  const { data: rooms } = useRooms(projectId, quoteId);
  
  const project = projects?.find(p => p.id === projectId);

  // Fetch active work order templates
  const { data: activeTemplates } = useQuery({
    queryKey: ["work-order-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_order_templates")
        .select("*")
        .eq("active", true)
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      
      const validTemplates = (data || []).filter(template => {
        if (!template.blocks) return false;
        if (typeof template.blocks === 'string') return false;
        if (!Array.isArray(template.blocks)) return false;
        if (template.blocks.length === 0) return false;
        return true;
      });
      
      return validTemplates;
    },
  });

  // Set default template
  useEffect(() => {
    if (activeTemplates && activeTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(activeTemplates[0].id.toString());
    }
  }, [activeTemplates, selectedTemplateId]);

  const selectedTemplate = activeTemplates?.find(t => t.id.toString() === selectedTemplateId);

  // Get template settings
  const templateSettings = useMemo(() => {
    const blocks = selectedTemplate?.blocks;
    if (!blocks || typeof blocks === 'string') {
      return {
        showImages: true,
        showDetailedSpecs: true,
        groupByRoom: true,
        showRoomNames: true,
        showMaterials: true,
        showMeasurements: true,
        showCheckpoints: true,
      };
    }
    
    const blocksArray = Array.isArray(blocks) ? blocks : [];
    const itemsBlock = blocksArray.find((b: any) => b?.type === 'workorder-items') as any;
    const docSettings = (blocksArray.find((b: any) => b?.type === 'document-settings') as any)?.content || {};
    
    return {
      showImages: itemsBlock?.content?.showImages ?? true,
      showDetailedSpecs: itemsBlock?.content?.showDetailedSpecs ?? true,
      groupByRoom: itemsBlock?.content?.groupByRoom ?? true,
      showRoomNames: itemsBlock?.content?.showRoomNames ?? true,
      showMaterials: itemsBlock?.content?.showMaterials ?? true,
      showMeasurements: itemsBlock?.content?.showMeasurements ?? true,
      showCheckpoints: itemsBlock?.content?.showCheckpoints ?? true,
      ...docSettings,
    };
  }, [selectedTemplate]);

  // Build work order data
  const workOrderData = useMemo(() => {
    return buildWorkOrderData(
      { ...project, client: project?.clients },
      treatments || [],
      rooms || [],
      templateSettings
    );
  }, [project, treatments, rooms, templateSettings]);

  // Filter items by room and treatment type
  const filteredItems = useMemo(() => {
    let items = workOrderData.items;
    
    if (selectedRoom !== 'all') {
      items = items.filter(item => item.room_name === selectedRoom);
    }
    
    if (selectedTreatmentType !== 'all') {
      items = items.filter(item => item.treatment_type === selectedTreatmentType);
    }
    
    return items;
  }, [workOrderData.items, selectedRoom, selectedTreatmentType]);

  // Get template blocks
  const templateBlocks = useMemo(() => {
    const blocks = selectedTemplate?.blocks;
    if (!blocks) return [];
    if (typeof blocks === 'string') return [];
    return Array.isArray(blocks) ? blocks : [];
  }, [selectedTemplate]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('workorder-live-preview');
    if (!element) {
      toast({
        title: "Error",
        description: "Work order preview not ready",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const filename = `work-order-${project?.job_number || 'WO'}.pdf`;
      await generateQuotePDF(element, { filename });
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = async () => {
    const element = document.getElementById('workorder-live-preview');
    if (!element) {
      toast({
        title: "Error",
        description: "Work order preview not ready",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const blob = await generateQuotePDFBlob(element);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Error",
        description: "Failed to open print preview",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const actionBarActions = [
    {
      id: 'download',
      label: 'Download PDF',
      icon: Download,
      variant: 'default' as const,
      onClick: handleDownloadPDF,
      loading: isGeneratingPDF,
    },
    {
      id: 'print',
      label: 'Print',
      icon: Printer,
      variant: 'outline' as const,
      onClick: handlePrint,
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: Eye,
      variant: 'outline' as const,
      onClick: () => setIsPreviewOpen(true),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {activeTemplates && activeTemplates.length > 0 && (
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <ActionBar actions={actionBarActions} />
          </div>
        </CardContent>
      </Card>

      {/* Filters and Display Options */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4" />
              Filters & Display Options
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Room Filter */}
              <div className="space-y-2">
                <Label htmlFor="room-filter">Filter by Room</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger id="room-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rooms</SelectItem>
                    {workOrderData.rooms.map((room) => (
                      <SelectItem key={room} value={room}>
                        {room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Treatment Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="treatment-filter">Filter by Treatment</Label>
                <Select value={selectedTreatmentType} onValueChange={setSelectedTreatmentType}>
                  <SelectTrigger id="treatment-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Treatments</SelectItem>
                    {workOrderData.treatmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Show Images Toggle */}
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="show-images" className="text-sm">Show Images</Label>
                <Switch
                  id="show-images"
                  checked={templateSettings.showImages}
                  disabled
                />
              </div>

              {/* Group by Room Toggle */}
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="group-by-room" className="text-sm">Group by Room</Label>
                <Switch
                  id="group-by-room"
                  checked={templateSettings.groupByRoom}
                  disabled
                />
              </div>
            </div>

            {/* Active Filters Summary */}
            {(selectedRoom !== 'all' || selectedTreatmentType !== 'all') && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {filteredItems.length} of {workOrderData.items.length} items</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedRoom('all');
                    setSelectedTreatmentType('all');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardContent className="p-6">
          <div 
            id="workorder-live-preview"
            className="bg-white rounded-lg shadow-sm"
          >
            <PrintableWorkOrder
              blocks={templateBlocks}
              workOrderData={{
                ...workOrderData,
                items: filteredItems,
              }}
              isPrintMode={false}
              showDetailedSpecs={templateSettings.showDetailedSpecs}
              showImages={templateSettings.showImages}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <WorkOrderPreviewModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onDownloadPDF={handleDownloadPDF}
        onPrint={handlePrint}
        isGenerating={isGeneratingPDF}
      >
        <PrintableWorkOrder
          blocks={templateBlocks}
          workOrderData={{
            ...workOrderData,
            items: filteredItems,
          }}
          isPrintMode={false}
        />
      </WorkOrderPreviewModal>
    </div>
  );
};
