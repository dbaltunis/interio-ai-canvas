import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Calendar, Package, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ItemStatusToggle, filterInternalNotes, type ItemStatus, type DocumentType } from './ItemStatusToggle';
import { supabase } from '@/integrations/supabase/client';
import type { WorkshopData } from '@/hooks/useWorkshopData';

// Lazy load the actual templates
const WorkshopInformation = React.lazy(() => 
  import('@/components/workroom/templates/WorkshopInformation').then(m => ({ default: m.WorkshopInformation }))
);
const InstallationInstructions = React.lazy(() => 
  import('@/components/workroom/templates/InstallationInstructions').then(m => ({ default: m.InstallationInstructions }))
);
const FittingInstructions = React.lazy(() => 
  import('@/components/workroom/templates/FittingInstructions').then(m => ({ default: m.FittingInstructions }))
);

interface PublicWorkOrderPageProps {
  project: {
    id: string;
    name: string;
    job_number?: string;
    order_number?: string;
    due_date?: string;
    work_order_document_type?: string;
    work_order_content_filter?: { type?: string } | null;
    clients?: {
      name: string;
      phone?: string;
      email?: string;
      address?: string;
    };
  };
  workshopData: WorkshopData | null;
  permissionLevel?: 'view' | 'edit' | 'admin';
  viewerName?: string;
}

// Template loading fallback
const TemplateLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    <span className="ml-2 text-muted-foreground">Loading document...</span>
  </div>
);

export const PublicWorkOrderPage: React.FC<PublicWorkOrderPageProps> = ({ 
  project, 
  workshopData,
  permissionLevel = 'view',
  viewerName
}) => {
  const clientName = project.clients?.name || 'Client';
  const clientPhone = project.clients?.phone;
  const siteAddress = project.clients?.address;
  const installationDate = project.due_date;
  const documentType = (project.work_order_document_type || 'work_order') as DocumentType;
  const contentFilter = (project.work_order_content_filter as any)?.type || 'all';

  // Track status changes in state for real-time UI updates
  const [itemStatuses, setItemStatuses] = useState<Record<string, ItemStatus>>({});

  // Initialize statuses from workshop data
  useEffect(() => {
    if (workshopData) {
      const initialStatuses: Record<string, ItemStatus> = {};
      workshopData.rooms.forEach(room => {
        room.items.forEach(item => {
          initialStatuses[item.id] = (item as any).status || 'pending';
        });
      });
      setItemStatuses(initialStatuses);
    }
  }, [workshopData]);

  // Subscribe to real-time status updates
  useEffect(() => {
    if (!project.id) return;

    const channel = supabase
      .channel(`workshop-status-${project.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workshop_items',
          filter: `project_id=eq.${project.id}`
        },
        (payload) => {
          const { id, status } = payload.new as { id: string; status: ItemStatus };
          setItemStatuses(prev => ({ ...prev, [id]: status }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project.id]);

  const handleStatusChange = (itemId: string, newStatus: ItemStatus) => {
    setItemStatuses(prev => ({ ...prev, [itemId]: newStatus }));
  };

  // Format Google Maps URL
  const mapsUrl = siteAddress 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteAddress)}`
    : null;

  const totalItems = workshopData?.projectTotals?.itemsCount || 0;
  const canEdit = permissionLevel === 'edit' || permissionLevel === 'admin';
  const isReadOnly = !canEdit;

  // Count completed items
  const completedCount = Object.values(itemStatuses).filter(
    s => s === 'installed' || s === 'ready'
  ).length;

  // Get document title based on type
  const getDocumentTitle = () => {
    switch (documentType) {
      case 'installation': return 'Installation Instructions';
      case 'fitting': return 'Fitting Sheet';
      default: return 'Work Order';
    }
  };

  // Filter out internal notes from workshop data
  const filteredWorkshopData = workshopData ? {
    ...workshopData,
    rooms: workshopData.rooms.map(room => ({
      ...room,
      items: room.items.map(item => ({
        ...item,
        notes: filterInternalNotes(item.notes) || undefined,
      }))
    }))
  } : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-lg print:hidden">
        <div className="px-4 py-3 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">{getDocumentTitle()}</p>
              <h1 className="font-bold text-lg">
                {project.job_number || project.order_number || project.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {viewerName && (
                <span className="text-xs opacity-80">
                  Viewing as: {viewerName}
                </span>
              )}
              {completedCount > 0 && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  {completedCount} Done
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {totalItems} Item{totalItems !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Client Info Card - Only show for field documents */}
      {(documentType === 'installation' || documentType === 'fitting') && (
        <div className="px-4 py-4 max-w-4xl mx-auto">
          <Card className="print:hidden">
            <CardContent className="p-4 space-y-3">
              {/* Client & Phone */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-base">{clientName}</p>
                  {clientPhone && (
                    <a 
                      href={`tel:${clientPhone}`}
                      className="flex items-center gap-1 text-primary hover:underline text-sm"
                    >
                      <Phone className="h-4 w-4" />
                      {clientPhone}
                    </a>
                  )}
                </div>
                {installationDate && (
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground flex items-center gap-1 justify-end">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(installationDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                )}
              </div>

              {/* Address */}
              {siteAddress && (
                <a 
                  href={mapsUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 p-2 -mx-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{siteAddress}</span>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content - Render the actual template based on document type */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {filteredWorkshopData ? (
          <Suspense fallback={<TemplateLoader />}>
            {documentType === 'work_order' && (
              <WorkshopInformation
                data={filteredWorkshopData}
                projectId={project.id}
                isPrintMode={false}
                isReadOnly={isReadOnly}
              />
            )}
            {documentType === 'installation' && (
              <InstallationInstructions
                data={filteredWorkshopData}
                projectId={project.id}
                isPrintMode={false}
                isReadOnly={isReadOnly}
              />
            )}
            {documentType === 'fitting' && (
              <FittingInstructions
                data={filteredWorkshopData}
                projectId={project.id}
                isPrintMode={false}
                isReadOnly={isReadOnly}
              />
            )}
          </Suspense>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items in this work order</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-8 print:hidden">
        <p>Shared work order document</p>
      </footer>
    </div>
  );
};
