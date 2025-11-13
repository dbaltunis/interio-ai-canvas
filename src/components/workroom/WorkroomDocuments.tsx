import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { WorkroomToolbar } from "./WorkroomToolbar";
import { DocumentRenderer } from "./DocumentRenderer";
import { PrintableWorkshop } from "./PrintableWorkshop";
import { WorkshopPreviewModal } from "./WorkshopPreviewModal";
import { useWorkshopData } from "@/hooks/useWorkshopData";
import { generateQuotePDF } from "@/utils/generateQuotePDF";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import "@/styles/print.css";

interface WorkroomDocumentsProps {
  projectId?: string;
}

export const WorkroomDocuments: React.FC<WorkroomDocumentsProps> = ({ projectId }) => {
  const { data, isLoading, error } = useWorkshopData(projectId);
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [template, setTemplate] = useState<string>("workshop-info");
  const [groupByRoom, setGroupByRoom] = useState<boolean>(true);
  const [templateBlocks, setTemplateBlocks] = useState<any[] | undefined>();
  const [templateError, setTemplateError] = useState<string | null>(null);
  
  // Layout state
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [margins, setMargins] = useState<number>(8);
  
  // Filtering state
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedTreatment, setSelectedTreatment] = useState<string>('all');
  
  // Preview & PDF state
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('📄 [WORKROOM DOCS] Data state:', {
      projectId,
      hasData: !!data,
      isLoading,
      error: error?.message,
      dataStructure: data ? {
        hasHeader: !!data.header,
        roomsCount: data.rooms?.length || 0,
        itemsCount: data.projectTotals?.itemsCount || 0
      } : null
    });
  }, [projectId, data, isLoading, error]);

  useEffect(() => {
    // Don't load blocks for built-in templates
    const builtInTemplates = ["workshop-info", "installation", "fitting", "packing-slip", "box-label", "wraps"];
    if (!builtInTemplates.includes(template)) {
      loadTemplateBlocks(template);
    } else {
      setTemplateBlocks(undefined);
    }
  }, [template]);

  const loadTemplateBlocks = async (templateId: string) => {
    setTemplateError(null);
    try {
      console.log('📋 [WORKROOM] Loading template blocks for:', templateId);
      const { data: templateData, error } = await supabase
        .from('quote_templates')
        .select('blocks')
        .eq('id', templateId)
        .maybeSingle();

      if (error) {
        console.error('❌ [WORKROOM] Template load error:', error);
        throw error;
      }
      
      const blocks = Array.isArray(templateData?.blocks) ? templateData.blocks : [];
      console.log('✅ [WORKROOM] Template blocks loaded:', blocks.length);
      setTemplateBlocks(blocks);
    } catch (error) {
      console.error('❌ [WORKROOM] Failed to load template:', error);
      setTemplateError(error instanceof Error ? error.message : 'Failed to load template');
      setTemplateBlocks(undefined);
    }
  };

  // Extract available rooms and treatments for filtering
  const availableRooms = useMemo(() => {
    if (!data?.rooms) return [];
    return data.rooms.map(r => r.roomName).filter(Boolean).sort();
  }, [data]);
  
  const availableTreatments = useMemo(() => {
    if (!data?.rooms) return [];
    const treatments = new Set<string>();
    data.rooms.forEach(room => {
      room.items.forEach(item => {
        if (item.treatmentType) treatments.add(item.treatmentType);
      });
    });
    return Array.from(treatments).sort();
  }, [data]);
  
  // Apply filters to data
  const filteredData = useMemo(() => {
    if (!data) return data;
    
    let filtered = { ...data };
    
    // Filter by room
    if (selectedRoom && selectedRoom !== 'all') {
      filtered.rooms = data.rooms.filter(room => room.roomName === selectedRoom);
    }
    
    // Filter by treatment
    if (selectedTreatment && selectedTreatment !== 'all') {
      filtered.rooms = filtered.rooms.map(room => ({
        ...room,
        items: room.items.filter(item => item.treatmentType === selectedTreatment)
      })).filter(room => room.items.length > 0);
    }
    
    return filtered;
  }, [data, selectedRoom, selectedTreatment]);
  
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedRoom && selectedRoom !== 'all') count++;
    if (selectedTreatment && selectedTreatment !== 'all') count++;
    return count;
  }, [selectedRoom, selectedTreatment]);
  
  const handleClearFilters = () => {
    setSelectedRoom('all');
    setSelectedTreatment('all');
  };
  
  const onPrint = () => {
    window.print();
  };
  
  const handleDownloadPDF = async () => {
    if (!printRef.current || !filteredData) return;
    
    setIsGenerating(true);
    try {
      const projectName = filteredData.header.projectName || 'workshop';
      const orderNumber = filteredData.header.orderNumber || 'document';
      
      await generateQuotePDF(printRef.current, {
        filename: `workshop-${projectName}-${orderNumber}.pdf`,
        margin: 0, // margins handled in component
        imageQuality: 0.98,
        scale: 2,
        orientation: orientation, // Pass the current orientation setting
      });
      
      toast({
        title: "PDF Downloaded",
        description: "Workshop document has been saved successfully.",
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handlePreview = () => {
    setShowPreview(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading workroom data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-destructive/50 bg-destructive/10 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-destructive">Failed to Load Data</h3>
        <p className="text-sm text-muted-foreground">{error.message || 'An error occurred'}</p>
        <p className="text-xs text-muted-foreground">Check console for more details.</p>
      </div>
    );
  }

  // Empty state when no data or filtered out completely
  if (!filteredData || !filteredData.rooms || filteredData.rooms.length === 0) {
    if (activeFiltersCount > 0 && data && data.rooms && data.rooms.length > 0) {
      return (
        <main className="space-y-4">
          <WorkroomToolbar
            selectedTemplate={template}
            onTemplateChange={setTemplate}
            groupByRoom={groupByRoom}
            onToggleGroupBy={() => setGroupByRoom((v) => !v)}
            onPrint={onPrint}
            onPreview={handlePreview}
            onDownloadPDF={handleDownloadPDF}
            isGenerating={isGenerating}
            orientation={orientation}
            onOrientationChange={setOrientation}
            margins={margins}
            onMarginsChange={setMargins}
            selectedRoom={selectedRoom}
            onRoomChange={setSelectedRoom}
            selectedTreatment={selectedTreatment}
            onTreatmentChange={setSelectedTreatment}
            availableRooms={availableRooms}
            availableTreatments={availableTreatments}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={handleClearFilters}
          />
          <div className="flex flex-col items-center justify-center p-12 space-y-4 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-lg font-medium">No items match the current filters</p>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear all filters
            </Button>
          </div>
        </main>
      );
    }
  }
  
  if (!data || !data.rooms || data.rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-6 border-2 border-dashed border-muted-foreground/30 rounded-lg">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">No Workroom Data Available</h3>
          <div className="text-sm text-muted-foreground max-w-md space-y-2">
            <p>To generate workroom documents, you need to:</p>
            <ol className="list-decimal list-inside text-left space-y-1 mt-4">
              <li>Add rooms in the <strong>Rooms & Treatments</strong> tab</li>
              <li>Create surfaces/windows for each room</li>
              <li>Add measurements and treatment details</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="space-y-4">
        <WorkroomToolbar
          selectedTemplate={template}
          onTemplateChange={setTemplate}
          groupByRoom={groupByRoom}
          onToggleGroupBy={() => setGroupByRoom((v) => !v)}
          onPrint={onPrint}
          onPreview={handlePreview}
          onDownloadPDF={handleDownloadPDF}
          isGenerating={isGenerating}
          orientation={orientation}
          onOrientationChange={setOrientation}
          margins={margins}
          onMarginsChange={setMargins}
          selectedRoom={selectedRoom}
          onRoomChange={setSelectedRoom}
          selectedTreatment={selectedTreatment}
          onTreatmentChange={setSelectedTreatment}
          availableRooms={availableRooms}
          availableTreatments={availableTreatments}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={handleClearFilters}
        />

      {templateError && (
        <div className="p-4 border border-warning/50 bg-warning/10 rounded-lg">
          <p className="text-sm text-warning-foreground">
            <strong>Template Error:</strong> {templateError}
          </p>
        </div>
      )}

        <section className="bg-background p-4 md:p-8 rounded-lg overflow-auto">
          <div 
            className={orientation === 'landscape' ? 'w-fit' : 'max-w-[210mm] mx-auto'}
          >
            <div 
              className="bg-white shadow-2xl workshop-printable"
              style={{
                width: orientation === 'landscape' ? '297mm' : '210mm',
                minHeight: orientation === 'landscape' ? '210mm' : '297mm',
              }}
            >
              <div
                style={{
                  padding: `${margins}mm`,
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontSize: '10pt',
                  lineHeight: '1.4',
                  color: '#000000',
                }}
              >
                <DocumentRenderer 
                  template={template} 
                  data={filteredData}
                  blocks={templateBlocks}
                  projectId={projectId}
                  orientation={orientation}
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Hidden printable version for PDF generation */}
        <div className="hidden">
          {filteredData && (
            <PrintableWorkshop
              ref={printRef}
              data={filteredData}
              orientation={orientation}
              margins={margins}
              projectId={projectId}
            />
          )}
        </div>
      </main>
      
      {/* Preview Modal */}
      {filteredData && (
        <WorkshopPreviewModal
          open={showPreview}
          onOpenChange={setShowPreview}
          onDownloadPDF={handleDownloadPDF}
          onPrint={onPrint}
          isGenerating={isGenerating}
        >
          <PrintableWorkshop
            data={filteredData}
            orientation={orientation}
            margins={margins}
          />
        </WorkshopPreviewModal>
      )}
    </>
  );
};
